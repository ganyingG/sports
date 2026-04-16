<template>
  <div class="registration-page">
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 可报名项目 -->
      <el-tab-pane label="可报名项目" name="projects">
        <el-card>
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="title-icon"><Medal /></el-icon>
                <span>可选项目</span>
              </div>
            </div>
          </template>

          <!-- 搜索栏 -->
          <div class="search-section">
            <el-input
              v-model="searchName"
              placeholder="请输入项目名称"
              :prefix-icon="Search"
              clearable
              @clear="loadProjects"
              @keyup.enter="loadProjects"
              class="search-input"
            />
            <el-button type="primary" :icon="Search" @click="loadProjects">搜索</el-button>
          </div>

          <!-- 项目卡片列表 -->
          <div v-loading="loading" class="project-grid">
            <div
              v-for="project in projectList"
              :key="project.projectId"
              class="project-card"
            >
              <div class="project-header">
                <h3>{{ project.projectName }}</h3>
                <el-tag :type="project.projectType === '个人赛' ? 'success' : 'warning'">
                  {{ project.projectType }}
                </el-tag>
              </div>
              <div class="project-info">
                <p><el-icon><Location /></el-icon> 场地：{{ project.venue }}</p>
                <p><el-icon><Clock /></el-icon> 时间：{{ project.competitionTime }}</p>
                <p><el-icon><User /></el-icon> 限员：{{ project.participantLimit }}人</p>
                <p><el-icon><Collection /></el-icon> 类别：{{ getCategoryName(project.categoryId) }}</p>
              </div>
              <div class="project-actions">
                <el-button
                  type="primary"
                  :disabled="!canRegister(project)"
                  @click="handleRegister(project)"
                >
                  {{ isRegistered(project) ? '已报名' : (canRegister(project) ? '立即报名' : '不在报名时间') }}
                </el-button>
              </div>
            </div>
          </div>

          <!-- 空状态 -->
          <el-empty v-if="!loading && projectList.length === 0" description="暂无可以报名的项目" />

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[8, 16, 24, 32]"
            layout="total, sizes, prev, pager, next"
            @size-change="loadProjects"
            @current-change="loadProjects"
            style="margin-top: 20px; justify-content: flex-end"
          />
        </el-card>
      </el-tab-pane>

      <!-- 我的报名 -->
      <el-tab-pane label="我的报名" name="myregistrations">
        <el-card>
          <template #header>
            <div class="card-header">
              <div class="header-title">
                <el-icon class="title-icon"><Document /></el-icon>
                <span>我的报名记录</span>
              </div>
            </div>
          </template>

          <el-table
            :data="myRegistrations"
            v-loading="loadingMyReg"
            border
            style="width: 100%"
          >
            <el-table-column prop="projectName" label="项目名称" width="180" />
            <el-table-column prop="projectType" label="项目类型" width="100">
              <template #default="{ row }">
                <el-tag :type="row.projectType === '个人赛' ? 'success' : 'warning'">
                  {{ row.projectType }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="venue" label="比赛场地" width="150" />
            <el-table-column prop="competitionTime" label="比赛时间" width="180" />
            <el-table-column prop="registrationTime" label="报名时间" width="180" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending' || row.status === '已报名'"
                  type="danger"
                  link
                  @click="handleCancel(row)"
                >
                  取消报名
                </el-button>
                <el-button
                  type="danger"
                  link
                  @click="handleDelete(row)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 空状态 -->
          <el-empty v-if="!loadingMyReg && myRegistrations.length === 0" description="暂无报名记录" />

          <!-- 分页 -->
          <el-pagination
            v-model:current-page="myRegPage"
            v-model:page-size="myRegSize"
            :total="myRegTotal"
            :page-sizes="[10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="loadMyRegistrations"
            @current-change="loadMyRegistrations"
            style="margin-top: 20px; justify-content: flex-end"
          />
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Medal, Location, Clock, User, Collection, Document } from '@element-plus/icons-vue'
import { getProjectPage } from '../api/project'
import { addRegistration, getStudentRegistrationList, getStudentRegistrations, cancelRegistration, deleteRegistration } from '../api/registration'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()

