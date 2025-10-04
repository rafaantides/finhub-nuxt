import type { LoginRequest, LoginResponse } from '~/types/api'

export default defineEventHandler(
  async (event): Promise<{ message: string }> => {
    const config = useRuntimeConfig()
    const body = await readBody<LoginRequest>(event)

    try {
      const response = await $fetch.raw<LoginResponse>('/api/v1/auth/login', {
        baseURL: config.apiBaseUrl,
        method: 'POST',
        body: JSON.stringify({
          identifier: body.identifier.trim(),
          password: body.password
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const token = response._data?.token

      if (!token) {
        throw createError({
          statusCode: 500,
          statusMessage: 'No token received from authentication service'
        })
      }

      setCookie(event, 'auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 4, // 4 horas
        path: '/'
      })

      return {
        message: 'Login successful'
      }
    } catch (error: any) {
      const statusCode = error.response?.status || 500
      const errorData = error.response?._data

      throw createError({
        statusCode,
        statusMessage: errorData?.message || error.message || 'Login failed',
        data: {
          code: errorData?.code || 'LOGIN_ERROR',
          details: errorData?.details
        }
      })
    }
  }
)
