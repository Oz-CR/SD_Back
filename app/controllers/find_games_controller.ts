import Room from '#models/room'
import type { HttpContext } from '@adonisjs/core/http'
import { createRoomValidator } from '#validators/room'
import { GameHelpers } from '#helpers/game_helpers'

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
        selectedColors: room.selectedColors,
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

  async getRoomDetails({ params, response }: HttpContext) {
    try {
      const { roomId } = params
      
      const room = await Room.query()
        .where('id', roomId)
        .preload('player1')
        .preload('player2')
        .first()

      if (!room) {
        return response.status(404).json({
          message: 'Sala no encontrada',
          error: 'ROOM_NOT_FOUND',
        })
      }

      const roomDetails = {
        id: room.id,
        name: room.name,
        host: room.player1.fullName,
        colorCount: room.colorCount,
        selectedColors: room.selectedColors,
        currentPlayers: room.player2Id ? 2 : 1,
        maxPlayers: 2,
        isActive: room.status === 'waiting',
        createdAt: room.createdAt,
        player1Id: room.player1Id,
        player2Id: room.player2Id,
        status: room.status,
        player1: {
          id: room.player1.id,
          fullName: room.player1.fullName,
          email: room.player1.email,
        },
        player2: room.player2 ? {
          id: room.player2.id,
          fullName: room.player2.fullName,
          email: room.player2.email,
        } : null,
      }

      return response.json({
        message: 'Detalles de la sala obtenidos exitosamente',
        data: roomDetails,
      })
    } catch (error) {
      return response.status(500).json({
        message: 'Error al obtener los detalles de la sala',
        error: error.message,
      })
    }
  }

  async createGame({ request, response, auth }: HttpContext) {
    try {
      const user = await auth.getUserOrFail()
      const payload = await request.validateUsing(createRoomValidator)

      console.log('Datos validados:', payload)
      console.log('Usuario autenticado:', user)

      // Determinar colorCount basado en selectedColors si está presente
      let finalColorCount = payload.colorCount || 4
      let finalSelectedColors = payload.selectedColors || null

      if (payload.selectedColors && payload.selectedColors.length > 0) {
        // Validar que los colores personalizados sean válidos
        if (!GameHelpers.validateColorArray(payload.selectedColors)) {
          return response.status(400).json({
            message: 'Algunos colores seleccionados no son válidos',
            error: 'INVALID_COLORS'
          })
        }
        
        finalColorCount = payload.selectedColors.length
        finalSelectedColors = payload.selectedColors
      }

      const game = await Room.create({
        name: payload.name,
        player1Id: user.id,
        player2Id: null,
        colorCount: finalColorCount,
        selectedColors: finalSelectedColors,
        status: 'waiting',
      })

      await game.load('player1')

      const gameResponse = {
        id: game.id,
        name: game.name,
        host: game.player1.fullName,
        colorCount: game.colorCount,
        selectedColors: game.selectedColors,
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
      room.status = 'started'
      await room.save()

      await room.load('player1')
      await room.load('player2')

      const gameResponse = {
        id: room.id,
        name: room.name,
        host: room.player1.fullName,
        colorCount: room.colorCount,
        selectedColors: room.selectedColors,
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