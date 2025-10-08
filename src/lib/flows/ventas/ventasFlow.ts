import { ParsedWebhookData, FlowResponse } from '../../whatsapp/types'
import { isGreeting, isCourtesyMessage, getTimeBasedGreeting, classifyIntent, extractEquipoInteres } from '../../classifier'
import { generateSalesResponse, detectPurchaseIntent } from '../../openai'
import { getPdfText } from '../../pdf-loader'
import { sendTextMessage } from '../../whatsapp/sendMessage'
import { sendButtonMessage } from '../../whatsapp/sendButtons'
import { sendListMessage } from '../../whatsapp/sendList'

/**
 * Maneja el flujo completo de ventas
 */
export async function handleVentasFlow(data: ParsedWebhookData): Promise<FlowResponse> {
  console.log(`🛍️ Procesando flujo de ventas para ${data.customerName}`)

  const { messageText, buttonReplyId, listReplyId, phoneNumber, customerName } = data

  // 1. Si es saludo, enviar menú inicial
  if (isGreeting(messageText)) {
    console.log('👋 Saludo detectado en ventas, enviando menú interactivo...')
    const saludo = getTimeBasedGreeting()
    const mensajeSaludo = customerName !== 'Cliente'
      ? `${saludo} ${customerName}! 👋`
      : `${saludo}! 👋`

    const buttons = [
      { id: 'ventas', title: 'Ventas' },
      { id: 'soporte', title: 'Soporte' },
      { id: 'administracion', title: 'Administración' }
    ]

    await sendButtonMessage(
      phoneNumber,
      `${mensajeSaludo}\n\n¿En qué podemos ayudarte hoy?`,
      buttons,
      'ventas'
    )

    return { message: 'Menú interactivo enviado' }
  }

  // 2. Si es respuesta de botón "ventas", enviar lista de opciones de ventas
  if (buttonReplyId === 'ventas') {
    console.log('💼 Solicitud de Ventas, enviando lista de opciones...')
    const sections = [
      {
        title: "Opciones de Ventas",
        rows: [
          {
            id: "ventas_tecnologia_medica",
            title: "Tecnología Médica",
            description: "Equipos y soluciones médicas"
          },
          {
            id: "ventas_cosmetica",
            title: "Cosmética",
            description: "Productos y equipos cosméticos"
          },
          {
            id: "volver_menu",
            title: "⬅️ Volver al menú",
            description: "Regresar al menú principal"
          }
        ]
      }
    ]

    await sendListMessage(
      phoneNumber,
      "Selecciona una opción",
      "¿Qué tipo de productos te interesan?",
      "Ver opciones",
      sections,
      'ventas'
    )

    return { message: 'Lista de ventas enviada' }
  }

  // 3. Si es respuesta de botón "soporte", enviar lista de opciones de soporte
  if (buttonReplyId === 'soporte') {
    console.log('🔧 Solicitud de Soporte, enviando lista de opciones...')
    const sections = [
      {
        title: "Opciones de Soporte",
        rows: [
          {
            id: "soporte_servicio_tecnico",
            title: "Servicio Técnico",
            description: "Reparaciones y mantenimiento"
          },
          {
            id: "soporte_pedidos_insumos",
            title: "Pedidos de Insumos",
            description: "Tips, consumibles, repuestos"
          },
          {
            id: "soporte_hablar_agente",
            title: "Hablar con un Agente",
            description: "Contacto directo con soporte"
          },
          {
            id: "volver_menu",
            title: "⬅️ Volver al menú",
            description: "Regresar al menú principal"
          }
        ]
      }
    ]

    await sendListMessage(
      phoneNumber,
      "Selecciona una opción",
      "¿En qué podemos ayudarte?",
      "Ver opciones",
      sections,
      'ventas'
    )

    return { message: 'Lista de soporte enviada' }
  }

  // 4. Si es respuesta de botón "administracion", redirigir a WhatsApp
  if (buttonReplyId === 'administracion') {
    console.log('📋 Solicitud de Administración, redirigiendo a WhatsApp...')
    const adminPhone = '595981221166'
    const adminMessage = `¡Perfecto! 🌟\n\nTe voy a conectar con nuestro equipo de Administración.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${adminPhone}\n\n¡Estarán encantados de ayudarte! 😊`
    
    await sendTextMessage(phoneNumber, adminMessage, 'ventas')
    return { message: adminMessage }
  }

  // 5. Si es respuesta de lista
  if (listReplyId) {
    switch (listReplyId) {
      case 'ventas_tecnologia_medica':
        const tecMedicaPhone = '595994750076'
        const tecMedicaMessage = `¡Excelente elección! 🏥\n\nTe voy a conectar con nuestro equipo de Tecnología Médica.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${tecMedicaPhone}\n\n¡Te brindarán toda la información que necesitas! 😊`
        await sendTextMessage(phoneNumber, tecMedicaMessage, 'ventas')
        return { message: tecMedicaMessage }

      case 'ventas_cosmetica':
        const cosmeticaPhone = '595994750076'
        const cosmeticaMessage = `¡Excelente elección! 💄\n\nTe voy a conectar con nuestro equipo de Cosmética.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${cosmeticaPhone}\n\n¡Te brindarán toda la información que necesitas! 😊`
        await sendTextMessage(phoneNumber, cosmeticaMessage, 'ventas')
        return { message: cosmeticaMessage }

      case 'soporte_servicio_tecnico':
        const tecnicoPhone = '595981255999'
        const tecnicoMessage = `¡Perfecto! 🛠️\n\nTe voy a conectar con nuestro equipo de Servicio Técnico.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${tecnicoPhone}\n\n¡Te ayudarán con cualquier problema técnico! 😊`
        await sendTextMessage(phoneNumber, tecnicoMessage, 'ventas')
        return { message: tecnicoMessage }

      case 'soporte_pedidos_insumos':
        const insumosPhone = '595981255999'
        const insumosMessage = `¡Excelente! 📦\n\nTe voy a conectar con nuestro equipo de Pedidos de Insumos.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${insumosPhone}\n\n¡Te ayudarán con tu pedido! 😊`
        await sendTextMessage(phoneNumber, insumosMessage, 'ventas')
        return { message: insumosMessage }

      case 'soporte_hablar_agente':
        const agentePhone = '595981255999'
        const agenteMessage = `¡Por supuesto! 👤\n\nTe voy a conectar con uno de nuestros agentes.\n\n👉 Haz clic aquí para contactar:\nhttps://wa.me/${agentePhone}\n\n¡Te atenderán enseguida! 😊`
        await sendTextMessage(phoneNumber, agenteMessage, 'ventas')
        return { message: agenteMessage }

      case 'volver_menu':
        // Enviar menú principal de nuevo
        console.log('↩️ Volviendo al menú principal...')
        const saludo = getTimeBasedGreeting()
        const mensajeSaludo = customerName !== 'Cliente'
          ? `${saludo} ${customerName}! 👋`
          : `${saludo}! 👋`

        const buttons = [
          { id: 'ventas', title: 'Ventas' },
          { id: 'soporte', title: 'Soporte' },
          { id: 'administracion', title: 'Administración' }
        ]

        await sendButtonMessage(
          phoneNumber,
          `${mensajeSaludo}\n\n¿En qué podemos ayudarte hoy?`,
          buttons,
          'ventas'
        )
        return { message: 'Menú principal enviado' }
    }
  }

  // 6. Si es mensaje de cortesía (gracias, ok, etc.), responder amigablemente
  if (isCourtesyMessage(messageText)) {
    console.log('💚 Mensaje de cortesía detectado')
    const courtesyResponse = '¡Con gusto! 😊 Si necesitas algo más, aquí estaré para ayudarte. ¡Que tengas un excelente día! ✨'
    await sendTextMessage(phoneNumber, courtesyResponse, 'ventas')
    return { message: courtesyResponse }
  }

  // 7. Si es mensaje de texto normal, procesar con IA
  return await processSalesInquiry(messageText, phoneNumber, customerName)
}

