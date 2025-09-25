// Interfaces para WhatsApp Webhook y respuestas
export interface WhatsAppWebhookPayload {
  entry: Array<{
    changes: Array<{
      value: {
        messages?: WhatsAppMessage[]
        contacts?: WhatsAppContact[]
        metadata?: {
          phone_number_id: string
        }
      }
    }>
  }>
}

export interface WhatsAppMessage {
  id: string
  from: string
  text?: {
    body: string
  }
  interactive?: {
    type: 'button_reply' | 'list_reply'
    button_reply?: {
      id: string
      title: string
    }
    list_reply?: {
      id: string
      title: string
      description?: string
    }
  }
  timestamp: string
  type: 'text' | 'interactive'
}

export interface WhatsAppTextMessage {
  messaging_product: "whatsapp"
  to: string
  type: "text"
  text: {
    body: string
  }
}

export interface WhatsAppContact {
  profile: {
    name: string
  }
}

export interface ParsedWebhookData {
  phoneNumber: string
  customerName: string
  messageText: string
  messageType: 'text' | 'button_reply' | 'list_reply'
  buttonReplyId: string | null
  listReplyId: string | null
  phoneNumberId: string
  channel: 'ventas' | 'soporte' | 'contabilidad' | 'unknown'
}

export interface WhatsAppConfig {
  phoneId: string
  token: string
}

export interface FlowResponse {
  message: string
  shouldSaveLead?: boolean
  leadData?: {
    nombre: string
    telefono: string
    mensaje: string
    equipo_interes?: string
  }
}

export interface WhatsAppInteractiveMessage {
  messaging_product: "whatsapp"
  to: string
  type: "interactive"
  interactive: {
    type: "button" | "list"
    body: {
      text: string
    }
    action: {
      buttons?: Array<{
        type: "reply"
        reply: {
          id: string
          title: string
        }
      }>
    }
  }
}

export interface WhatsAppListMessage {
  messaging_product: "whatsapp"
  to: string
  type: "interactive"
  interactive: {
    type: "list"
    header?: {
      type: "text"
      text: string
    }
    body: {
      text: string
    }
    footer?: {
      text: string
    }
    action: {
      button: string
      sections: Array<{
        title: string
        rows: Array<{
          id: string
          title: string
          description?: string
        }>
      }>
    }
  }
}
