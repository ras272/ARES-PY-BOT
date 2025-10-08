import { WhatsAppConfig } from './types'

/**
 * Obtiene la configuración de WhatsApp (phoneId y token) según el canal
 */
export function getWhatsappConfig(channel: string): WhatsAppConfig {
  // Si el canal es unknown, usar ventas como fallback
  const actualChannel = channel === 'unknown' ? 'ventas' : channel

  const configs = {
    ventas: {
      phoneId: process.env.WHATSAPP_PHONE_ID_VENTAS || process.env.WHATSAPP_PHONE_ID || '',
      token: process.env.WHATSAPP_TOKEN_VENTAS || process.env.WHATSAPP_TOKEN || ''
    },
    soporte: {
      phoneId: process.env.WHATSAPP_PHONE_ID_SOPORTE || process.env.WHATSAPP_PHONE_ID || '',
      token: process.env.WHATSAPP_TOKEN_SOPORTE || process.env.WHATSAPP_TOKEN || ''
    },
    contabilidad: {
      phoneId: process.env.WHATSAPP_PHONE_ID_CONTABILIDAD || process.env.WHATSAPP_PHONE_ID || '',
      token: process.env.WHATSAPP_TOKEN_CONTABILIDAD || process.env.WHATSAPP_TOKEN || ''
    },
    unknown: {
      phoneId: process.env.WHATSAPP_PHONE_ID || '',
      token: process.env.WHATSAPP_TOKEN || ''
    }
  }

  const config = configs[actualChannel as keyof typeof configs] || configs.ventas

  if (!config.phoneId || !config.token) {
    console.error(`❌ Configuración incompleta para canal ${actualChannel} (original: ${channel})`)
  }

  return config
}

/**
 * Valida que la configuración de WhatsApp esté completa
 */
export function validateWhatsappConfig(channel: string): boolean {
  const config = getWhatsappConfig(channel)

  if (!config.phoneId || !config.token) {
    console.error(`❌ Configuración faltante para canal ${channel}:`, {
      phoneId: config.phoneId ? '✅' : '❌',
      token: config.token ? '✅' : '❌'
    })
    return false
  }

  console.log(`✅ Configuración válida para canal ${channel}`)
  return true
}
