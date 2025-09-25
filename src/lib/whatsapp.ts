// lib/whatsapp.ts
const WHATSAPP_API_URL = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN!

export interface WhatsAppMessage {
  messaging_product: "whatsapp"
  to: string
  type: "text"
  text: {
    body: string
  }
}

export async function sendWhatsAppMessage(
  to: string,
  message: string
): Promise<boolean> {
  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: {
          body: message
        }
      } as WhatsAppMessage)
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('WhatsApp API Error:', errorData)
      return false
    }

    const result = await response.json()
    console.log('WhatsApp message sent:', result)
    return true
  } catch (error) {
    console.error('Error sending WhatsApp message:', error)
    return false
  }
}

// Función para enviar mensaje con imagen (si es necesario en el futuro)
export async function sendWhatsAppMessageWithImage(
  to: string,
  message: string,
  imageUrl: string
): Promise<boolean> {
  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "image",
        image: {
          link: imageUrl
        },
        text: {
          body: message
        }
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('WhatsApp API Error:', errorData)
      return false
    }

    const result = await response.json()
    console.log('WhatsApp message with image sent:', result)
    return true
  } catch (error) {
    console.error('Error sending WhatsApp message with image:', error)
    return false
  }
}

export interface WhatsAppInteractiveMessage {
  messaging_product: "whatsapp"
  to: string
  type: "interactive"
  interactive: {
    type: "button"
    body: {
      text: string
    }
    action: {
      buttons: Array<{
        type: "reply"
        reply: {
          id: string
          title: string
        }
      }>
    }
  }
}

// Función para enviar mensaje interactivo con botones
export async function sendWhatsAppInteractiveMessage(
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<boolean> {
  try {
    const response = await fetch(WHATSAPP_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${WHATSAPP_TOKEN}`,
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
      console.error('WhatsApp API Error (Interactive):', errorData)
      return false
    }

    const result = await response.json()
    console.log('WhatsApp interactive message sent:', result)
    return true
  } catch (error) {
    console.error('Error sending WhatsApp interactive message:', error)
    return false
  }
}
