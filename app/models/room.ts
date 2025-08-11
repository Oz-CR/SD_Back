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
    prepare: (value: string[]) => JSON.stringify(value),
    consume: (value: string) => {
      try {
        return value ? JSON.parse(value) : null
      } catch {
        return null
      }
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
