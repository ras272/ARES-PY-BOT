# WhatsApp Bot ARES - Bot de WhatsApp con IA y Base de Conocimiento PDF

Un sistema inteligente que recibe mensajes de WhatsApp, clasifica intenciones automáticamente y responde usando IA con conocimiento de catálogos PDF.

## 🎯 Características

- ✅ **Clasificación automática** de mensajes (ventas, contabilidad, soporte)
- ✅ **Respuestas con IA** usando OpenAI GPT-4o-mini
- ✅ **Base de conocimiento PDF** para respuestas contextuales
- ✅ **Gestión de leads** automática en Supabase
- ✅ **Logging completo** de conversaciones
- ✅ **Integración WhatsApp Cloud API**

## 🏗️ Arquitectura

```
src/
├── app/
│   ├── api/
│   │   └── webhook/
│   │       └── route.ts          # Webhook principal de WhatsApp
│   ├── layout.tsx               # Layout principal
│   └── page.tsx                 # Página de inicio
└── lib/
    ├── supabase.ts              # Cliente y funciones de Supabase
    ├── openai.ts                # Configuración de OpenAI
    ├── whatsapp.ts              # Funciones de WhatsApp API
    ├── pdf-loader.ts            # Lector de PDFs
    └── classifier.ts            # Clasificador de intenciones
```

## 🚀 Configuración e Instalación

### 1. Prerrequisitos

- Node.js 18+
- Cuenta de OpenAI con API key
- Proyecto de Supabase
- WhatsApp Business Account con Cloud API

### 2. Instalación

```bash
# Clonar el proyecto
git clone <url-del-proyecto>
cd whatsapp-bot-ares

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local .env.local
# Editar .env.local con tus credenciales
```

### 3. Configuración de Supabase

#### Crear tablas SQL:

```sql
-- Tabla para leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT,
  telefono TEXT NOT NULL,
  mensaje TEXT,
  equipo_interes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para logs de conversaciones
CREATE TABLE logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  telefono TEXT NOT NULL,
  mensaje_entrada TEXT NOT NULL,
  mensaje_salida TEXT NOT NULL,
  tipo_intencion TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Configurar Storage:

1. Crear un bucket llamado `catalogos`
2. Subir tu archivo `catalogo.pdf` al bucket
3. Configurar políticas de acceso público para lectura

### 4. Configuración de WhatsApp

#### Crear App en Meta for Developers:

1. Ve a [Meta for Developers](https://developers.facebook.com/)
2. Crea una nueva app tipo "Business"
3. Configura WhatsApp en el dashboard
4. Obtén tu `WHATSAPP_TOKEN` y `WHATSAPP_PHONE_ID`

#### Configurar Webhook:

- URL del webhook: `https://tu-dominio.com/api/webhook`
- Token de verificación: Configúralo en `.env.local`
- Eventos a suscribir: `messages`

### 5. Variables de Entorno (.env.local)

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-tu-api-key-de-openai

# Supabase Configuration
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# WhatsApp Cloud API Configuration
WHATSAPP_TOKEN=tu-whatsapp-token
WHATSAPP_PHONE_ID=tu-whatsapp-phone-id
WHATSAPP_VERIFY_TOKEN=tu-token-de-verificacion-webhook
```

### 6. Ejecutar el Proyecto

```bash
# Modo desarrollo
npm run dev

# Build para producción
npm run build
npm start
```

## 📋 Funcionalidades Detalladas

### Clasificador de Intenciones

El sistema clasifica automáticamente los mensajes en tres categorías:

- **Ventas**: Preguntas sobre productos, precios, cotizaciones
- **Contabilidad**: Consultas sobre facturas, pagos, estados de cuenta
- **Soporte**: Problemas técnicos, ayuda, mantenimiento

### Procesamiento de Mensajes de Ventas

1. **Extracción de contexto**: Lee el PDF del catálogo desde Supabase
2. **Generación de respuesta**: Usa OpenAI con el contexto del PDF
3. **Detección de leads**: Identifica interés de compra automáticamente
4. **Guardado de leads**: Almacena información del cliente potencial

### Gestión de PDFs

- **Cache inteligente**: Los PDFs se cachean para mejorar rendimiento
- **Manejo de errores**: Respuestas de fallback si no se puede cargar el PDF
- **Validación**: Verifica existencia de archivos antes del procesamiento

## 🔧 Uso del Sistema

### Webhook URL

El webhook debe estar configurado en WhatsApp Cloud API:

```
POST https://tu-dominio.com/api/webhook
```

### Formato de Mensaje Entrante

```json
{
  "entry": [{
    "changes": [{
      "value": {
        "messages": [{
          "from": "1234567890",
          "text": {
            "body": "Hola, me interesa el precio del láser"
          }
        }],
        "contacts": [{
          "profile": {
            "name": "Juan Pérez"
          }
        }]
      }
    }]
  }]
}
```

## 📊 Monitoreo y Logs

### Logs en Supabase

Todos los mensajes se registran en la tabla `logs` con:
- Teléfono del cliente
- Mensaje de entrada
- Respuesta generada
- Tipo de intención clasificada
- Timestamp

### Logs de Consola

El sistema incluye logging detallado para:
- Recepción de mensajes
- Clasificación de intenciones
- Errores de API
- Envío de respuestas

## 🚨 Manejo de Errores

- **Fallback de respuestas**: Mensajes prediseñados cuando falla la IA
- **Validación de datos**: Verificación de payloads de WhatsApp
- **Timeouts**: Límites de tiempo para llamadas a APIs externas
- **Reintentos**: Reintento automático de envío de mensajes

## 🔐 Seguridad

- Validación de tokens de webhook
- Sanitización de datos de entrada
- Manejo seguro de credenciales
- Logs sin información sensible

## 📈 Extensibilidad

El sistema está diseñado para ser fácilmente extensible:

- Nuevas categorías de intención
- Integración con otros servicios
- Múltiples PDFs por categoría
- Respuestas multimedia
- Integración con CRM

## 🆘 Solución de Problemas

### Problemas Comunes

1. **Webhook no responde**: Verificar configuración de WhatsApp Cloud API
2. **PDF no se carga**: Verificar permisos en Supabase Storage
3. **IA no responde**: Verificar cuota de OpenAI y API key
4. **Mensajes no se envían**: Verificar token de WhatsApp

### Comandos de Debug

```bash
# Ver logs del servidor
npm run dev

# Limpiar cache de PDFs (si es necesario)
# Modificar la función clearPdfCache() en pdf-loader.ts
```

## 📝 Licencia

Este proyecto es privado para ARES Paraguay.

## 🤝 Contribución

Para modificaciones, contactar al equipo de desarrollo.

---

**¡Sistema listo para producción!** 🚀
