import { ParsedWebhookData, FlowResponse } from '../../whatsapp/types'
import { isGreeting, isCourtesyMessage, getTimeBasedGreeting } from '../../classifier'
import { sendTextMessage } from '../../whatsapp/sendMessage'
import { sendButtonMessage } from '../../whatsapp/sendButtons'

/**
 * Maneja el flujo completo de contabilidad
 */
export async function handleContabilidadFlow(data: ParsedWebhookData): Promise<FlowResponse> {
  console.log(`💰 Procesando flujo de contabilidad para ${data.customerName}`)

  const { messageText, buttonReplyId, phoneNumber, customerName } = data

  // 1. Si es saludo, enviar menú inicial
  if (isGreeting(messageText)) {
    console.log('👋 Saludo detectado en contabilidad, enviando menú interactivo...')
    const saludo = getTimeBasedGreeting()
    const mensajeSaludo = customerName !== 'Cliente'
      ? `${saludo} ${customerName}! 👋`
      : `${saludo}! 👋`

    const buttons = [
      { id: 'ventas', title: 'Ventas' },
      { id: 'soporte', title: 'Soporte' },
      { id: 'administracion', title: 'Administración' }
    ]

    await sendButtonMessage(
      phoneNumber,
      `${mensajeSaludo}\n\n¿En qué podemos ayudarte hoy?`,
      buttons,
      'contabilidad'
    )

    return { message: 'Menú interactivo enviado' }
  }

  // 2. Si es respuesta de botón "contabilidad" (Ventas), redirigir a WhatsApp de ventas
  if (buttonReplyId === 'contabilidad') {
    console.log('💼 Solicitud de Ventas, redirigiendo a WhatsApp...')
    const ventasPhone = '595994750076'
    const ventasMessage = `¡Excelente! 🎯\n\nTe voy a conectar con nuestro equipo de Ventas.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${ventasPhone}\n\n¡Te atenderán con mucho gusto! 😊`
    
    await sendTextMessage(phoneNumber, ventasMessage, 'contabilidad')
    return { message: ventasMessage }
  }

  // 3. Si es mensaje de cortesía
  if (isCourtesyMessage(messageText)) {
    console.log('💚 Mensaje de cortesía detectado en contabilidad')
    const courtesyResponse = '¡Con gusto! 😊 Si necesitas algo más, aquí estaré para ayudarte. ¡Que tengas un excelente día! ✨'
    await sendTextMessage(phoneNumber, courtesyResponse, 'contabilidad')
    return { message: courtesyResponse }
  }

  // 4. Si es mensaje de texto normal
  const response = `Hola ${customerName}, gracias por tu mensaje sobre ${messageText.toLowerCase().includes('factura') ? 'facturación' : 'contabilidad'}. Un miembro de nuestro equipo de contabilidad te responderá en breve.`
  await sendTextMessage(phoneNumber, response, 'contabilidad')

  return { message: response }
}
