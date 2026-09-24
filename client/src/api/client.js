import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 60000, // Crawling can take up to 60s
  headers: {
    'Content-Type': 'application/json',
  },
})

export const searchApi = {
  /**
   * Search indexed documents using BM25
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

  /**
   * Get query autocompletion suggestions
   * @param {string} query
   * @param {number} limit
   */
  async getSuggestions(query, limit = 5) {
    const { data } = await API.get('/search/suggestions', {
      params: { q: query, limit },
    })
    return data
  },

  /**
   * Record a click on a search result
   * @param {string} query
   * @param {number} docId
   * @param {number} position
   */
  async logClick(query, docId, position) {
    await API.post('/search/click', null, {
      params: { query, docId, position },
    })
  },

  /**
   * Get system search and index statistics
   */
  async getStats() {
    const { data } = await API.get('/analytics/stats')
    return data
  },

  /**
   * Get trending search queries
   * @param {number} limit
   */
  async getTrending(limit = 8) {
    const { data } = await API.get('/analytics/trending', {
      params: { limit },
    })
    return data
  },

  /**
   * Rebuild the in-memory inverted index from the database
   */
  async reindex() {
    const { data } = await API.post('/analytics/reindex')
    return data
  },

  /**
   * Start a web crawl job
   * @param {string} seedUrl
   * @param {number} maxPages
   */
  async crawl(seedUrl, maxPages = 50) {
    const { data } = await API.post('/crawler/crawl', {
      seedUrl,
      maxPages: Number(maxPages),
    })
    return data
  },

  /**
   * Enqueue a single URL for crawling
   * @param {string} url
   */
  async enqueueUrl(url) {
    const { data } = await API.post('/crawler/enqueue', null, {
      params: { url },
    })
    return data
  },

  /**
   * Fetch paginated list of indexed documents
   * @param {number} page
   * @param {number} size
   */
  async getDocuments(page = 0, size = 15) {
    const { data } = await API.get('/documents', {
      params: { page, size },
    })
    return data
  },

  /**
   * Get single document by ID
   * @param {number} id
   */
  async getDocumentById(id) {
    const { data } = await API.get(`/documents/${id}`)
    return data
  },

  /**
   * Delete an indexed document by ID
   * @param {number} id
   */
  async deleteDocument(id) {
    await API.delete(`/documents/${id}`)
  },
}

export default API