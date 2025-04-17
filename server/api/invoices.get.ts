export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const { page = 1, page_size = 10 } = query

  const backendUrl = `http://localhost:8080/api/v1/invoices?page=${page}&page_size=${page_size}`

  try {
    const response = await fetch(backendUrl)
    const data = await response.json()

    const total = response.headers.get('X-Total-Count')

    return {
      data,
      total: total ? parseInt(total, 10) : null
    }
  } catch (error) {
    console.error('Erro ao buscar dados do backend:', error)
    return { error: 'Erro ao buscar dados do backend' }
  }
})
