import { ParsedWebhookData, FlowResponse } from '../whatsapp/types'
import { getTimeBasedGreeting } from '../classifier'
import { sendButtonMessage } from '../whatsapp/sendButtons'

/**
 * Envía el menú principal para cualquier mensaje de texto
 */
export async function sendMainMenuFlow(data: ParsedWebhookData): Promise<FlowResponse> {
  console.log(`👋 Enviando menú principal para ${data.customerName}`)

  const { phoneNumber, customerName } = data
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
    'main'
  )

  return { message: 'Menú principal enviado' }
}
