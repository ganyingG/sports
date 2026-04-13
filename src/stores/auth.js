// src/stores/auth.js
import { defineStore } from 'pinia'
import { login } from '../api/auth' // 引入你封装的登录接口

export const useAuthStore = defineStore('auth', {
  // 状态管理
  state: () => ({
    token: localStorage.getItem('token') || '', // 从本地存储读取token
    userInfo: null, // 用户信息
    isLogin: false // 登录状态标记
  }),

  // 核心方法
  actions: {
    /**
     * 登录操作 - 带完整空值校验和异常处理
     * @param {Object} loginForm - 登录表单数据 {username, password}
     * @returns {Boolean} 登录是否成功
     */
    async loginAction(loginForm) {
      try {
        // 1. 调用登录接口（已封装异常捕获）
        const res = await login(loginForm)
        
        // 调试日志：打印原始返回数据，方便排查后端问题
        console.log('🔍 登录接口原始返回数据：', res)

        // 2. 多层空值校验（核心修复点）
        // 兜底：如果res.data不存在，默认空对象，避免解构报错
        const responseData = res?.data || {}
        const token = responseData.token

        // 3. 校验token是否有效
        if (!token || token.trim() === '') {
          throw new Error('登录失败：服务器未返回有效token，请检查账号密码')
        }

        // 4. 登录成功：存储token和用户信息
        this.token = token
        this.userInfo = responseData.userInfo || null // 兜底空值
        this.isLogin = true
        localStorage.setItem('token', token) // 持久化到本地存储

        console.log('✅ 登录成功，token已存储：', token)
        return true

      } catch (error) {
        // 5. 登录失败：清空所有状态，避免脏数据
        console.error('❌ 登录异常详情：', error)
        this.token = ''
        this.userInfo = null
        this.isLogin = false
        localStorage.removeItem('token') // 清除本地无效token

        // 抛出错误，让登录页面捕获并提示用户
        throw new Error(error.message || '登录失败，请稍后重试')
      }
    },

    /**
     * 退出登录 - 补充完整功能
     */
    logoutAction() {
      this.token = ''
      this.userInfo = null
      this.isLogin = false
      localStorage.removeItem('token')
      console.log('🔚 已退出登录，清除所有登录状态')
    },

    /**
     * 刷新登录状态（如页面刷新后恢复登录状态）
     */
    refreshLoginState() {
      const localToken = localStorage.getItem('token')
      if (localToken) {
        this.token = localToken
        this.isLogin = true
      }
    }
  },

  // 计算属性（可选，方便页面使用）
  getters: {
    // 判断是否已登录
    isAuthenticated: (state) => !!state.token && state.isLogin
  }
})