// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { classifyIntent, extractEquipoInteres } from '@/lib/classifier'
import { generateSalesResponse, detectPurchaseIntent } from '@/lib/openai'
import { getPdfText } from '@/lib/pdf-loader'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { saveLead, saveLog, testSupabaseConnection } from '@/lib/supabase'

// Variable para controlar que el test de conexión se ejecute solo una vez
let connectionTested = false

// Configuración para el webhook de WhatsApp
export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  // Verificación del webhook
  const mode = request.nextUrl.searchParams.get('hub.mode')
  const token = request.nextUrl.searchParams.get('hub.verify_token')
  const challenge = request.nextUrl.searchParams.get('hub.challenge')

  // Verificar token (deberías usar un token personalizado)
  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    console.log('Webhook verified successfully')
    return new NextResponse(challenge)
  } else {
    return new NextResponse('Forbidden', { status: 403 })
  }
}

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
