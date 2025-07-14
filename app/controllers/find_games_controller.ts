import Room from '#models/room'
import type { HttpContext } from '@adonisjs/core/http'

export default class FindGamesController {
  async getGames({ response }: HttpContext) {
    try {
      const rooms = await Room.query()
        .where('status', 'waiting')
        .preload('player1')
        .orderBy('createdAt', 'desc')

      const roomsWithDetails = rooms.map((room) => ({
        id: room.id,
        name: room.name,
        host: room.player1.fullName,
        colorCount: room.colorCount,
        currentPlayers: room.player2Id ? 2 : 1,
        maxPlayers: 2,
        isActive: room.status === 'waiting',
        createdAt: room.createdAt,
        player1Id: room.player1Id,
        player2Id: room.player2Id,
        status: room.status,
      }))

      return response.json({
        message: 'Partidas obtenidas exitosamente',
        data: roomsWithDetails,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener las partidas',
        error: error.message,
      })
    }
  }

  async createGame({ request, response, auth }: HttpContext) {
    try {
      const body = request.body()
      const user = await auth.getUserOrFail()

      console.log('Datos recibidos:', body)
      console.log('Usuario autenticado:', user)

      if (!body.name || !body.colorCount) {
        return response.status(400).json({
          message: 'Datos incompletos',
          error: 'Se requieren name y colorCount',
        })
      }

      if (body.colorCount < 2 || body.colorCount > 6) {
        return response.status(400).json({
          message: 'Cantidad de colores inválida',
          error: 'colorCount debe estar entre 2 y 6',
        })
      }

      const game = await Room.create({
        name: body.name,
        player1Id: user.id,
        player2Id: null,
        colorCount: body.colorCount,
        status: 'waiting',
      })

      await game.load('player1')

      const gameResponse = {
        id: game.id,
        name: game.name,
        host: game.player1.fullName,
        colorCount: game.colorCount,
        currentPlayers: 1,
        maxPlayers: 2,
        isActive: true,
        createdAt: game.createdAt,
        player1Id: game.player1Id,
        player2Id: game.player2Id,
        status: game.status,
      }

      return response.status(201).json({
        message: 'Partida creada exitosamente',
        data: gameResponse,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al crear la partida',
        error: error.message,
      })
    }
  }

  async joinGame({ request, response, auth }: HttpContext) {
    try {
      const { roomId } = request.params()
      const user = await auth.getUserOrFail()

      console.log('Usuario intentando unirse:', user.id, 'a la sala:', roomId)

      const room = await Room.find(roomId)

      if (!room) {
        return response.status(404).json({
          message: 'Sala no encontrada',
          error: 'ROOM_NOT_FOUND',
        })
      }

      if (room.status !== 'waiting') {
        return response.status(400).json({
          message: 'La sala no está disponible',
          error: 'ROOM_NOT_AVAILABLE',
        })
      }

      if (room.player2Id !== null) {
        return response.status(400).json({
          message: 'La sala está llena',
          error: 'ROOM_FULL',
        })
      }

      if (room.player1Id === user.id) {
        return response.status(400).json({
          message: 'No puedes unirte a tu propia sala',
          error: 'CANNOT_JOIN_OWN_ROOM',
        })
      }

      room.player2Id = user.id
      room.status = 'playing'
      await room.save()

      await room.load('player1')
      await room.load('player2')

      const gameResponse = {
        id: room.id,
        name: room.name,
        host: room.player1.fullName,
        colorCount: room.colorCount,
        currentPlayers: 2,
        maxPlayers: 2,
        isActive: false,
        createdAt: room.createdAt,
        player1Id: room.player1Id,
        player2Id: room.player2Id,
        status: room.status,
        player1: {
          id: room.player1.id,
          fullName: room.player1.fullName,
          email: room.player1.email,
        },
        player2: {
          id: room.player2.id,
          fullName: room.player2.fullName,
          email: room.player2.email,
        },
      }

      return response.status(200).json({
        message: 'Te has unido a la partida exitosamente',
        data: gameResponse,
      })
    } catch (error) {
      console.error('Error al unirse a la partida:', error)
      return response.status(500).json({
        message: 'Error al unirse a la partida',
        error: error.message,
      })
    }
  }
}
