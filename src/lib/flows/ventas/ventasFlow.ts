import { ParsedWebhookData, FlowResponse } from '../../whatsapp/types'
import { isGreeting, isCourtesyMessage, getTimeBasedGreeting, classifyIntent, extractEquipoInteres } from '../../classifier'
import { generateSalesResponse, detectPurchaseIntent } from '../../openai'
import { getPdfText } from '../../pdf-loader'
import { sendTextMessage } from '../../whatsapp/sendMessage'
import { sendButtonMessage } from '../../whatsapp/sendButtons'
import { sendListMessage } from '../../whatsapp/sendList'

/**
 * Maneja el flujo completo de ventas
 */
export async function handleVentasFlow(data: ParsedWebhookData): Promise<FlowResponse> {
  console.log(`🛍️ Procesando flujo de ventas para ${data.customerName}`)

  const { messageText, buttonReplyId, listReplyId, phoneNumber, customerName } = data

  // 1. Si es saludo, enviar menú inicial
  if (isGreeting(messageText)) {
    console.log('👋 Saludo detectado en ventas, enviando menú interactivo...')
    const saludo = getTimeBasedGreeting()
    const mensajeSaludo = customerName !== 'Cliente'
      ? `${saludo} ${customerName}! 👋`
      : `${saludo}! 👋`

    const buttons = [
      { id: 'ventas', title: 'Administracion' },
      { id: 'soporte', title: 'Soporte' },
      { id: 'contabilidad', title: 'Ventas' }
    ]

    await sendButtonMessage(
      phoneNumber,
      `${mensajeSaludo}\n\n¿En qué podemos ayudarte hoy?`,
      buttons,
      'ventas'
    )

    return { message: 'Menú interactivo enviado' }
  }

  // 2. Si es respuesta de botón "ventas" (Administracion), redirigir a WhatsApp de administración
  if (buttonReplyId === 'ventas') {
    console.log('📋 Solicitud de Administración, redirigiendo a WhatsApp...')
    const adminPhone = '595981221166'
    const adminMessage = `¡Perfecto! 🌟\n\nTe voy a conectar con nuestro equipo de Administración.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${adminPhone}\n\n¡Estarán encantados de ayudarte! 😊`
    
    await sendTextMessage(phoneNumber, adminMessage, 'ventas')
    return { message: adminMessage }
  }

  // 3. Si es respuesta de lista
  if (listReplyId) {
    switch (listReplyId) {
      case 'ventas_insumos':
        const insumosMessage = 'Perfecto, ¿qué insumo te interesa? (tips, consumibles, repuestos, etc.)'
        await sendTextMessage(phoneNumber, insumosMessage, 'ventas')
        return { message: insumosMessage }

      case 'ventas_equipos':
        const equiposMessage = 'Genial, ¿qué equipo te interesa? Cuéntame más sobre tus necesidades.'
        await sendTextMessage(phoneNumber, equiposMessage, 'ventas')
        // Continuar con IA para equipos
        return await processEquiposInquiry(messageText, phoneNumber, customerName)
    }
  }

  // 4. Si es mensaje de cortesía (gracias, ok, etc.), responder amigablemente
  if (isCourtesyMessage(messageText)) {
    console.log('💚 Mensaje de cortesía detectado')
    const courtesyResponse = '¡Con gusto! 😊 Si necesitas algo más, aquí estaré para ayudarte. ¡Que tengas un excelente día! ✨'
    await sendTextMessage(phoneNumber, courtesyResponse, 'ventas')
    return { message: courtesyResponse }
  }

  // 5. Si es mensaje de texto normal, procesar con IA
  return await processSalesInquiry(messageText, phoneNumber, customerName)
}

/**
 * Procesa consultas sobre equipos usando IA y catálogo PDF
 */
async function processEquiposInquiry(
  messageText: string,
  phoneNumber: string,
  customerName: string
): Promise<FlowResponse> {
  console.log('🔧 Procesando consulta sobre equipos con IA...')

  try {
    // Verificar si existe el PDF del catálogo
    const pdfExists = await getPdfText('catalogo.pdf').catch(() => false)

    let response: string
    let shouldSaveLead = false
    let leadData: any = undefined

    if (!pdfExists) {
      response = "Hola! Actualmente estoy cargando la información más reciente de nuestro catálogo. Un asesor se pondrá en contacto contigo muy pronto."
    } else {
      // Generar respuesta con IA usando el PDF
      const contextoPDF = await getPdfText('catalogo.pdf')
      response = await generateSalesResponse(messageText, contextoPDF)

      // Detectar interés de compra
      if (detectPurchaseIntent(response)) {
        shouldSaveLead = true
        const equipoInteres = extractEquipoInteres(messageText)
        leadData = {
          nombre: customerName,
          telefono: phoneNumber,
          mensaje: messageText,
          equipo_interes: equipoInteres || undefined
        }
      }
    }

    await sendTextMessage(phoneNumber, response, 'ventas')

    return {
      message: response,
      shouldSaveLead,
      leadData
    }
  } catch (error) {
    console.error('❌ Error procesando equipos:', error)
    const fallbackMessage = "Hola! Me encantaría ayudarte con información sobre nuestros equipos. Un asesor especializado se pondrá en contacto contigo muy pronto."
    await sendTextMessage(phoneNumber, fallbackMessage, 'ventas')
    return { message: fallbackMessage }
  }
}

/**
 * Procesa consultas generales de ventas
 */
async function processSalesInquiry(
  messageText: string,
  phoneNumber: string,
  customerName: string
): Promise<FlowResponse> {
  console.log('💬 Procesando consulta general de ventas...')

  // Clasificar intención del mensaje
  const intent = classifyIntent(messageText)

  let response: string
  let shouldSaveLead = false
  let leadData: any = undefined

  switch (intent) {
    case 'ventas':
      // Re-dirigir al flujo de equipos si menciona equipos
      if (messageText.toLowerCase().includes('equipo') ||
          messageText.toLowerCase().includes('hydrafacial') ||
          messageText.toLowerCase().includes('ultraformer')) {
        return await processEquiposInquiry(messageText, phoneNumber, customerName)
      }

      response = `Hola ${customerName}, gracias por tu interés en nuestros productos. ¿Te gustaría ver información sobre equipos o insumos?`
      break

    default:
      response = `Hola ${customerName}, gracias por tu mensaje. ¿En qué productos específicos estás interesado?`
  }

  await sendTextMessage(phoneNumber, response, 'ventas')

  return {
    message: response,
    shouldSaveLead,
    leadData
  }
}
