import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import { registerValidator, loginValidator } from '#validators/auth'

export default class AuthController {
    async register({request, response}: HttpContext) {
        try {
            const data = await request.validateUsing(registerValidator)

            const existingUser = await User.findBy('email', data.email)
            if (existingUser) {
                return response.status(409).json({
                    message: "This email is already in use.",
                    error: "USER_EXISTS"
                })
            }

            const user = await User.create({
                fullName: data.fullName,
                email: data.email,
                password: data.password
            })

            const token = await User.accessTokens.create(user, ['*'], {
                expiresIn: '1 day'
            })

            return response.status(201).json({
                message: "User registered successfuly",
                data: {
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                    },
                    token: {
                        type: "Bearer",
                        value: token!.value?.release(),
                        expiresAt: token.expiresAt
                    }
                }
            })
        } catch (error) {
            if (error.status === 420) {
                return response.status(420).json({
                    message: "Invalid user data.",
                    errors: error.messages
                })
            } else {
                return response.status(500).json({
                    message: "Internal server error",
                    errors: error.messages
                })
            }
        }
    }

    async login({request, response}: HttpContext) {
        try {
            const data = await request.validateUsing(loginValidator)

            const user = await User.verifyCredentials(data.email, data.password)

            const token = await User.accessTokens.create(user, ['*'], {
                expiresIn: '1 day'
            })

            return response.status(200).json({
                message: "Successful login",
                data: {
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                    },
                    token: {
                        type: "Bearer",
                        value: token!.value?.release(),
                        expiresAt: token.expiresAt
                    }
                }
            })
        } catch(error) {
            return response.status(401).json({
                message: "Invalid credentials",
                errors: error.messages
            })
        }
    }

    async logout({response, auth}: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            const token = auth.user?.currentAccessToken

            if (token) {
                await User.accessTokens.delete(user, token.identifier)
            }

            return response.json({
                message: "Logout successful"
            })
        } catch (error) {
            return response.status(401).json({
                message: "Unauthorized",
                error: "INVALID_TOKEN"
            })
        }
    }

    async validateToken({auth, response}: HttpContext) {
        try {
            const user = await auth.getUserOrFail()
            
            return response.status(200).json({
                message: "Token is valid",
                data: {
                    user: {
                        id: user.id,
                        fullName: user.fullName,
                        email: user.email,
                    }
                }
            })
        } catch (error) {
            return response.status(401).json({
                message: "Invalid token",
                error: "INVALID_TOKEN"
            })
        }
    }
}