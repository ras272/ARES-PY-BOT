import { WhatsAppInteractiveMessage } from './types'
import { getWhatsappConfig } from './getWhatsappConfig'

/**
 * Envía un mensaje interactivo con botones (menú inicial)
 */
export async function sendButtonMessage(
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>,
  channel: string = 'unknown'
): Promise<boolean> {
  try {
    const config = getWhatsappConfig(channel)
    const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${config.phoneId}/messages`

    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${config.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text: bodyText
          },
          action: {
            buttons: buttons.map(button => ({
              type: "reply",
              reply: {
                id: button.id,
                title: button.title
              }
            }))
          }
        }
      } as WhatsAppInteractiveMessage)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`❌ WhatsApp API Error (buttons, ${channel}):`, errorData)
      return false
    }

    const result = await response.json()
    console.log(`✅ Botones enviados (${channel}):`, result)
    return true
  } catch (error) {
    console.error(`💥 Error enviando botones (${channel}):`, error)
    return false
  }
}