/**
 * Procesa consultas sobre equipos usando IA y catálogo PDF
 */
async function processEquiposInquiry(
  messageText: string,
  phoneNumber: string,
  customerName: string
): Promise<FlowResponse> {
  console.log('🔧 Procesando consulta sobre equipos con IA...')

  try {
    // Verificar si existe el PDF del catálogo
    const pdfExists = await getPdfText('catalogo.pdf').catch(() => false)

    let response: string
    let shouldSaveLead = false
    let leadData: any = undefined

    if (!pdfExists) {
      response = "Hola! Actualmente estoy cargando la información más reciente de nuestro catálogo. Un asesor se pondrá en contacto contigo muy pronto."
    } else {
      // Generar respuesta con IA usando el PDF
      const contextoPDF = await getPdfText('catalogo.pdf')
      response = await generateSalesResponse(messageText, contextoPDF)

      // Detectar interés de compra
      if (detectPurchaseIntent(response)) {
        shouldSaveLead = true
        const equipoInteres = extractEquipoInteres(messageText)
        leadData = {
          nombre: customerName,
          telefono: phoneNumber,
          mensaje: messageText,
          equipo_interes: equipoInteres || undefined
        }
      }
    }

    await sendTextMessage(phoneNumber, response, 'ventas')

    return {
      message: response,
      shouldSaveLead,
      leadData
    }
  } catch (error) {
    console.error('❌ Error procesando equipos:', error)
    const fallbackMessage = "Hola! Me encantaría ayudarte con información sobre nuestros equipos. Un asesor especializado se pondrá en contacto contigo muy pronto."
    await sendTextMessage(phoneNumber, fallbackMessage, 'ventas')
    return { message: fallbackMessage }
  }
}

/**
 * Procesa consultas generales de ventas
 */
async function processSalesInquiry(
  messageText: string,
  phoneNumber: string,
  customerName: string
): Promise<FlowResponse> {
  console.log('💬 Procesando consulta general de ventas...')

  // Clasificar intención del mensaje
  const intent = classifyIntent(messageText)

  let response: string
  let shouldSaveLead = false
  let leadData: any = undefined

  switch (intent) {
    case 'ventas':
      // Re-dirigir al flujo de equipos si menciona equipos
      if (messageText.toLowerCase().includes('equipo') ||
          messageText.toLowerCase().includes('hydrafacial') ||
          messageText.toLowerCase().includes('ultraformer')) {
        return await processEquiposInquiry(messageText, phoneNumber, customerName)
      }

      response = `Hola ${customerName}, gracias por tu interés en nuestros productos. ¿Te gustaría ver información sobre equipos o insumos?`
      break

    default:
      response = `Hola ${customerName}, gracias por tu mensaje. ¿En qué productos específicos estás interesado?`
  }

  await sendTextMessage(phoneNumber, response, 'ventas')

  return {
    message: response,
    shouldSaveLead,
    leadData
  }
}
