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
