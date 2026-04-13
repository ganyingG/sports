<template>
  <div class="projects-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="title-icon"><Medal /></el-icon>
            <span>项目管理</span>
          </div>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加项目</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchName"
          placeholder="请输入项目名称"
          :prefix-icon="Search"
          clearable
          @clear="loadData"
          @keyup.enter="loadData"
          class="search-input"
        />
        <el-button type="primary" :icon="Search" @click="loadData">搜索</el-button>
      </div>

      <!-- 表格 -->
      <el-table
        :data="projectList"
        v-loading="loading"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="projectId" label="项目编号" width="120" />
        <el-table-column prop="projectName" label="项目名称" width="180" />
        <el-table-column prop="categoryId" label="类别" width="100">
          <template #default="{ row }">
            <el-tag type="primary">{{ getCategoryName(row.categoryId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="venue" label="场地" width="150" />
        <el-table-column prop="competitionTime" label="比赛时间" width="180" />
        <el-table-column prop="projectType" label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="row.projectType === '个人赛' ? 'success' : 'warning'">
              {{ row.projectType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="participantLimit" label="人数限制" width="100" />
        <el-table-column prop="equipmentRequired" label="需要器材" width="100">
          <template #default="{ row }">
            <el-tag :type="row.equipmentRequired ? 'danger' : 'info'">
              {{ row.equipmentRequired ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link :icon="Edit" @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link :icon="Delete" @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="loadData"
        @current-change="loadData"
        style="margin-top: 20px; justify-content: flex-end"
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        :model="projectForm"
        :rules="rules"
        ref="projectFormRef"
        label-width="100px"
      >
        <el-form-item label="项目编号" prop="projectId">
          <el-input v-model="projectForm.projectId" placeholder="请输入项目编号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="项目名称" prop="projectName">
          <el-input v-model="projectForm.projectName" placeholder="请输入项目名称" />
        </el-form-item>
        <el-form-item label="类别" prop="categoryId">
          <el-select v-model="projectForm.categoryId" placeholder="请选择类别" style="width: 100%">
            <el-option label="田径项目" value="C001" />
            <el-option label="球类项目" value="C002" />
            <el-option label="游泳项目" value="C003" />
            <el-option label="器械项目" value="C004" />
          </el-select>
        </el-form-item>
        <el-form-item label="场地" prop="venue">
          <el-input v-model="projectForm.venue" placeholder="请输入场地" />
        </el-form-item>
        <el-form-item label="比赛时间" prop="competitionTime">
          <el-date-picker
            v-model="projectForm.competitionTime"
            type="datetime"
            placeholder="选择比赛时间"
            style="width: 100%"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="规则说明" prop="rules">
          <el-input
            v-model="projectForm.rules"
            type="textarea"
            :rows="3"
            placeholder="请输入规则说明"
          />
        </el-form-item>
        <el-form-item label="项目类型" prop="projectType">
          <el-radio-group v-model="projectForm.projectType">
            <el-radio label="个人赛">个人赛</el-radio>
            <el-radio label="团体赛">团体赛</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="人数限制" prop="participantLimit">
          <el-input-number v-model="projectForm.participantLimit" :min="1" :max="200" style="width: 100%" />
        </el-form-item>
        <el-form-item label="需要器材" prop="equipmentRequired">
          <el-switch v-model="projectForm.equipmentRequired" />
        </el-form-item>
        <el-form-item label="报名时间" prop="registrationRange">
          <el-date-picker
            v-model="registrationRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitLoading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive,  onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, Medal } from '@element-plus/icons-vue'
import {
  getProjectPage,
  addProject,
  updateProject,
  deleteProject
} from '../api/project'

// 查询参数
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 表格数据
const projectList = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加项目')
const isEdit = ref(false)
const submitLoading = ref(false)
const projectFormRef = ref(null)

// 报名时间范围
const registrationRange = ref([])

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

// 表单数据
const projectForm = reactive({
  projectId: '',
  projectName: '',
  categoryId: '',
  venue: '',
  competitionTime: '',
  rules: '',
  projectType: '个人赛',
  participantLimit: 10,
  equipmentRequired: false,
  registrationStart: '',
  registrationEnd: ''
})

// 表单验证规则
const rules = {
  projectId: [
    { required: true, message: '请输入项目编号', trigger: 'blur' },
    { pattern: /^P\d{3}$/, message: '项目编号格式不正确（如：P001）', trigger: 'blur' }
  ],
  projectName: [
    { required: true, message: '请输入项目名称', trigger: 'blur' },
    { min: 2, max: 50, message: '项目名称长度在2-50个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择类别', trigger: 'change' }
  ],
  venue: [
    { required: true, message: '请输入场地', trigger: 'blur' }
  ],
  competitionTime: [
    { required: true, message: '请选择比赛时间', trigger: 'change' }
  ],
  projectType: [
    { required: true, message: '请选择项目类型', trigger: 'change' }
  ],
  participantLimit: [
    { required: true, message: '请输入人数限制', trigger: 'blur' }
  ]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getProjectPage({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      projectName: searchName.value || undefined
    })
    console.log('项目数据响应:', res)
    if (res.data) {
      projectList.value = res.data.records || res.data.list || []
      if (res.data.total !== undefined && res.data.total > 0) {
        total.value = res.data.total
      } else if (res.data.pages && res.data.size) {
        total.value = res.data.pages * res.data.size
      } else {
        total.value = res.data.records?.length || 0
      }
    } else {
      projectList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败: ' + (error.message || '未知错误'))
    projectList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 添加
const handleAdd = () => {
  dialogTitle.value = '添加项目'
  isEdit.value = false
  registrationRange.value = []
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑项目'
  isEdit.value = true
  Object.assign(projectForm, row)
  registrationRange.value = [row.registrationStart, row.registrationEnd]
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该项目吗？', '提示', {
      type: 'warning'
    })
    await deleteProject(row.projectId)
    ElMessage.success('删除成功')
    loadData()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交
const handleSubmit = async () => {
  if (!projectFormRef.value) return
  
  await projectFormRef.value.validate(async (valid) => {
    if (valid) {
      // 处理报名时间
      if (registrationRange.value && registrationRange.value.length === 2) {
        projectForm.registrationStart = registrationRange.value[0]
        projectForm.registrationEnd = registrationRange.value[1]
      }
      
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateProject(projectForm)
          ElMessage.success('更新成功')
        } else {
          await addProject(projectForm)
          ElMessage.success('添加成功')
        }
        dialogVisible.value = false
        loadData()
      } catch (error) {
        ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
      } finally {
        submitLoading.value = false
      }
    }
  })
}

// 对话框关闭
const handleDialogClose = () => {
  if (projectFormRef.value) {
    projectFormRef.value.resetFields()
  }
  registrationRange.value = []
  Object.assign(projectForm, {
    projectId: '',
    projectName: '',
    categoryId: '',
    venue: '',
    competitionTime: '',
    rules: '',
    projectType: '个人赛',
    participantLimit: 10,
    equipmentRequired: false,
    registrationStart: '',
    registrationEnd: ''
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.projects-page {
  padding: 0;
}

/* 卡片样式 */
.projects-page :deep(.el-card) {
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
}

.projects-page :deep(.el-card__header) {
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
  color: #3B82F6;
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
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.projects-page :deep(.el-button--primary) {
  background: #3B82F6;
  border-color: #3B82F6;
  border-radius: 10px;
}

.projects-page :deep(.el-button--primary:hover) {
  background: #2563EB;
  border-color: #2563EB;
}

/* 表格样式 */
.projects-page :deep(.el-table) {
  --el-table-border-color: #E5E7EB;
  --el-table-text-color: #4B5563;
  font-size: 14px;
}

.projects-page :deep(.el-table th.el-table__cell) {
  background: #F9FAFB;
  color: #111827;
  font-weight: 600;
}

.projects-page :deep(.el-table tr:hover) {
  background: #EFF6FF;
}

.projects-page :deep(.el-button--primary) {
  color: #3B82F6;
}

.projects-page :deep(.el-button--danger) {
  color: #EF4444;
}

/* 分页样式 */
.projects-page :deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
}

.projects-page :deep(.el-pagination .el-pager li.is-active) {
  background: #3B82F6;
}

/* 对话框样式 */
.projects-page :deep(.el-dialog) {
  border-radius: 16px;
}

.projects-page :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.projects-page :deep(.el-dialog__title) {
  font-weight: 600;
  color: #111827;
  font-size: 18px;
}

.projects-page :deep(.el-dialog__body) {
  padding: 24px;
}

.projects-page :deep(.el-form-item__label) {
  color: #4B5563;
  font-weight: 500;
}

.projects-page :deep(.el-input),
.projects-page :deep(.el-select),
.projects-page :deep(.el-textarea) {
  border-radius: 10px;
  border: 1.5px solid #E5E7EB;
}

.projects-page :deep(.el-input:focus),
.projects-page :deep(.el-select:focus),
.projects-page :deep(.el-textarea:focus) {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* 日期选择器 */
.projects-page :deep(.el-date-editor.el-input) {
  border-radius: 10px;
}
</style>