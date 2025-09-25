import { WhatsAppWebhookPayload, ParsedWebhookData } from './types'
import { getButtonReplyId, getListReplyId } from '../classifier'

/**
 * Parsea el payload del webhook de WhatsApp y extrae información relevante
 */
export function parseWebhookPayload(payload: WhatsAppWebhookPayload): ParsedWebhookData | null {
  try {
    const entry = payload.entry?.[0]
    const change = entry?.changes?.[0]
    const value = change?.value

    if (!value?.messages?.[0]) {
      console.log('No message found in webhook payload')
      return null
    }

    const message = value.messages[0]
    const contact = value.contacts?.[0]

    // Extraer datos básicos
    const phoneNumber = message.from
    const customerName = contact?.profile?.name || 'Cliente'
    const messageText = message.text?.body || ''
    const phoneNumberId = value.metadata?.phone_number_id || ''

    // Determinar tipo de mensaje
    let messageType: 'text' | 'button_reply' | 'list_reply' = 'text'
    let buttonReplyId: string | undefined
    let listReplyId: string | undefined

    if (message.interactive) {
      if (message.interactive.type === 'button_reply') {
        messageType = 'button_reply'
        buttonReplyId = getButtonReplyId(message)
      } else if (message.interactive.type === 'list_reply') {
        messageType = 'list_reply'
        listReplyId = getListReplyId(message)
      }
    }

    // Determinar canal basado en phone_number_id
    const channel = getChannelFromPhoneId(phoneNumberId)

    console.log(`📨 Mensaje parseado: ${customerName} (${phoneNumber}) - Canal: ${channel} - Tipo: ${messageType}`)

    return {
      phoneNumber,
      customerName,
      messageText,
      messageType,
      buttonReplyId,
      listReplyId,
      phoneNumberId,
      channel
    }
  } catch (error) {
    console.error('❌ Error parsing webhook payload:', error)
    return null
  }
}

/**
 * Determina el canal basado en el phone_number_id
 */
function getChannelFromPhoneId(phoneNumberId: string): 'ventas' | 'soporte' | 'contabilidad' | 'unknown' {
  const ventasPhoneId = process.env.WHATSAPP_PHONE_ID_VENTAS
  const soportePhoneId = process.env.WHATSAPP_PHONE_ID_SOPORTE
  const contabilidadPhoneId = process.env.WHATSAPP_PHONE_ID_CONTABILIDAD

  if (phoneNumberId === ventasPhoneId) return 'ventas'
  if (phoneNumberId === soportePhoneId) return 'soporte'
  if (phoneNumberId === contabilidadPhoneId) return 'contabilidad'

  console.warn(`⚠️ Phone number ID desconocido: ${phoneNumberId}`)
  return 'unknown'
}
