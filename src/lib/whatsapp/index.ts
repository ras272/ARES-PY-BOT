// Exportar todas las funciones de WhatsApp
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
  WhatsAppTextMessage,
  WhatsAppInteractiveMessage,
  WhatsAppListMessage
} from './types'

// Log para confirmar carga del módulo
console.log('WhatsApp module loaded successfully')