// Tab 切换
const activeTab = ref('projects')

// 项目列表相关
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(8)
const total = ref(0)
const loading = ref(false)
const projectList = ref([])

// 已报名的项目信息 Map<projectId, registration>
const registeredProjects = ref(new Map())

// 我的报名相关
const myRegPage = ref(1)
const myRegSize = ref(10)
const myRegTotal = ref(0)
const loadingMyReg = ref(false)
const myRegistrations = ref([])

// 类别映射
const categoryMap = {
  'C001': '田径项目',
  'C002': '球类项目',
  'C003': '游泳项目',
  'C004': '器械项目'
}

const getCategoryName = (categoryId) => {
  return categoryMap[categoryId] || categoryId
}

// 状态相关
const getStatusType = (status) => {
  const map = {
    'pending': 'warning',
    'confirmed': 'success',
    'cancelled': 'info',
    'rejected': 'danger'
  }
  return map[status] || 'info'
}

const getStatusText = (status) => {
  const map = {
    'pending': '待确认',
    'confirmed': '已确认',
    'cancelled': '已取消',
    'rejected': '已拒绝'
  }
  return map[status] || status
}

// 判断是否可以报名
const canRegister = (project) => {
  // 检查报名时间
  if (!project.registrationStart || !project.registrationEnd) {
    return false
  }
  const now = new Date()
  const start = new Date(project.registrationStart)
  const end = new Date(project.registrationEnd)
  // 不在报名时间内，不能报名
  if (now < start || now > end) {
    return false
  }
  // 检查是否有有效的报名（pending或confirmed）
  const registration = registeredProjects.value.get(project.projectId)
  if (registration && (registration.status === 'pending' || registration.status === '已报名' || registration.status === 'confirmed' || registration.status === '已确认')) {
    return false
  }
  return true
}

// 判断是否已报名（有效的报名）
const isRegistered = (project) => {
  const registration = registeredProjects.value.get(project.projectId)
  return registration && (registration.status === 'pending' || registration.status === '已报名' || registration.status === 'confirmed' || registration.status === '已确认')
}

// 加载可选项目
const loadProjects = async () => {
  loading.value = true
  try {
    const res = await getProjectPage({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      projectName: searchName.value || undefined
    })
    if (res.data) {
      console.log('项目数据:', res.data)
      // 去重：基于 projectId
      const records = res.data.records || res.data.list || []
      console.log('原始记录数:', records.length)
      const uniqueMap = new Map()
      records.forEach(item => {
        if (!uniqueMap.has(item.projectId)) {
          uniqueMap.set(item.projectId, item)
        }
      })
      console.log('去重后记录数:', uniqueMap.size)
      projectList.value = Array.from(uniqueMap.values())
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error('加载项目失败:', error)
    ElMessage.error('加载项目失败')
  } finally {
    loading.value = false
  }
}

// 加载我的报名
const loadMyRegistrations = async () => {
  loadingMyReg.value = true
  try {
    // 从 localStorage 获取 userId
    const token = localStorage.getItem('token')
    if (!token) {
      ElMessage.error('请先登录')
      return
    }

    // 假设 token 中包含 userId（需要后端解析或前端存储）
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const userId = userInfo.userId

    if (!userId) {
      ElMessage.error('无法获取用户信息')
      return
    }

    const res = await getStudentRegistrationList(userId)
    if (res.data) {
      myRegistrations.value = res.data || []
      myRegTotal.value = res.data?.length || 0
      // 更新已报名项目信息 Map
      const map = new Map()
      res.data.forEach(item => {
        if (item.projectId) {
          map.set(item.projectId, item)
        }
      })
      registeredProjects.value = map
    }
  } catch (error) {
    console.error('加载报名记录失败:', error)
    ElMessage.error('加载报名记录失败')
  } finally {
    loadingMyReg.value = false
  }
}

// 报名
const handleRegister = async (project) => {
  try {
    await ElMessageBox.confirm(`确认报名「${project.projectName}」吗？`, '提示', {
      type: 'warning'
    })

    const token = localStorage.getItem('token')
    const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}')
    const userId = userInfo.userId

    if (!userId) {
      ElMessage.error('无法获取用户信息')
      return
    }

    await addRegistration({
      studentId: userId,
      projectId: project.projectId,
      registrationTime: new Date().toISOString(),
      status: 'pending'
    })

    ElMessage.success('报名成功')
    loadMyRegistrations()
    loadProjects() // 刷新项目列表以更新按钮状态
    activeTab.value = 'myregistrations'
  } catch (error) {
    if (error !== 'cancel') {
      console.error('报名失败:', error)
      ElMessage.error('报名失败: ' + (error.message || '未知错误'))
    }
  }
}

