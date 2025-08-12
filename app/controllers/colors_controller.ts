import type { HttpContext } from '@adonisjs/core/http'

export default class ColorsController {
  /**
   * Colores base predefinidos
   */
  private static readonly BASE_COLORS = [
    {
      name: 'red',
      displayName: 'Rojo',
      hexColor: '#FF4444'
    },
    {
      name: 'blue',
      displayName: 'Azul',
      hexColor: '#4444FF'
    },
    {
      name: 'green',
      displayName: 'Verde',
      hexColor: '#44FF44'
    },
    {
      name: 'yellow',
      displayName: 'Amarillo',
      hexColor: '#FFFF44'
    },
    {
      name: 'orange',
      displayName: 'Naranja',
      hexColor: '#FF8800'
    },
    {
      name: 'purple',
      displayName: 'Morado',
      hexColor: '#FF44FF'
    },
    {
      name: 'pink',
      displayName: 'Rosa',
      hexColor: '#FF88BB'
    },
    {
      name: 'cyan',
      displayName: 'Cian',
      hexColor: '#44FFFF'
    },
    {
      name: 'lime',
      displayName: 'Lima',
      hexColor: '#88FF44'
    },
    {
      name: 'indigo',
      displayName: 'Índigo',
      hexColor: '#4444AA'
    }
  ]

  /**
   * Genera un color hexadecimal aleatorio
   */
  private generateRandomHexColor(): string {
    const letters = '0123456789ABCDEF'
    let color = '#'
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)]
    }
    return color
  }

  /**
   * Genera colores adicionales dinámicamente
   */
  private generateAdditionalColors(count: number) {
    const additionalColors = []
    for (let i = 0; i < count; i++) {
      const colorNumber = this.BASE_COLORS.length + i + 1
      additionalColors.push({
        name: `color${colorNumber}`,
        displayName: `Color ${colorNumber}`,
        hexColor: this.generateRandomHexColor()
      })
    }
    return additionalColors
  }

  /**
   * Obtiene la lista de colores válidos para el juego
   * Puede generar colores dinámicamente si se solicita más de 10
   */
  async getValidColors({ request, response }: HttpContext) {
    try {
      const { count } = request.qs()
      const requestedCount = count ? parseInt(count) : this.BASE_COLORS.length

      let validColors = [...this.BASE_COLORS]

      // Si se solicitan más colores de los predefinidos, generar adicionales
      if (requestedCount > this.BASE_COLORS.length) {
        const additionalColorsNeeded = requestedCount - this.BASE_COLORS.length
        const additionalColors = this.generateAdditionalColors(additionalColorsNeeded)
        validColors = [...validColors, ...additionalColors]
      } else if (requestedCount < this.BASE_COLORS.length) {
        // Si se solicitan menos, tomar solo los primeros
        validColors = validColors.slice(0, requestedCount)
      }

      return response.json({
        message: 'Colores válidos obtenidos exitosamente',
        data: validColors,
        totalColors: validColors.length
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener los colores válidos',
        error: error.message
      })
    }
  }

  /**
   * Genera un conjunto específico de colores para una sala
   */
  async generateColorsForRoom({ request, response }: HttpContext) {
    try {
      const { colorCount, selectedColors } = request.body()
      
      if (!colorCount || colorCount < 2) {
        return response.status(400).json({
          message: 'Se requiere un mínimo de 2 colores',
          error: 'INVALID_COLOR_COUNT'
        })
      }

      // Si se proporcionan colores específicos, usarlos
      if (selectedColors && Array.isArray(selectedColors) && selectedColors.length > 0) {
        // Validar que la cantidad de colores seleccionados coincida
        if (selectedColors.length !== colorCount) {
          return response.status(400).json({
            message: `Se esperaban ${colorCount} colores, pero se recibieron ${selectedColors.length}`,
            error: 'COLOR_COUNT_MISMATCH'
          })
        }

        // Convertir colores personalizados al formato esperado
        const customColors = selectedColors.map((colorName: string, index: number) => {
          // Si es un color hexadecimal
          if (colorName.startsWith('#')) {
            return {
              name: `custom-${index + 1}`,
              displayName: `Color ${index + 1}`,
              hexColor: colorName
            }
          }
          
          // Si es un color base conocido
          const baseColor = this.BASE_COLORS.find(color => color.name === colorName)
          if (baseColor) {
            return baseColor
          }
          
          // Color personalizado con nombre
          return {
            name: colorName,
            displayName: colorName.charAt(0).toUpperCase() + colorName.slice(1),
            hexColor: this.generateRandomHexColor()
          }
        })

        return response.json({
          message: 'Colores personalizados generados exitosamente',
          data: customColors,
          totalColors: customColors.length
        })
      }

      // Comportamiento por defecto: usar colores predefinidos
      let colors = [...this.BASE_COLORS]

      // Generar colores adicionales si es necesario
      if (colorCount > this.BASE_COLORS.length) {
        const additionalColorsNeeded = colorCount - this.BASE_COLORS.length
        const additionalColors = this.generateAdditionalColors(additionalColorsNeeded)
        colors = [...colors, ...additionalColors]
      } else {
        colors = colors.slice(0, colorCount)
      }

      return response.json({
        message: 'Colores generados exitosamente',
        data: colors,
        totalColors: colors.length
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al generar colores',
        error: error.message
      })
    }
  }
}