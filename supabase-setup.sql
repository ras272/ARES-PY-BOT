-- SQL para configurar las tablas en Supabase
-- Ejecutar en el SQL Editor de Supabase

-- Crear tabla para leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT,
  telefono TEXT NOT NULL,
  mensaje TEXT,
  equipo_interes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla para logs de conversaciones
CREATE TABLE IF NOT EXISTS logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono TEXT NOT NULL,
  mensaje_entrada TEXT NOT NULL,
  mensaje_salida TEXT NOT NULL,
  tipo_intencion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurar RLS (Row Level Security) si es necesario
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso (ajustar según necesidades)
-- CREATE POLICY "Allow all operations for authenticated users" ON leads
--   FOR ALL USING (auth.role() = 'authenticated');

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_leads_telefono ON leads(telefono);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_logs_telefono ON logs(telefono);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);

-- Insertar datos de prueba (opcional)
-- INSERT INTO leads (nombre, telefono, mensaje, equipo_interes)
-- VALUES ('Juan Pérez', '595981123456', 'Me interesa el precio del láser IPL', 'láser');
