// Payloads predefinidos para menús de ventas

export const VENTAS_MAIN_BUTTONS = [
  { id: 'ventas', title: 'Administracion' },
  { id: 'soporte', title: 'Soporte' },
  { id: 'contabilidad', title: 'Ventas' }
]

export const VENTAS_PRODUCT_LIST_SECTIONS = [
  {
    title: "Categorías de Productos",
    rows: [
      {
        id: "ventas_insumos",
        title: "Insumos",
        description: "Tips, consumibles, repuestos"
      },
      {
        id: "ventas_equipos",
        title: "Equipos",
        description: "HydraFacial, Ultraformer, CM Slim..."
      }
    ]
  }
]

export const VENTAS_GREETING_MESSAGES = {
  morning: "Buenos días",
  afternoon: "Buenas tardes",
  evening: "Buenas noches"
}
