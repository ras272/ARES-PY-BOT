// lib/openai.ts
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export { openai }

// Función para generar respuesta de ventas
export async function generateSalesResponse(
  mensajeCliente: string,
  contextoPDF: string
): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Eres un asesor de ventas profesional de ARES Paraguay.
Tu misión es responder consultas sobre equipos médico-estéticos, explicar beneficios y fomentar la venta.
Si el cliente parece interesado, ofrece agendar una demo o hablar con un asesor humano.

Reglas:
- Sé claro, formal y amigable.
- Usa el contexto provisto (PDF).
- Si no encuentras información exacta en el PDF, responde que necesitas consultar con un asesor.
- Nunca inventes precios ni características que no estén en el contexto.
- Responde en español.`
      },
      {
        role: "user",
        content: `Contexto del catálogo:
${contextoPDF}

Pregunta del cliente:
${mensajeCliente}

Por favor, responde como asesor de ventas de ARES Paraguay.`
      }
    ],
    max_tokens: 1000,
    temperature: 0.7
  })

  return completion.choices[0].message.content || "Lo siento, no pude generar una respuesta en este momento."
}

// Función para detectar intención de compra
export function detectPurchaseIntent(respuesta: string): boolean {
  const indicadores = [
    'demo', 'demostración', 'prueba', 'interesado', 'interesa',
    'comprar', 'adquirir', 'cotización', 'precio', 'costo',
    'asesor', 'contactar', 'información', 'detalles'
  ]

  return indicadores.some(indicador =>
    respuesta.toLowerCase().includes(indicador)
  )
}
