// lib/classifier.ts
export type IntentType = "ventas" | "contabilidad" | "soporte"

export function classifyIntent(message: string): IntentType {
  const lower = message.toLowerCase()

  // Palabras clave para ventas
  const ventasKeywords = [
    'precio', 'precios', 'comprar', 'compra', 'cotización', 'cotizar',
    'equipo', 'equipos', 'producto', 'productos', 'catalogo', 'catálogo',
    'demo', 'demostración', 'prueba', 'información', 'info',
    'características', 'beneficios', 'ventas', 'venta'
  ]

  // Palabras clave para contabilidad
  const contabilidadKeywords = [
    'factura', 'facturas', 'pago', 'pagos', 'cobro', 'cobros',
    'recibo', 'recibos', 'deuda', 'deudas', 'saldo', 'saldos',
    'contabilidad', 'contable', 'financiero', 'financiera'
  ]

  // Palabras clave para soporte
  const soporteKeywords = [
    'problema', 'problemas', 'ayuda', 'soporte', 'técnico', 'error',
    'falla', 'fallo', 'no funciona', 'no anda', 'reparación',
    'mantenimiento', 'garantía', 'servicio'
  ]

  // Contar coincidencias
  let ventasScore = 0
  let contabilidadScore = 0
  let soporteScore = 0

  ventasKeywords.forEach(keyword => {
    if (lower.includes(keyword)) ventasScore++
  })

  contabilidadKeywords.forEach(keyword => {
    if (lower.includes(keyword)) contabilidadScore++
  })

  soporteKeywords.forEach(keyword => {
    if (lower.includes(keyword)) soporteScore++
  })

  // Si no hay coincidencias claras, clasificar como soporte
  if (ventasScore === 0 && contabilidadScore === 0 && soporteScore === 0) {
    return "soporte"
  }

  // Retornar la categoría con mayor puntuación
  if (ventasScore >= contabilidadScore && ventasScore >= soporteScore) {
    return "ventas"
  } else if (contabilidadScore >= ventasScore && contabilidadScore >= soporteScore) {
    return "contabilidad"
  } else {
    return "soporte"
  }
}

// Función mejorada para detectar equipo de interés
export function extractEquipoInteres(message: string): string | null {
  const equiposComunes = [
    'láser', 'laser', 'ipl', 'criolipólisis', 'radiofrecuencia',
    'ultracavitación', 'presoterapia', 'microdermoabrasión',
    'hidrafacial', 'led', 'oxígeno', 'oxigeno'
  ]

  const lower = message.toLowerCase()

  for (const equipo of equiposComunes) {
    if (lower.includes(equipo)) {
      return equipo
    }
  }

  return null
}

// Función para detectar si un mensaje es un saludo
export function isGreeting(message: string): boolean {
  const lower = message.toLowerCase().trim()

  const greetingKeywords = [
    'hola', 'buenas', 'buenos días', 'buenas tardes', 'buenas noches',
    'saludos', 'qué tal', 'que tal', 'hey', 'hi', 'hello'
  ]

  return greetingKeywords.some(keyword => lower.includes(keyword))
}

// Función para detectar mensajes de cortesía, agradecimiento o despedida
export function isCourtesyMessage(message: string): boolean {
  const lower = message.toLowerCase().trim()

  const courtesyKeywords = [
    'gracias', 'graciass', 'thanks', 'thank you', 'muchas gracias',
    'ok', 'okay', 'vale', 'perfecto', 'genial', 'excelente',
    'entendido', 'listo', 'de acuerdo', 'dale', 'si', 'sí',
    'chau', 'adiós', 'adios', 'hasta luego', 'nos vemos', 'bye'
  ]

  // Si el mensaje es muy corto y coincide exactamente con alguna keyword
  if (lower.length <= 15) {
    return courtesyKeywords.some(keyword => lower === keyword || lower.includes(keyword))
  }

  return false
}

// Función para obtener saludo según la hora del día (zona horaria de Paraguay)
export function getTimeBasedGreeting(): string {
  try {
    // Zona horaria de Paraguay (America/Asuncion)
    const now = new Date()
    const paraguayTime = new Date(now.toLocaleString("en-US", {timeZone: "America/Asuncion"}))
    const hour = paraguayTime.getHours()

    if (hour >= 5 && hour < 12) {
      return 'Buenos días'
    } else if (hour >= 12 && hour < 19) {
      return 'Buenas tardes'
    } else {
      return 'Buenas noches'
    }
  } catch (error) {
    console.error('Error obteniendo hora:', error)
    return 'Hola' // Fallback
  }
}

// Función para detectar si un mensaje es una respuesta de botón interactivo
export function getButtonReplyId(message: any): string | null {
  try {
    // Verificar si es un mensaje interactivo con button_reply
    if (message?.interactive?.type === 'button_reply') {
      return message.interactive.button_reply.id
    }
    return null
  } catch (error) {
    console.error('Error detectando respuesta de botón:', error)
    return null
  }
}

// Función para detectar si un mensaje es una respuesta de lista interactiva
export function getListReplyId(message: any): string | null {
  try {
    // Verificar si es un mensaje interactivo con list_reply
    if (message?.interactive?.type === 'list_reply') {
      return message.interactive.list_reply.id
    }
    return null
  } catch (error) {
    console.error('Error detectando respuesta de lista:', error)
    return null
  }
}
