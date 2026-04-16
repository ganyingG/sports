<template>
  <el-container class="main-layout">
    <!-- 深色侧边栏 -->
    <el-aside width="240px" class="dark-sidebar">
      <div class="sidebar-content">
        <div class="sidebar-header">
          <div class="logo">
            <el-icon class="logo-icon"><Trophy /></el-icon>
            <span class="logo-text">体育赛事管理</span>
          </div>
        </div>
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="handleMenuSelect"
          background-color="transparent"
          text-color="#475569"
          active-text-color="#E89BA8"
        >
          <el-menu-item
            v-for="item in menuItems"
            :key="item.path"
            :index="item.path"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </el-menu-item>
        </el-menu>

        <!-- 侧边栏底部用户信息 -->
        <div class="sidebar-user">
          <div class="user-avatar">
            <el-avatar :size="42" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
          </div>
          <div class="user-info">
            <div class="user-name">{{ userInfo?.username || '用户' }}</div>
            <div class="user-role">{{ roleName }}</div>
          </div>
          <el-button
            class="logout-btn"
            type="primary"
            link
            @click="handleLogout"
          >
            <el-icon><SwitchButton /></el-icon>
          </el-button>
        </div>
      </div>
    </el-aside>

    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <h2>{{ pageTitle }}</h2>
        </div>
        <div class="header-right">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              <el-avatar :size="32" src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png" />
              <span class="user-name-text">{{ userInfo?.username || '用户' }}</span>
              <el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { Trophy, HomeFilled, User, Medal, Monitor, Box, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const activeMenu = computed(() => route.path)
const pageTitle = computed(() => route.meta.title || '体育赛事管理系统')

// 从 localStorage 获取用户信息
const userInfo = computed(() => {
  const info = localStorage.getItem('userInfo')
  return info ? JSON.parse(info) : { username: '用户', userType: 'student' }
})

// 根据用户类型判断是否为学生
const isStudent = computed(() => userInfo.value.userType === 'student')

// 根据用户类型决定显示哪些菜单
const menuItems = computed(() => {
  const items = [
    { path: '/dashboard', icon: HomeFilled, title: '首页' }
  ]
  if (isStudent.value) {
    // 学生角色：显示首页
  } else {
    // 管理员角色：显示所有管理菜单
    items.push(
      { path: '/students', icon: User, title: '学生管理' },
      { path: '/projects', icon: Medal, title: '项目管理' },
      { path: '/referees', icon: Monitor, title: '裁判管理' },
      { path: '/equipment', icon: Box, title: '器材管理' }
    )
  }
  return items
})

// 角色名称映射
const roleName = computed(() => {
  return isStudent.value ? '学生' : '管理员'
})

const handleMenuSelect = (index) => {
  router.push(index)
}

const handleCommand = (command) => {
  if (command === 'logout') {
    handleLogout()
  }
}

const handleLogout = () => {
  authStore.logoutAction()
  localStorage.removeItem('token')
  localStorage.removeItem('userInfo')
  router.push('/login')
}
</script>

<style scoped>
.main-layout {
  height: 100vh;
}

/* 纯白侧边栏 - 现代SaaS风格 */
.dark-sidebar {
  background: #FFFFFF;
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.06);
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #E5E7EB;
}

.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sidebar-header {
  padding: 0;
  flex-shrink: 0;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #E5E7EB;
}

.logo-icon {
  font-size: 22px;
  color: #4CAF50;
  margin-right: 10px;
}

.logo-text {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.5px;
}

.sidebar-menu {
  border-right: none;
  background: transparent;
  padding: 12px 0;
  flex: 1;
}

.sidebar-menu :deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  margin: 4px 12px;
  padding-left: 16px !important;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 14px;
  font-weight: 500;
  color: #6B7280;
}

.sidebar-menu :deep(.el-menu-item:hover) {
  background: #F3F4F6 !important;
  color: #111827;
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: #E8F5E9 !important;
  color: #2E7D32 !important;
  border-left: 3px solid #2E7D32;
  padding-left: 13px !important;
}

.sidebar-menu :deep(.el-menu-item .el-icon) {
  font-size: 18px;
  margin-right: 12px;
  color: #6B7280;
}

.sidebar-menu :deep(.el-menu-item.is-active .el-icon) {
  color: #2E7D32;
}

.sidebar-user {
  display: flex;
  align-items: center;
  padding: 16px;
  margin: 12px;
  border-radius: 12px;
  background: #F9FAFB;
  border: 1px solid #E5E7EB;
  flex-shrink: 0;
}

.user-avatar {
  margin-right: 12px;
}

.user-avatar :deep(.el-avatar) {
  border: 2px solid #4CAF50;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
}

.logout-btn {
  padding: 8px;
  color: #6B7280;
}

.logout-btn:hover {
  color: #4CAF50;
}

/* 主容器 */
.main-container {
  background: #F3F4F6;
  min-height: 100vh;
}

/* 顶部导航 */
.header {
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  border-bottom: 1px solid #e5e7eb;
  height: 64px;
}

.header-left h2 {
  margin: 0;
  font-size: 22px;
  color: #111827;
  font-weight: 600;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.3s ease;
  color: #4b5563;
  font-weight: 500;
}

.user-dropdown:hover {
  background: #f3f4f6;
}

.user-name-text {
  font-size: 14px;
  color: #374151;
}

/* 主内容区 */
.main-content {
  background: transparent;
  padding: 24px 28px;
  height: calc(100vh - 64px);
  overflow-y: auto;
}
</style>
