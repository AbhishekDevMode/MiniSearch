import axios from 'axios'

const API = axios.create({
    baseURL: import.meta.env.API_BASE_URL || '/api',
    timeout: 60000, // Crawling can take up to 60s
    headers: {
        'Content-Type': 'application/json',
    },
})

export const searchApi = {

    async search(query, limit = 10, offset = 0) {
        const {data} = await API.get('/search', {
            params: {q: query, limit, offset},
        })
        return data
    },


    async getSuggestions(query, limit = 5) {
        const {data} = await API.get('/search/suggestions', {
            params: {q: query, limit},
        })
        return data
    },


    async logClick(query, docId, position) {
        await API.post('/search/click', null, {
            params: {query, docId, position},
        })
    },


    async getStats() {
        const {data} = await API.get('/analytics/stats')
        return data
    },


    async getTrending(limit = 8) {
        const {data} = await API.get('/analytics/trending', {
            params: {limit},
        })
        return data
    },


    async reindex() {
        const {data} = await API.post('/analytics/reindex')
        return data
    },


    async crawl(seedUrl, maxPages = 50) {
        const {data} = await API.post('/crawler/crawl', {
            seedUrl,
            maxPages: Number(maxPages),
        })
        return data
    },


    async enqueueUrl(url) {
        const {data} = await API.post('/crawler/enqueue', null, {
            params: {url},
        })
        return data
    },


    async getDocuments(page = 0, size = 15) {
        const {data} = await API.get('/documents', {
            params: {page, size},
        })
        return data
    },


    async getDocumentById(id) {
        const {data} = await API.get(`/documents/${id}`)
        return data
    },


    async deleteDocument(id) {
        await API.delete(`/documents/${id}`)
    },
}

export default API