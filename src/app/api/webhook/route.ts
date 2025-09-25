// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { classifyIntent, extractEquipoInteres } from '@/lib/classifier'
import { generateSalesResponse, detectPurchaseIntent } from '@/lib/openai'
import { getPdfText } from '@/lib/pdf-loader'
import { sendWhatsAppMessage } from '@/lib/whatsapp'
import { saveLead, saveLog } from '@/lib/supabase'

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
    let equipoInteres: string | null = null

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
            equipoInteres = extractEquipoInteres(mensajeCliente)
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
    const envioExitoso = await sendWhatsAppMessage(telefono, respuestaFinal)

    if (!envioExitoso) {
      console.error('Error enviando mensaje de respuesta')
      return NextResponse.json({ error: 'Failed to send response' }, { status: 500 })
    }

    // Si es ventas y detectamos interés, guardar lead
    if (intent === 'ventas' && (detectPurchaseIntent(respuestaFinal) || equipoInteres)) {
      try {
        await saveLead({
          nombre: nombreCliente,
          telefono,
          mensaje: mensajeCliente,
          equipo_interes: equipoInteres
        })
        console.log('Lead guardado exitosamente')
      } catch (error) {
        console.error('Error guardando lead:', error)
      }
    }

    // Guardar log de la conversación
    try {
      await saveLog({
        telefono,
        mensaje_entrada: mensajeCliente,
        mensaje_salida: respuestaFinal,
        tipo_intencion: intent
      })
    } catch (error) {
      console.error('Error guardando log:', error)
    }

    console.log(`Respuesta enviada a ${telefono}: ${respuestaFinal.substring(0, 100)}...`)

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('Error processing webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
