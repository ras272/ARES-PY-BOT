import { ParsedWebhookData, FlowResponse } from '../../whatsapp/types'
import { isGreeting, isCourtesyMessage, getTimeBasedGreeting } from '../../classifier'
import { sendTextMessage } from '../../whatsapp/sendMessage'
import { sendButtonMessage } from '../../whatsapp/sendButtons'

/**
 * Maneja el flujo completo de soporte
 */
export async function handleSoporteFlow(data: ParsedWebhookData): Promise<FlowResponse> {
  console.log(`🔧 Procesando flujo de soporte para ${data.customerName}`)

  const { messageText, buttonReplyId, phoneNumber, customerName } = data

  // 1. Si es saludo, enviar menú inicial
  if (isGreeting(messageText)) {
    console.log('👋 Saludo detectado en soporte, enviando menú interactivo...')
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
      'soporte'
    )

    return { message: 'Menú interactivo enviado' }
  }

  // 2. Si es respuesta de botón "soporte", redirigir a WhatsApp de soporte
  if (buttonReplyId === 'soporte') {
    console.log('🔧 Solicitud de Soporte, redirigiendo a WhatsApp...')
    const soportePhone = '595981255999'
    const soporteMessage = `¡Perfecto! 🛠️\n\nTe voy a conectar con nuestro equipo de Soporte Técnico.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${soportePhone}\n\n¡Estarán listos para resolver cualquier duda! 😊`
    
    await sendTextMessage(phoneNumber, soporteMessage, 'soporte')
    return { message: soporteMessage }
  }

  // 3. Si es mensaje de cortesía
  if (isCourtesyMessage(messageText)) {
    console.log('💚 Mensaje de cortesía detectado en soporte')
    const courtesyResponse = '¡Con gusto! 😊 Si necesitas algo más, aquí estaré para ayudarte. ¡Que tengas un excelente día! ✨'
    await sendTextMessage(phoneNumber, courtesyResponse, 'soporte')
    return { message: courtesyResponse }
  }

  // 4. Si es mensaje de texto normal
  const response = `Hola ${customerName}, gracias por contactarnos. Actualmente estamos trabajando para brindarte el mejor soporte automatizado. Un agente especializado te contactará pronto para ayudarte con: ${messageText.substring(0, 100)}...`
  await sendTextMessage(phoneNumber, response, 'soporte')

  return { message: response }
}
