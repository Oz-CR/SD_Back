/**
 * Helper functions for game logic
 */

export class GameHelpers {
  /**
   * Colores predeterminados para cuando no se especifiquen colores personalizados
   */
  static readonly DEFAULT_COLORS = ['red', 'blue', 'green', 'yellow']
  
  /**
   * Colores base disponibles (expandible dinámicamente)
   */
  static readonly BASE_COLORS = [
    'red', 'blue', 'green', 'yellow', 'orange', 'purple', 
    'pink', 'cyan', 'lime', 'indigo'
  ]
  
  /**
   * Genera colores adicionales dinámicamente
   * @param startIndex - Índice desde donde empezar a generar
   * @param count - Cantidad de colores a generar
   * @returns Array de nombres de colores generados
   */
  static generateDynamicColors(startIndex: number, count: number): string[] {
    const dynamicColors: string[] = []
    for (let i = 0; i < count; i++) {
      dynamicColors.push(`color${startIndex + i + 1}`)
    }
    return dynamicColors
  }
  
  /**
   * Obtiene la lista completa de colores disponibles según la configuración
   * @param selectedColors - Colores seleccionados por el usuario
   * @param colorCount - Número de colores a usar
   * @returns Array con todos los colores disponibles
   */
  static getAvailableColors(
    selectedColors: string[] | null,
    colorCount: number
  ): string[] {
    if (selectedColors && selectedColors.length > 0) {
      return [...selectedColors]
    }
    
    // Si colorCount es mayor que los colores base, generar adicionales
    if (colorCount > this.BASE_COLORS.length) {
      const additionalCount = colorCount - this.BASE_COLORS.length
      const additionalColors = this.generateDynamicColors(this.BASE_COLORS.length, additionalCount)
      return [...this.BASE_COLORS, ...additionalColors]
    }
    
    // Si colorCount es menor o igual, usar solo los necesarios
    return this.BASE_COLORS.slice(0, colorCount)
  }
  
  /**
   * Genera una secuencia aleatoria usando los colores especificados
   * @param selectedColors - Array de colores seleccionados por el usuario
   * @param colorCount - Número de colores a usar (si no hay colores seleccionados)
   * @param sequenceLength - Longitud de la secuencia a generar
   * @returns Array con la secuencia generada
   */
  static generateSequence(
    selectedColors: string[] | null, 
    colorCount: number, 
    sequenceLength: number = 1
  ): string[] {
    const availableColors = this.getAvailableColors(selectedColors, colorCount)
    const sequence: string[] = []
    
    for (let i = 0; i < sequenceLength; i++) {
      const randomIndex = Math.floor(Math.random() * availableColors.length)
      sequence.push(availableColors[randomIndex])
    }
    
    return sequence
  }
  
  /**
   * Agrega un nuevo color aleatorio a una secuencia existente
   * @param currentSequence - Secuencia actual
   * @param selectedColors - Colores seleccionados por el usuario
   * @param colorCount - Número de colores disponibles
   * @returns Nueva secuencia con un color adicional
   */
  static addRandomColorToSequence(
    currentSequence: string[],
    selectedColors: string[] | null,
    colorCount: number
  ): string[] {
    const newColor = this.generateSequence(selectedColors, colorCount, 1)[0]
    return [...currentSequence, newColor]
  }
  
  /**
   * Valida si un color está dentro de los colores permitidos para el juego
   * @param color - Color a validar
   * @param selectedColors - Colores seleccionados para el juego
   * @param colorCount - Cantidad de colores predeterminados
   * @returns True si el color es válido
   */
  static isValidColor(
    color: string,
    selectedColors: string[] | null,
    colorCount: number
  ): boolean {
    const availableColors = this.getAvailableColors(selectedColors, colorCount)
    return availableColors.includes(color)
  }
  
  /**
   * Valida que un array de colores sea válido
   * @param colors - Array de colores a validar
   * @returns True si todos los colores son válidos (formato hexadecimal o nombres válidos)
   */
  static validateColorArray(colors: string[]): boolean {
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/
    const validColorNames = [...this.BASE_COLORS]
    
    // Verificar que no haya colores duplicados
    const uniqueColors = new Set(colors)
    if (uniqueColors.size !== colors.length) {
      console.log('❌ Colores duplicados detectados')
      return false
    }
    
    return colors.every(color => {
      // Validar si es un color hexadecimal válido
      if (hexColorRegex.test(color)) {
        return true
      }
      
      // Validar si es un nombre de color válido o generado dinámicamente
      if (validColorNames.includes(color) || color.startsWith('color')) {
        return true
      }
      
      // Permitir cualquier string que no esté vacío (para colores personalizados)
      if (typeof color === 'string' && color.trim().length > 0) {
        return true
      }
      
      return false
    })
  }
}