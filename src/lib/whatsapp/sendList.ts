import { WhatsAppListMessage } from './types'
import { getWhatsappConfig } from './getWhatsappConfig'

/**
 * Envía un mensaje interactivo con lista desplegable
 */
export async function sendListMessage(
  to: string,
  headerText: string,
  bodyText: string,
  buttonText: string,
  sections: Array<{
    title: string
    rows: Array<{
      id: string
      title: string
      description: string
    }>
  }>,
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
          type: "list",
          header: {
            type: "text",
            text: headerText
          },
          body: {
            text: bodyText
          },
          action: {
            button: buttonText,
            sections: sections
          }
        }
      } as WhatsAppListMessage)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`❌ WhatsApp API Error (list, ${channel}):`, errorData)
      return false
    }

    const result = await response.json()
    console.log(`✅ Lista enviada (${channel}):`, result)
    return true
  } catch (error) {
    console.error(`💥 Error enviando lista (${channel}):`, error)
    return false
  }
}
