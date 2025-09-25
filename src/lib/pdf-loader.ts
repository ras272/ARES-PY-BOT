// lib/pdf-loader.ts
import { supabase } from './supabase'
import pdf from 'pdf-parse'

let pdfCache: { [key: string]: string } = {}

export async function getPdfText(fileName: string): Promise<string> {
  // Verificar si ya está en cache
  if (pdfCache[fileName]) {
    return pdfCache[fileName]
  }

  try {
    // Descargar el archivo desde Supabase Storage
    const { data, error } = await supabase.storage
      .from('catalogos')
      .download(fileName)

    if (error) {
      throw new Error(`Error downloading PDF: ${error.message}`)
    }

    if (!data) {
      throw new Error(`No data received for ${fileName}`)
    }

    // Convertir a buffer
    const buffer = Buffer.from(await data.arrayBuffer())

    // Extraer texto del PDF
    const pdfData = await pdf(buffer)

    // Cachear el resultado
    pdfCache[fileName] = pdfData.text

    return pdfData.text
  } catch (error) {
    console.error(`Error loading PDF ${fileName}:`, error)
    throw error
  }
}

// Función para limpiar cache (útil para desarrollo)
export function clearPdfCache() {
  pdfCache = {}
}

// Función para verificar si un archivo existe en el bucket
export async function checkPdfExists(fileName: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from('catalogos')
      .list('', {
        limit: 1000,
        search: fileName
      })

    if (error) {
      console.error('Error checking PDF existence:', error)
      return false
    }

    return data?.some(file => file.name === fileName) || false
  } catch (error) {
    console.error('Error checking PDF existence:', error)
    return false
  }
}
