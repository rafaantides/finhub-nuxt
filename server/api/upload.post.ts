import { createError, readMultipartFormData, sendError } from 'h3'

export default defineEventHandler(
  async (event): Promise<{ success: boolean }> => {
    try {
      const form = await readMultipartFormData(event)

      if (!form) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Nenhum dado enviado no corpo da requisição.'
        })
      }

      const invoiceId = form
        .find((f) => f.name === 'invoice_id')
        ?.data?.toString()
      const action = form.find((f) => f.name === 'action')?.data?.toString()
      const model = form.find((f) => f.name === 'model')?.data?.toString()
      const filePart = form.find((f) => f.name === 'file')

      if (!action || !model || !filePart) {
        sendError(
          event,
          createError({
            statusCode: 400,
            statusMessage: 'Bad Request',
            data: 'Campos "resource", "action", "model" e "file" são obrigatórios'
          })
        )
        return { success: false }
      }

      const config = useRuntimeConfig()

      const formData = new FormData()
      if (invoiceId && invoiceId !== '') {
        formData.append('invoice_id', invoiceId)
      }

      formData.append('action', action)
      formData.append('model', model)
      formData.append(
        'file',
        new Blob([filePart.data!]),
        filePart.filename || 'arquivo.csv'
      )

      const response = await $fetch.raw('/upload', {
        method: 'POST',
        baseURL: config.apiBaseUrl,
        body: formData
      })

      return { success: response.status === 202 }
    } catch (error: any) {
      sendError(
        event,
        createError({
          statusCode: error.statusCode || 500,
          statusMessage: error.statusMessage || error.message || 'Erro interno',
          data: error.data || 'Erro desconhecido'
        })
      )
      return { success: false }
    }
  }
)
