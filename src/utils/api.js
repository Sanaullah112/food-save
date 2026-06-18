import axios from 'axios'

const API = axios.create({ baseURL: 'https://foodsave-backend-d3ss.onrender.com/api' })

API.interceptors.request.use((req) => {
  const user = localStorage.getItem('foodsave_user')
  if (user) {
    req.headers.Authorization = `Bearer ${JSON.parse(user).token}`
  }
  return req
})

export default API