import axios from 'axios'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '../stores/auth'
import router from '../router'

// 核心错误1：baseURL 不能写死成具体接口，要写公共前缀！
const request = axios.create({
  baseURL: '/api', // 只写公共前缀，具体接口在请求时拼接
  timeout: 5000
})

// 请求拦截器：添加 token
request.interceptors.request.use(
  config => {
    // 优先从 store 获取 token，如果没有则从 localStorage 获取
    let token = ''
    try {
      const authStore = useAuthStore()
      token = authStore?.token || ''
    } catch (e) {
      // store 未初始化，从 localStorage 获取
    }
    if (!token) {
      token = localStorage.getItem('token') || ''
    }
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    // 新增：设置默认请求头，避免后端解析失败
    config.headers['Content-Type'] = config.headers['Content-Type'] || 'application/json'
    return config
  },
  error => {
    ElMessage.error('请求参数异常')
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理返回结果
request.interceptors.response.use(
  response => {
    const res = response.data
    // 假设后端返回格式：{ code: 200, message: '', data: {} }
    // 这里只判断成功，失败交给业务层处理（更灵活）
    return res
  },
  error => {
    if (error.response) {
      const status = error.response.status
      const errMsg = error.response.data?.message || '请求失败'
      switch (status) {
        case 401: {
          ElMessage.error('登录已过期，请重新登录')
          const authStore = useAuthStore()
          authStore.logout() // 清空 token
          // 跳转到登录页，携带当前页面路径（方便登录后返回）
          router.push({ path: '/login', query: { redirect: router.currentRoute.fullPath } })
          break
        }
        case 403:
          ElMessage.error('无权限访问，请联系管理员')
          break
        case 404:
          ElMessage.error(`请求地址不存在：${error.response.config.url}`)
          break
        case 500:
          ElMessage.error('服务器内部错误，请稍后重试')
          break
        default:
          ElMessage.error(errMsg)
      }
    } else if (error.request) {
      ElMessage.error('请求超时，请检查网络')
    } else {
      ElMessage.error('请求配置异常')
    }
    return Promise.reject(error)
  }
)

export default request