import request from '../utils/request'

// 登录接口（已修复）
export const login = async (data) => {
  try {
    const response = await request({
      url: '/auth/login',
      method: 'post',
      data
    })
    return response || {}
  } catch (error) {
    console.error('登录请求失败：', error)
    throw new Error(error.message || '登录请求失败，请检查网络')
  }
}

// 注册接口（新增/修复）
export const register = async (data) => {
  try {
    const response = await request({
      url: '/auth/register',
      method: 'post',
      data
    })
    // 兜底：避免返回 null/undefined 导致后续报错
    return response || {}
  } catch (error) {
    console.error('注册请求失败：', error)
    // 区分不同错误类型，精准提示
    if (error.message.includes('409')) {
      throw new Error('注册失败：用户名已存在')
    } else if (error.message.includes('网络')) {
      throw new Error('注册失败：网络异常，请检查连接')
    } else {
      throw new Error(error.message || '注册失败，请稍后重试')
    }
  }
}