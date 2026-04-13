<template>
  <div class="students-page">
    <el-card class="main-card">
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="title-icon"><User /></el-icon>
            <span>学生管理</span>
          </div>
          <el-button 
            type="primary" 
            :icon="Plus" 
            @click="handleAdd"
            class="add-btn"
          >添加学生</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <el-row :gutter="20" class="search-bar">
        <el-col :span="8" :xs="20" :sm="16" :md="12" :lg="8">
          <el-input
            v-model="searchName"
            placeholder="请输入学生姓名"
            :prefix-icon="Search"
            clearable
            @clear="loadData"
            @keyup.enter="loadData"
            class="search-input"
          />
        </el-col>
        <el-col :span="4" :xs="4" :sm="4" :md="3" :lg="4">
          <el-button 
            type="primary" 
            :icon="Search" 
            @click="loadData"
            class="search-btn"
          >搜索</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table
        :data="studentList"
        v-loading="loading"
        border
        stripe
        :header-cell-style="{ background: '#F9FAFB', color: '#111827', fontWeight: '600' }"
        :row-class-name="tableRowClassName"
        style="width: 100%; margin-top: 20px; --el-table-row-hover-bg-color: #f0f7ff"
        class="student-table"
      >
        <el-table-column prop="studentId" label="学号" width="140" align="center" />
        <el-table-column prop="name" label="姓名" width="100" align="center" />
        <el-table-column prop="gender" label="性别" width="80" align="center">
          <template #default="{ row }">
            <el-tag 
              :type="row.gender === 'm' ? 'primary' : 'danger'"
              class="gender-tag"
            >
              {{ row.gender === 'm' ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="age" label="年龄" width="80" align="center" />
        <el-table-column prop="deptId" label="院系" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="info" size="small">
              {{ getDeptName(row.deptId) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="手机号" width="140" align="center" />
        <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
        <el-table-column label="操作" width="200" fixed="right" align="center">
          <template #default="{ row }">
            <el-button 
              type="primary" 
              link 
              :icon="Edit" 
              @click="handleEdit(row)"
              class="edit-btn"
            >编辑</el-button>
            <el-button 
              type="danger" 
              link 
              :icon="Delete" 
              @click="handleDelete(row)"
              class="delete-btn"
            >删除</el-button>
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
        class="pagination"
        background
      />
    </el-card>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="550px"
      @close="handleDialogClose"
      class="student-dialog"
      draggable
      border
      shadow="hover"
    >
      <el-form
        :model="studentForm"
        :rules="rules"
        ref="studentFormRef"
        label-width="90px"
        class="student-form"
      >
        <el-form-item label="学号" prop="studentId" class="form-item">
          <el-input 
            v-model="studentForm.studentId" 
            placeholder="请输入学号（如：S20240001）" 
            :disabled="isEdit" 
            class="form-input"
          />
        </el-form-item>
        <el-form-item label="姓名" prop="name" class="form-item">
          <el-input 
            v-model="studentForm.name" 
            placeholder="请输入姓名" 
            class="form-input"
          />
        </el-form-item>
        <el-form-item label="性别" prop="gender" class="form-item">
          <el-radio-group v-model="studentForm.gender" class="gender-group">
            <el-radio label="m" class="gender-radio">
              <el-icon class="gender-icon"><User /></el-icon> 男
            </el-radio>
            <el-radio label="f" class="gender-radio">
              <el-icon class="gender-icon"><UserFilled /></el-icon> 女
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age" class="form-item">
          <el-input-number 
            v-model="studentForm.age" 
            :min="15" 
            :max="40" 
            style="width: 100%"
            class="age-input"
          />
        </el-form-item>
        <el-form-item label="院系" prop="deptId" class="form-item">
          <el-select 
            v-model="studentForm.deptId" 
            placeholder="请选择院系" 
            style="width: 100%"
            class="dept-select"
          >
            <el-option label="计算机学院" value="D001" />
            <el-option label="体育学院" value="D002" />
            <el-option label="机械工程学院" value="D003" />
            <el-option label="外国语学院" value="D004" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone" class="form-item">
          <el-input 
            v-model="studentForm.phone" 
            placeholder="请输入手机号" 
            class="form-input"
          />
        </el-form-item>
        <el-form-item label="备注" prop="remark" class="form-item">
          <el-input
            v-model="studentForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入备注（选填）"
            class="remark-input"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" class="cancel-btn">取消</el-button>
          <el-button 
            type="primary" 
            :loading="submitLoading" 
            @click="handleSubmit"
            class="submit-btn"
          >确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, User, UserFilled } from '@element-plus/icons-vue'
import {
  getStudentPage,
  addStudent,
  updateStudent,
  deleteStudent
} from '../api/student'

// 查询参数
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 表格数据
const studentList = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加学生')
const isEdit = ref(false)
const submitLoading = ref(false)
const studentFormRef = ref(null)

// 表单数据
const studentForm = reactive({
  studentId: '',
  name: '',
  gender: 'm',
  age: 20,
  deptId: '',
  phone: '',
  remark: ''
})

// 表单验证规则
const rules = {
  studentId: [
    { required: true, message: '请输入学号', trigger: 'blur' },
    { pattern: /^S\d{8}$/, message: '学号格式不正确（如：S20240001）', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2-20个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  deptId: [
    { required: true, message: '请选择院系', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getStudentPage({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      name: searchName.value || undefined
    })
    console.log('完整响应:', res)

    if (res.data) {
      studentList.value = res.data.records || res.data.list || []

      // 优先使用 total，如果没有则使用 pages * size 计算
      if (res.data.total !== undefined && res.data.total > 0) {
        total.value = res.data.total
      } else if (res.data.pages && res.data.size) {
        // 如果 total 为 0 但有数据，用 pages * size 估算
        total.value = res.data.pages * res.data.size
      } else {
        // 兜底：使用 records 长度
        total.value = res.data.records?.length || 0
      }
    } else {
      studentList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败: ' + (error.message || '未知错误'))
    studentList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 添加
const handleAdd = () => {
  dialogTitle.value = '添加学生'
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑学生'
  isEdit.value = true
  Object.assign(studentForm, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该学生吗？', '提示', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      closeOnClickModal: false
    })
    await deleteStudent(row.studentId)
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
  if (!studentFormRef.value) return
  
  await studentFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateStudent(studentForm)
          ElMessage.success('更新成功')
        } else {
          await addStudent(studentForm)
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
  if (studentFormRef.value) {
    studentFormRef.value.resetFields()
  }
  Object.assign(studentForm, {
    studentId: '',
    name: '',
    gender: 'm',
    age: 20,
    deptId: '',
    phone: '',
    remark: ''
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})

// 新增：表格行样式（隔行变色增强）
const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 1 ? 'table-row-even' : ''
}


const getDeptName = (deptId) => {
  console.log('getDeptName called with:', deptId)
  const deptMap = {
    'D001': '计算机学院',
    'D002': '体育学院',
    'D003': '机械工程学院',
    'D004': '外国语学院',
    'D005': '管理学院',
    'D006': '法学院',
    'D007': '电气学院',
    'D008': '土木学院',
    'D009': '化工学院',
    'D010': '材料学院',
    'D011': '生物学院'
  }
  const result = deptMap[deptId] || deptId
  console.log('getDeptName result:', result)
  return result
}
</script>

<style scoped>
/* 页面容器 */
.students-page {
  padding: 0;
  background: transparent;
}

/* 主卡片 */
.main-card {
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  overflow: hidden;
  background: #FFFFFF;
}

/* 卡片头部 */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  background-color: #FFFFFF;
  border-bottom: 1px solid #E5E7EB;
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

.add-btn {
  border-radius: 10px;
  padding: 12px 20px;
  font-weight: 600;
  transition: all 0.3s ease;
  background: #3B82F6;
  border: none;
  color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.add-btn:hover {
  background: #2563EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

/* 搜索栏 */
.search-bar {
  margin: 20px 24px 0;
  display: flex;
  align-items: center;
}

.search-input {
  border-radius: 10px;
  height: 42px;
  border: 1.5px solid #E5E7EB;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-btn {
  border-radius: 10px;
  height: 44px;
  font-weight: 600;
  width: 100%;
  background: #3B82F6;
  border: none;
  color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.search-btn:hover {
  background: #2563EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

/* 表格样式 */
.student-table {
  --el-table-border-color: #E5E7EB;
  --el-table-text-color: #4B5563;
  font-size: 14px;
}

.table-row-even {
  background-color: #F9FAFB;
}

.gender-tag {
  border-radius: 6px;
  padding: 3px 10px;
  border: none;
}

.edit-btn {
  color: #3B82F6;
  font-weight: 600;
  margin-right: 12px;
}

.edit-btn:hover {
  color: #2563EB;
  background: #EFF6FF;
}

.delete-btn {
  color: #EF4444;
  font-weight: 600;
}

.delete-btn:hover {
  color: #DC2626;
  background: #FEF2F2;
}

/* 分页样式 */
.pagination {
  margin-top: 24px;
  margin-right: 24px;
  display: flex;
  justify-content: flex-end;
  padding-bottom: 10px;
}

.pagination :deep(.el-pager li) {
  border-radius: 8px;
  margin: 0 4px;
}

.pagination :deep(.el-pager li.is-active) {
  background: #3B82F6;
  color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

/* 对话框样式 */
.student-dialog {
  --el-dialog-border-radius: 16px;
  --el-dialog-title-color: #111827;
  --el-dialog-title-font-size: 18px;
}

.student-form {
  padding: 10px 0;
}

.form-item {
  margin-bottom: 20px;
}

.form-input {
  border-radius: 10px;
  border: 1.5px solid #E5E7EB;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #3B82F6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gender-group {
  display: flex;
  gap: 20px;
}

.gender-radio {
  display: flex;
  align-items: center;
  font-size: 14px;
}

.gender-icon {
  margin-right: 4px;
  font-size: 16px;
}

.age-input {
  border-radius: 10px;
}

.dept-select {
  border-radius: 10px;
  border: 1.5px solid #E5E7EB;
}

.remark-input {
  border-radius: 10px;
  border: 1.5px solid #E5E7EB;
}

/* 对话框底部按钮 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.cancel-btn {
  border-radius: 10px;
  padding: 10px 20px;
  border: 1px solid #E5E7EB;
  color: #4B5563;
}

.cancel-btn:hover {
  background: #F9FAFB;
  border-color: #D1D5DB;
}

.submit-btn {
  border-radius: 10px;
  padding: 12px 24px;
  font-weight: 600;
  background: #3B82F6;
  border: none;
  color: #FFFFFF;
  box-shadow: 0 2px 4px rgba(59, 130, 246, 0.3);
}

.submit-btn:hover {
  background: #2563EB;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.4);
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .students-page {
    padding: 0;
  }

  .main-card {
    border-radius: 12px;
  }
}

@media (max-width: 768px) {
  .search-bar {
    flex-direction: column;
    gap: 12px;
  }

  .el-col {
    width: 100% !important;
  }

  .student-dialog {
    width: 90% !important;
  }
}
</style>