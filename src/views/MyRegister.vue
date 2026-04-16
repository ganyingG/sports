<template>
  <div class="register-page">
    <div class="register-card">
      <div class="card-header">
        <el-icon size="32" color="#4CAF50"><Trophy /></el-icon>
        <h1 class="card-title">注册账号</h1>
      </div>

      <el-form
        :model="registerForm"
        :rules="rules"
        ref="registerFormRef"
        class="register-form"
      >
        <el-form-item prop="username">
          <el-input
            v-model="registerForm.username"
            placeholder="用户名（至少4位）"
            size="large"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            type="password"
            placeholder="密码（至少6位）"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item prop="confirmPassword">
          <el-input
            v-model="registerForm.confirmPassword"
            type="password"
            placeholder="确认密码"
            size="large"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-button
          type="primary"
          size="large"
          :loading="loading"
          style="width: 100%"
          @click="handleRegister"
        >
          注 册
        </el-button>
      </el-form>

      <div class="card-footer">
        <span>已有账号？</span>
        <router-link to="/login">立即登录</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { ElMessage } from 'element-plus'
import { Trophy } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const registerFormRef = ref(null)
const loading = ref(false)

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: ''
})

const validatePassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'))
  } else if (value.length < 6) {
    callback(new Error('密码长度不能少于6位'))
  } else {
    if (registerForm.confirmPassword !== '') {
      registerFormRef.value.validateField('confirmPassword')
    }
    callback()
  }
}

const validateConfirmPassword = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'))
  } else if (value !== registerForm.password) {
    callback(new Error('两次输入密码不一致'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, message: '用户名长度不能少于4位', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePassword, trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  await registerFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const success = await authStore.registerAction(registerForm)
        if (success) {
          ElMessage.success('注册成功，请登录')
          router.push('/login')
        }
      } catch (error) {
        ElMessage.error('注册失败，请稍后重试')
      } finally {
        loading.value = false
      }
    }
  })
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F3F4F6;
}

.register-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.card-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #111827;
}

.register-form {
  margin-bottom: 24px;
}

.register-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.register-form :deep(.el-input__inner) {
  height: 44px;
}

.register-form :deep(.el-button--primary) {
  background: #b4e9b6;
  border-color: #b4e9b6;
}

.register-form :deep(.el-button--primary:hover) {
  background: #a3d9a4;
  border-color: #a3d9a4;
}

.card-footer {
  text-align: center;
  color: #6B7280;
  font-size: 14px;
}

.card-footer a {
  color: #4CAF50;
  text-decoration: none;
  margin-left: 4px;
}

.card-footer a:hover {
  text-decoration: underline;
}
</style>