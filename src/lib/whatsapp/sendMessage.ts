import { WhatsAppTextMessage } from './types'
import { getWhatsappConfig } from './getWhatsappConfig'

/**
 * Envía un mensaje de texto simple por WhatsApp
 */
export async function sendTextMessage(
  to: string,
  message: string,
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
        type: "text",
        text: {
          body: message
        }
      } as WhatsAppTextMessage)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error(`❌ WhatsApp API Error (${channel}):`, errorData)
      return false
    }

    const result = await response.json()
    console.log(`✅ Mensaje enviado (${channel}):`, result)
    return true
  } catch (error) {
    console.error(`💥 Error enviando mensaje (${channel}):`, error)
    return false
  }
}