// 取消报名
const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确认取消该报名吗？', '提示', {
      type: 'warning'
    })

    await cancelRegistration(row.registrationId)
    ElMessage.success('取消成功')
    loadMyRegistrations()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消报名失败:', error)
      ElMessage.error('取消报名失败')
    }
  }
}

// 删除报名记录
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该报名记录吗？', '提示', {
      type: 'warning'
    })

    await deleteRegistration(row.registrationId)
    ElMessage.success('删除成功')
    loadMyRegistrations()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除报名失败:', error)
      ElMessage.error('删除报名失败')
    }
  }
}

onMounted(() => {
  loadProjects()
  loadMyRegistrations()
})
</script>

<style scoped>
.registration-page {
  padding: 0;
}

.registration-page :deep(.el-tabs) {
  border-radius: 16px;
}

/* 卡片样式 */
.registration-page :deep(.el-card) {
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
}

.registration-page :deep(.el-card__header) {
  padding: 16px 24px;
  border-bottom: 1px solid #E5E7EB;
  background: #FFFFFF;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 17px;
  font-weight: 600;
  color: #111827;
}

.title-icon {
  margin-right: 10px;
  color: #4CAF50;
  font-size: 22px;
}

/* 搜索栏 */
.search-section {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  align-items: center;
}

.search-input {
  width: 300px;
  border-radius: 10px;
  border: 1.5px solid #E5E7EB;
}

.search-input:focus {
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}

/* 项目卡片网格 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  transition: all 0.3s;
  background: #FFFFFF;
}

.project-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border-color: #4CAF50;
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #E5E7EB;
}

.project-header h3 {
  margin: 0;
  font-size: 16px;
  color: #111827;
}

.project-info {
  margin-bottom: 16px;
}

.project-info p {
  display: flex;
  align-items: center;
  margin: 8px 0;
  font-size: 14px;
  color: #4B5563;
}

.project-info .el-icon {
  margin-right: 8px;
  color: #4CAF50;
}

.project-actions {
  text-align: center;
}

.registration-page :deep(.el-button--primary) {
  background: #b4e9b6;
  border-color: #b4e9b6;
  border-radius: 10px;
  color: #4CAF50;
}

.registration-page :deep(.el-button--primary:hover) {
  background: #a3d9a4;
  border-color: #a3d9a4;
}

.registration-page :deep(.el-button--primary:disabled) {
  background: #E5E7EB;
  border-color: #E5E7EB;
  color: #9CA3AF;
}

/* 表格样式 */
.registration-page :deep(.el-table) {
  --el-table-border-color: #E5E7EB;
  --el-table-text-color: #4B5563;
  font-size: 14px;
}

.registration-page :deep(.el-table th.el-table__cell) {
  background: #F9FAFB;
  color: #111827;
  font-weight: 600;
}

.registration-page :deep(.el-table tr:hover) {
  background: #E8F5E9;
}

.registration-page :deep(.el-button--danger) {
  color: #EF4444;
}

/* 分页样式 */
.registration-page :deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
}

.registration-page :deep(.el-pagination .el-pager li.is-active) {
  background: #b4e9b6;
}
</style>