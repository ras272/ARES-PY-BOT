// app/api/webhook/route.ts - Orquestador principal del bot de WhatsApp (versión refactorizada)
import { NextRequest, NextResponse } from 'next/server'
import { parseWebhookPayload } from '@/lib/whatsapp/parseWebhook'
import { sendMainMenuFlow } from '@/lib/flows'
import { saveLead, saveLog, testSupabaseConnection } from '@/lib/supabase'

// Variable para controlar que el test de conexión se ejecute solo una vez
let connectionTested = false

// Configuración para el webhook de WhatsApp
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    // 1. Probar conexión a Supabase solo la primera vez
    if (!connectionTested) {
      connectionTested = true
      await testSupabaseConnection()
    }

    // 2. Parsear el payload del webhook
    const body = await request.json()
    const parsedData = parseWebhookPayload(body)

    if (!parsedData) {
      console.log('❌ No se pudo parsear el mensaje del webhook')
      return NextResponse.json({ status: 'no_message' })
    }

    console.log(`📨 Mensaje procesado - Tipo: ${parsedData.messageType}`)

    // 3. Enviar menú principal siempre para cualquier mensaje de texto
    let flowResponse

    // Si es respuesta de botón/lista, procesar flow específico
    if (parsedData.buttonReplyId || parsedData.listReplyId) {
      if (parsedData.buttonReplyId === 'ventas' || parsedData.listReplyId?.includes('ventas')) {
        const { handleVentasFlow } = await import('@/lib/flows/ventas')
        flowResponse = await handleVentasFlow(parsedData)
      } else if (parsedData.buttonReplyId === 'soporte' || parsedData.listReplyId?.includes('soporte')) {
        const { handleSoporteFlow } = await import('@/lib/flows/soporte')
        flowResponse = await handleSoporteFlow(parsedData)
      } else if (parsedData.buttonReplyId === 'administracion' || parsedData.listReplyId?.includes('administracion')) {
        const { handleVentasFlow: ventasFlow } = await import('@/lib/flows/ventas')
        flowResponse = await ventasFlow(parsedData)
      } else {
        // Si es cualquier otro botón, procesar con ventas por defecto
        const { handleVentasFlow: defaultFlow } = await import('@/lib/flows/ventas')
        flowResponse = await defaultFlow(parsedData)
      }
    } else {
      // Si es texto normal, siempre mostrar menú principal
      flowResponse = await sendMainMenuFlow(parsedData)
    }

    // 4. Guardar lead si es necesario
    if (flowResponse.shouldSaveLead && flowResponse.leadData) {
      console.log('🎯 Guardando lead detectado...')
      try {
        await saveLead(flowResponse.leadData)
        console.log('✅ Lead guardado exitosamente')
      } catch (error) {
        console.error('❌ Error guardando lead:', error)
      }
    }

    // 5. Guardar log de la conversación (SIEMPRE)
    console.log('💾 Guardando log de conversación...')
    try {
      const logData = {
        telefono: parsedData.phoneNumber,
        mensaje_entrada: parsedData.messageText,
        mensaje_salida: flowResponse.message,
        tipo_intencion: getIntentType(parsedData, flowResponse.message),
        canal: parsedData.channel
      }
      console.log('📋 Datos del log a guardar:', logData)
      await saveLog(logData)
      console.log('🎉 Proceso de webhook completado exitosamente')
    } catch (error) {
      console.error('💥 Error CRÍTICO guardando log:', error)
    }

    return NextResponse.json({ status: 'success' })

  } catch (error) {
    console.error('💥 Error general procesando webhook:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * Determina el tipo de intención basado en los datos parseados y respuesta
 */
function getIntentType(data: any, response: string): string {
  if (data.buttonReplyId) return data.buttonReplyId
  if (data.listReplyId) return data.listReplyId
  if (response.includes('Menú interactivo enviado')) return 'menu_principal'
  if (response.includes('Menú de lista enviado')) return 'menu_lista'

  // Para texto normal, siempre indicar que es menú principal
  return 'menu_principal'
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
