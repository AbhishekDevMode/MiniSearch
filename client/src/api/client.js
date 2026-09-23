import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
})

export const searchApi = {
  /**
   * @param {string} query
   * @param {number} limit
   * @param {number} offset
   */
  async search(query, limit = 10, offset = 0) {
    const { data } = await API.get('/search', {
      params: { q: query, limit, offset },
    })
    return data
  },

  async logClick(query, docId, position) {
    await API.post('/search/click', null, {
      params: { query, docId, position },
    })
  },

  async getStats() {
    const { data } = await API.get('/analytics/stats')
    return data
  },
  
  async getTrending(limit = 8) {
    const { data } = await API.get('/analytics/trending', {
      params: { limit },
    })
    return data
  },
}

export default API