import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Room from './room.js'

export default class Game extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column({ columnName: 'room_id' })
  declare roomId: number

  @column()
  declare player1InitialBoard: any[] | null

  @column()
  declare player2InitialBoard: any[] | null

  @column({ columnName: 'winner_id' })
  declare winnerId: number | null

  @column()
  declare status: 'in_game' | 'finished'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Room, {
    foreignKey: 'roomId',
  })
  declare room: BelongsTo<typeof Room>

  @belongsTo(() => User, {
    foreignKey: 'winnerId',
  })
  declare winner: BelongsTo<typeof User>
}
