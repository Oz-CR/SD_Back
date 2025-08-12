import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasOne } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasOne } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Game from './game.js'

export default class Room extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare name: string

  @column({ columnName: 'player1_id' })
  declare player1Id: number

  @column({ columnName: 'player2_id' })
  declare player2Id: number | null

  @column({ columnName: 'color_count' })
  declare colorCount: number

  @column({
    columnName: 'selected_colors',
    prepare: (value: string[] | null) => {
      if (!value || !Array.isArray(value)) {
        return null;
      }
      // Para columnas JSON de MySQL, necesitamos serializarlas como string JSON
      const jsonString = JSON.stringify(value);
      console.log('🔧 [ROOM MODEL] Preparando selectedColors para BD (JSON column):', {
        input: value,
        inputType: typeof value,
        isArray: Array.isArray(value),
        output: jsonString,
        outputType: typeof jsonString
      });
      return jsonString;
    },
    consume: (value: string[] | string | null) => {
      console.log('🔍 [ROOM MODEL] Consumiendo selectedColors desde BD:', {
        rawValue: value,
        valueType: typeof value,
        isArray: Array.isArray(value)
      });
      
      if (!value) {
        return null;
      }
      
      // MySQL JSON columns devuelven arrays JS directamente
      if (Array.isArray(value)) {
        console.log('✅ [ROOM MODEL] Recibido como array JS (columna JSON):', value);
        return value;
      }
      
      // Fallback: si viene como string, intentar parsear
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          console.log('✅ [ROOM MODEL] String JSON parseado:', parsed);
          return Array.isArray(parsed) ? parsed : null;
        } catch (error) {
          console.error('❌ [ROOM MODEL] Error parseando JSON:', error.message, 'Value:', value);
          return null;
        }
      }
      
      console.warn('⚠️ [ROOM MODEL] Tipo de valor inesperado:', typeof value, value);
      return null;
    }
  })
  declare selectedColors: string[] | null

  @column()
  declare status: 'waiting' | 'full' | 'started' | 'finished'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User, {
    foreignKey: 'player1Id',
  })
  declare player1: BelongsTo<typeof User>

  @belongsTo(() => User, {
    foreignKey: 'player2Id',
  })
  declare player2: BelongsTo<typeof User>

  @hasOne(() => Game, {
    foreignKey: 'roomId',
  })
  declare game: HasOne<typeof Game>
}
