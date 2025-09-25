import { ParsedWebhookData, FlowResponse } from '../../whatsapp'
import { isGreeting, getTimeBasedGreeting } from '../../classifier'
import { sendTextMessage, sendButtonMessage } from '../../whatsapp'

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
      { id: 'ventas', title: 'Ver Productos' },
      { id: 'soporte', title: 'Soporte' },
      { id: 'contabilidad', title: 'Contabilidad' }
    ]

    await sendButtonMessage(
      phoneNumber,
      `${mensajeSaludo}\n\n¿En qué podemos ayudarte hoy?`,
      buttons,
      'contabilidad'
    )

    return { message: 'Menú interactivo enviado' }
  }

  // 2. Si es respuesta de botón "contabilidad"
  if (buttonReplyId === 'contabilidad') {
    const response = `Hola ${customerName}, gracias por tu mensaje sobre contabilidad. Un miembro de nuestro equipo de contabilidad te responderá en breve.`
    await sendTextMessage(phoneNumber, response, 'contabilidad')
    return { message: response }
  }

  // 3. Si es mensaje de texto normal
  const response = `Hola ${customerName}, gracias por tu mensaje sobre ${messageText.toLowerCase().includes('factura') ? 'facturación' : 'contabilidad'}. Un miembro de nuestro equipo de contabilidad te responderá en breve.`
  await sendTextMessage(phoneNumber, response, 'contabilidad')

  return { message: response }
}
