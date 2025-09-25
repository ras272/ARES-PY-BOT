// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Función para guardar leads
export async function saveLead(lead: {
  nombre?: string
  telefono: string
  mensaje: string
  equipo_interes?: string
}) {
  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select()

  if (error) {
    console.error('Error saving lead:', error)
    throw error
  }

  return data[0]
}

// Función para guardar logs
export async function saveLog(log: {
  telefono: string
  mensaje_entrada: string
  mensaje_salida: string
  tipo_intencion: string
}) {
  const { error } = await supabase
    .from('logs')
    .insert([log])

  if (error) {
    console.error('Error saving log:', error)
  }
}
