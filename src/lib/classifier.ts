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
    'mantenimiento', 'garantía', 'servicio', 'daño', 'dañado', 
    'roto', 'rompio', 'rompió', 'avería', 'averiado', 'defectuoso',
    'averiado', 'descompuesto', 'descompuesta', 'malo', 'mala'
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

// Función para detectar si un mensaje indica inicio de conversación o necesita ayuda
export function isConversationStarter(message: string): boolean {
  const lower = message.toLowerCase().trim()
  
  const starterKeywords = [
    'necesito', 'ayuda', 'quiero', 'busco', 'necesitaba', 'consultar',
    'información', 'info', 'deseo', 'me gustaría', 'quisiera',
    'saben', 'tienen', 'hay', 'disponen', 'pueden', 'podrían'
  ]

  // Si el mensaje es corto y contiene palabras de inicio
  if (lower.length <= 50) {
    return starterKeywords.some(keyword => lower.includes(keyword))
  }
  
  // Si empieza con estas palabras comunes de inicio
  const startsWith = ['necesito', 'ayuda', 'quiero', 'busco', 'saben si', 'tienen']
  return startsWith.some(start => lower.startsWith(start))
}

// Función para detectar mensajes de cortesía, agradecimiento o despedida
export function isCourtesyMessage(message: string): boolean {
  const lower = message.toLowerCase().trim()
  
  // Mensajes extremadamente cortos (1-3 caracteres) son casuales
  if (lower.length <= 3) {
    return true
  }

  const courtesyKeywords = [
    'gracias', 'graciass', 'thanks', 'thank you', 'muchas gracias',
    'ok', 'okay', 'vale', 'perfecto', 'genial', 'excelente',
    'entendido', 'listo', 'de acuerdo', 'dale', 'si', 'sí',
    'chau', 'adiós', 'adios', 'hasta luego', 'nos vemos', 'bye'
  ]

  // Risas y expresiones casuales
  const casualExpressions = [
    'jaja', 'jajaja', 'jajajaja', 'jeje', 'jejeje', 'jiji', 
    'jijiji', 'lol', 'jajá', 'jjj', 'jajaj', 'jajajaj',
    'ah', 'oh', 'uf', 'wow', 'okey', 'dale', 'bueno',
    'mm', 'mmm', 'mmmm', 'ajá', 'aja', 'ehh', 'hmm'
  ]

  // Si el mensaje es corto (<=20 caracteres) y coincide con keywords o expresiones
  if (lower.length <= 20) {
    const allKeywords = [...courtesyKeywords, ...casualExpressions]
    if (allKeywords.some(keyword => lower === keyword || lower.includes(keyword))) {
      return true
    }
  }

  // Detectar patrones de risas repetitivas (ja+, je+, ji+, etc.)
  if (/^(ja)+$/i.test(lower) || /^(je)+$/i.test(lower) || /^(ji)+$/i.test(lower)) {
    return true
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
