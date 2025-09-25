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

// Verificar configuración inicial (solo en desarrollo)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Supabase client configurado con:', {
    url: supabaseUrl ? '✅ Presente' : '❌ Faltante',
    serviceKey: supabaseServiceKey ? '✅ Presente' : '❌ Faltante'
  })
}

// Función para guardar leads
export async function saveLead(lead: {
  nombre?: string
  telefono: string
  mensaje: string
  equipo_interes?: string
}) {
  console.log('👥 Intentando guardar lead en Supabase:', {
    nombre: lead.nombre,
    telefono: lead.telefono,
    mensaje: lead.mensaje.substring(0, 50) + '...',
    equipo_interes: lead.equipo_interes
  })

  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select()

  if (error) {
    console.error('❌ Error saving lead:', {
      error: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    throw error
  }

  if (data && data.length > 0) {
    console.log('✅ Lead insertado en Supabase:', {
      id: data[0].id,
      nombre: data[0].nombre,
      telefono: data[0].telefono,
      created_at: data[0].created_at
    })
  }

  return data[0]
}

// Función de diagnóstico para probar la conexión
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase...')

    // Intentar hacer una consulta simple
    const { data, error } = await supabase
      .from('logs')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Error de conexión a Supabase:', {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return false
    }

    console.log('✅ Conexión a Supabase exitosa')
    return true
  } catch (error) {
    console.error('💥 Error crítico probando conexión:', error)
    return false
  }
}

// Función para guardar logs
export async function saveLog(log: {
  telefono: string
  mensaje_entrada: string
  mensaje_salida: string
  tipo_intencion: string
}) {
  console.log('🔍 Intentando guardar log en Supabase:', {
    telefono: log.telefono,
    mensaje_entrada: log.mensaje_entrada.substring(0, 50) + '...',
    mensaje_salida: log.mensaje_salida.substring(0, 50) + '...',
    tipo_intencion: log.tipo_intencion
  })

  const { data, error } = await supabase
    .from('logs')
    .insert([log])
    .select()

  if (error) {
    console.error('❌ Error saving log:', {
      error: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code
    })
    throw error // Lanzar error para que sea capturado en route.ts
  }

  if (data && data.length > 0) {
    console.log('✅ Log insertado en Supabase:', {
      id: data[0].id,
      telefono: data[0].telefono,
      created_at: data[0].created_at
    })
  }

  return data[0]
}

// Función de diagnóstico para probar la conexión
export async function testSupabaseConnection() {
  try {
    console.log('🔍 Probando conexión a Supabase...')

    // Intentar hacer una consulta simple
    const { data, error } = await supabase
      .from('logs')
      .select('count', { count: 'exact', head: true })

    if (error) {
      console.error('❌ Error de conexión a Supabase:', {
        error: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return false
    }

    console.log('✅ Conexión a Supabase exitosa')
    return true
  } catch (error) {
    console.error('💥 Error crítico probando conexión:', error)
    return false
  }
}
