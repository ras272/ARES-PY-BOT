// Ejemplo de uso del sistema desde el frontend
// Este archivo muestra cómo podrías integrar el bot en una interfaz web

export interface Lead {
  id: string
  nombre: string
  telefono: string
  mensaje: string
  equipo_interes?: string
  created_at: string
}

export interface LogEntry {
  id: string
  telefono: string
  mensaje_entrada: string
  mensaje_salida: string
  tipo_intencion: string
  created_at: string
}

// Función para obtener leads desde Supabase (ejemplo)
export async function getLeads() {
  try {
    const response = await fetch('/api/leads')
    if (!response.ok) throw new Error('Error fetching leads')
    const data = await response.json()
    return data as Lead[]
  } catch (error) {
    console.error('Error getting leads:', error)
    return []
  }
}

// Función para enviar un mensaje de prueba (útil para testing)
export async function sendTestMessage(message: string) {
  try {
    const response = await fetch('/api/test-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message })
    })

    if (!response.ok) throw new Error('Error sending test message')
    return await response.json()
  } catch (error) {
    console.error('Error sending test message:', error)
    throw error
  }
}

// Función para obtener estadísticas del sistema
export async function getStats() {
  try {
    const response = await fetch('/api/stats')
    if (!response.ok) throw new Error('Error fetching stats')
    return await response.json()
  } catch (error) {
    console.error('Error getting stats:', error)
    return null
  }
}
