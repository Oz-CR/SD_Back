import vine from '@vinejs/vine'

// Colores válidos base para el juego Simon Dice
const VALID_COLORS = [
  'red',
  'blue',
  'green',
  'yellow',
  'orange',
  'purple',
  'pink',
  'cyan',
  'lime',
  'indigo'
]

/**
 * Validates the payload when creating
 * a new room.
 */
export const createRoomValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(50),
    colorCount: vine.number().min(2).max(100).optional(), // Aumentado el límite a 100
    selectedColors: vine.array(vine.string()).minLength(2).maxLength(100).optional() // Removida validación de colores específicos y aumentado límite
  })
)

/**
 * Validates the payload when updating
 * an existing room.
 */
export const updateRoomValidator = vine.compile(
  vine.object({
    name: vine.string().trim().minLength(1).maxLength(50).optional(),
    colorCount: vine.number().min(2).max(100).optional(), // Aumentado el límite a 100
    selectedColors: vine.array(vine.string()).minLength(2).maxLength(100).optional(), // Removida validación de colores específicos y aumentado límite
    status: vine.enum(['waiting', 'full', 'started', 'finished']).optional()
  })
)

// Exportar colores válidos base para uso en otros módulos
export { VALID_COLORS }