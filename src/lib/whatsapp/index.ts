// Exportar todas las funciones de WhatsApp - v2
export { parseWebhookPayload } from './parseWebhook'
export { sendTextMessage } from './sendMessage'
export { sendButtonMessage } from './sendButtons'
export { sendListMessage } from './sendList'
export { getWhatsappConfig, validateWhatsappConfig } from './getWhatsappConfig'

// Re-exportar tipos
export type {
  WhatsAppWebhookPayload,
  ParsedWebhookData,
  FlowResponse,
  WhatsAppMessage,
  WhatsAppInteractiveMessage,
  WhatsAppListMessage
} from './types'

// Forzar rebuild completo en Vercel - v3
console.log('WhatsApp module loaded successfully - v3')
