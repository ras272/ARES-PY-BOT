// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { classifyIntent, extractEquipoInteres, isGreeting, getTimeBasedGreeting, getButtonReplyId } from '@/lib/classifier'
import { generateSalesResponse, detectPurchaseIntent } from '@/lib/openai'
import { getPdfText } from '@/lib/pdf-loader'
import { sendWhatsAppMessage, sendWhatsAppInteractiveMessage } from '@/lib/whatsapp'
import { saveLead, saveLog, testSupabaseConnection } from '@/lib/supabase'

// Variable para controlar que el test de conexión se ejecute solo una vez
let connectionTested = false

// Configuración para el webhook de WhatsApp
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // Probar conexión a Supabase solo la primera vez
    if (!connectionTested) {
      connectionTested = true
      await testSupabaseConnection()
    }

    const body = await request.json()

    // Extraer información del mensaje
    const mensaje = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0]
    const contacto = body.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]

    if (!mensaje || !contacto) {
      console.log('No message or contact found in webhook payload')
      return NextResponse.json({ status: 'no_message' })
    }

    const mensajeCliente = mensaje.text?.body || ''
    const telefono = mensaje.from
    const nombreCliente = contacto.profile?.name || 'Cliente'

    console.log(`Mensaje recibido de ${nombreCliente} (${telefono}): ${mensajeCliente}`)

    // Verificar si es una respuesta de botón interactivo
    const buttonReplyId = getButtonReplyId(mensaje)
    if (buttonReplyId) {
      console.log(`🎯 Respuesta de botón detectada: ${buttonReplyId}`)

      let respuestaBoton = ''
      switch (buttonReplyId) {
        case 'ventas':
          respuestaBoton = 'Perfecto, cuéntame qué producto te interesa.'
          break
        case 'soporte':
          respuestaBoton = 'Por favor, indícame el modelo o número de serie de tu equipo.'
          break
        case 'contabilidad':
          respuestaBoton = 'Por favor, indícame si es sobre factura, pago o estado de cuenta.'
          break
        default:
          respuestaBoton = 'Opción no reconocida. ¿En qué podemos ayudarte?'
      }

      console.log('📤 Enviando respuesta de botón...')
      const envioExitoso = await sendWhatsAppMessage(telefono, respuestaBoton)

      if (!envioExitoso) {
        console.error('❌ Error enviando respuesta de botón')
        return NextResponse.json({ error: 'Failed to send button response' }, { status: 500 })
      } else {
        console.log('✅ Respuesta de botón enviada exitosamente')
      }

      // Guardar log de la interacción con botón
      try {
        const logData = {
          telefono,
          mensaje_entrada: `Botón: ${buttonReplyId}`,
          mensaje_salida: respuestaBoton,
          tipo_intencion: buttonReplyId
        }
        console.log('📋 Datos del log de botón a guardar:', logData)
        await saveLog(logData)
        console.log('🎉 Log de botón guardado exitosamente')
      } catch (error) {
        console.error('💥 Error guardando log de botón:', error)
      }

      return NextResponse.json({ status: 'success' })
    }

    // Verificar si es un saludo
    if (isGreeting(mensajeCliente)) {
      console.log('👋 Saludo detectado, enviando menú interactivo...')

      // Obtener saludo según la hora
      const saludo = getTimeBasedGreeting()
      const mensajeSaludo = nombreCliente !== 'Cliente'
        ? `${saludo} ${nombreCliente}! 👋`
        : `${saludo}! 👋`

      // Enviar saludo con menú interactivo
      const buttons = [
        { id: 'ventas', title: 'Ventas' },
        { id: 'soporte', title: 'Soporte' },
        { id: 'contabilidad', title: 'Contabilidad' }
      ]

      console.log('📤 Enviando saludo con menú interactivo...')
      const envioExitoso = await sendWhatsAppInteractiveMessage(
        telefono,
        `${mensajeSaludo}\n\n¿En qué podemos ayudarte hoy?`,
        buttons
      )

      if (!envioExitoso) {
        console.error('❌ Error enviando menú interactivo')
        // Fallback: enviar mensaje de texto simple
        const fallbackMessage = `${mensajeSaludo}\n\nEscribe:\n• "ventas" para información de productos\n• "soporte" para ayuda técnica\n• "contabilidad" para consultas financieras`
        await sendWhatsAppMessage(telefono, fallbackMessage)
      } else {
        console.log('✅ Menú interactivo enviado exitosamente')
      }

      // Guardar log del saludo
      try {
        const logData = {
          telefono,
          mensaje_entrada: mensajeCliente,
          mensaje_salida: 'Menú interactivo enviado',
          tipo_intencion: 'saludo'
        }
        console.log('📋 Datos del log de saludo a guardar:', logData)
        await saveLog(logData)
        console.log('🎉 Log de saludo guardado exitosamente')
      } catch (error) {
        console.error('💥 Error guardando log de saludo:', error)
      }

      return NextResponse.json({ status: 'success' })
    }

    // Si no es saludo ni botón, continuar con el flujo normal
    console.log('🔄 Continuando con flujo normal de IA/clasificación...')

    // Clasificar la intención del mensaje
    const intent = classifyIntent(mensajeCliente)
    console.log(`Intención clasificada: ${intent}`)

    let respuestaFinal = ''
    let equipoInteres: string | undefined = undefined

    // Procesar según la intención
    switch (intent) {
      case 'ventas':
        try {
          // Verificar si existe el PDF del catálogo
          const pdfExists = await getPdfText('catalogo.pdf').catch(() => false)

          if (!pdfExists) {
            respuestaFinal = "Hola! Actualmente estoy cargando la información más reciente de nuestro catálogo. Un asesor se pondrá en contacto contigo muy pronto."
          } else {
            // Generar respuesta con IA
            const contextoPDF = await getPdfText('catalogo.pdf')
            respuestaFinal = await generateSalesResponse(mensajeCliente, contextoPDF)

            // Detectar equipo de interés
            equipoInteres = extractEquipoInteres(mensajeCliente) || undefined
          }
        } catch (error) {
          console.error('Error procesando mensaje de ventas:', error)
          respuestaFinal = "Hola! Me encantaría ayudarte con información sobre nuestros equipos. Un asesor especializado se pondrá en contacto contigo muy pronto."
        }
        break

      case 'contabilidad':
        respuestaFinal = `Hola ${nombreCliente}, gracias por tu mensaje sobre ${mensajeCliente.toLowerCase().includes('factura') ? 'facturación' : 'contabilidad'}. Un miembro de nuestro equipo de contabilidad te responderá en breve.`
        break

      case 'soporte':
        respuestaFinal = `Hola ${nombreCliente}, gracias por contactarnos. Actualmente estamos trabajando para brindarte el mejor soporte automatizado. Un agente especializado te contactará pronto para ayudarte con: ${mensajeCliente.substring(0, 100)}...`
        break
    }

    // Enviar respuesta por WhatsApp
    console.log('📤 Enviando respuesta por WhatsApp...')
    const envioExitoso = await sendWhatsAppMessage(telefono, respuestaFinal)

    if (!envioExitoso) {
      console.error('❌ Error enviando mensaje de respuesta')
      // Continuar guardando el log incluso si el envío falló
    } else {
      console.log('✅ Respuesta enviada exitosamente por WhatsApp')
    }

    // Si es ventas y detectamos interés, guardar lead
    if (intent === 'ventas' && (detectPurchaseIntent(respuestaFinal) || equipoInteres)) {
      console.log('🎯 Detectado interés de compra, guardando lead...')
      try {
        const leadData = {
          nombre: nombreCliente || undefined,
          telefono,
          mensaje: mensajeCliente,
          equipo_interes: equipoInteres || undefined
        }
        console.log('📋 Datos del lead a guardar:', leadData)
        await saveLead(leadData)
      } catch (error) {
        console.error('❌ Error guardando lead:', error)
      }
    }

    // Guardar log de la conversación (SIEMPRE se ejecuta)
    console.log('💾 Guardando log de conversación...')
    try {
      const logData = {
        telefono,
        mensaje_entrada: mensajeCliente,
        mensaje_salida: respuestaFinal,
        tipo_intencion: intent
      }
      console.log('📋 Datos del log a guardar:', logData)
      const logResult = await saveLog(logData)
      console.log('🎉 Proceso de webhook completado exitosamente')
    } catch (error) {
      console.error('💥 Error CRÍTICO guardando log:', error)
      // No lanzamos el error para no romper el webhook, pero lo logueamos
    }

    console.log(`Respuesta enviada a ${telefono}: ${respuestaFinal.substring(0, 100)}...`)

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Función GET para verificación de webhook (WhatsApp) y prueba de Supabase
export async function GET(request: NextRequest) {
  // Verificar si es una petición de verificación de WhatsApp
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  // Si tiene parámetros de WhatsApp, es verificación de webhook
  if (mode === 'subscribe') {
    // Verificar token
    if (token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('✅ Webhook verified successfully')
      return new NextResponse(challenge)
    } else {
      console.log('❌ Webhook verification failed - invalid token')
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // Si no tiene parámetros de WhatsApp, es petición de prueba de Supabase
  try {
    console.log('🧪 Endpoint de prueba de Supabase llamado')

    const isConnected = await testSupabaseConnection()

    if (isConnected) {
      return NextResponse.json({
        status: 'success',
        message: 'Conexión a Supabase exitosa',
        timestamp: new Date().toISOString()
      })
    } else {
      return NextResponse.json({
        status: 'error',
        message: 'Error de conexión a Supabase',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

  } catch (error) {
    console.error('💥 Error en endpoint de prueba:', error)
    return NextResponse.json({
      status: 'error',
      message: 'Error interno del servidor',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
