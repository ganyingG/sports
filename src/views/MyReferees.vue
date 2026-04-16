<template>
  <div class="referees-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="title-icon"><Monitor /></el-icon>
            <span>裁判管理</span>
          </div>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加裁判</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-section">
        <el-select v-model="searchType" style="width: 120px; margin-right: 10px">
          <el-option label="裁判姓名" value="name" />
          <el-option label="项目名称" value="projectName" />
        </el-select>
        <el-input
          v-model="searchName"
          :placeholder="searchType === 'name' ? '请输入裁判姓名' : '请输入项目名称'"
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
        :data="refereeList"
        v-loading="loading"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="refereeId" label="裁判编号" width="140" />
        <el-table-column prop="name" label="姓名" width="100" />
        <el-table-column prop="gender" label="性别" width="80">
          <template #default="{ row }">
            <el-tag :type="row.gender === 'm' ? 'primary' : 'danger'">
              {{ row.gender === 'm' ? '男' : '女' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="职称" width="120">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.title }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deptId" label="院系" width="120">
          <template #default="{ row }">
            <el-tag type="info" size="small">{{ getDeptName(row.deptId) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="phone" label="联系电话" width="140" />
        <el-table-column label="执裁项目" min-width="150" align="center">
          <template #default="{ row }">
            <el-tooltip
              v-if="refereeProjectsCache[row.refereeId]?.length > 0"
              placement="top"
              effect="light"
            >
              <template #content>
                <div style="max-height: 200px; overflow-y: auto">
                  <div v-for="(project, index) in refereeProjectsCache[row.refereeId]" :key="index">
                    {{ project }}
                  </div>
                </div>
              </template>
              <el-tag type="success" size="small">
                {{ refereeProjectsCache[row.refereeId].length }} 个项目
              </el-tag>
            </el-tooltip>
            <span v-else class="no-project">-</span>
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
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        :model="refereeForm"
        :rules="rules"
        ref="refereeFormRef"
        label-width="100px"
      >
        <el-form-item label="裁判编号" prop="refereeId">
          <el-input v-model="refereeForm.refereeId" placeholder="请输入裁判编号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="refereeForm.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="refereeForm.gender">
            <el-radio label="m">男</el-radio>
            <el-radio label="f">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="职称" prop="title">
          <el-select v-model="refereeForm.title" placeholder="请选择职称" style="width: 100%">
            <el-option label="国家级裁判" value="国家级裁判" />
            <el-option label="一级裁判" value="一级裁判" />
            <el-option label="二级裁判" value="二级裁判" />
            <el-option label="三级裁判" value="三级裁判" />
          </el-select>
        </el-form-item>
        <el-form-item label="院系" prop="deptId">
          <el-select v-model="refereeForm.deptId" placeholder="请选择院系" style="width: 100%">
            <el-option label="计算机学院" value="D001" />
            <el-option label="体育学院" value="D002" />
            <el-option label="机械工程学院" value="D003" />
            <el-option label="外国语学院" value="D004" />
          </el-select>
        </el-form-item>
        <el-form-item label="联系电话" prop="phone">
          <el-input v-model="refereeForm.phone" placeholder="请输入联系电话" />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search, Edit, Delete, Monitor } from '@element-plus/icons-vue'
import {
  getRefereePage,
  addReferee,
  updateReferee,
  deleteReferee,
  getRefereeProjects
} from '../api/referee'

// 查询参数
const searchName = ref('')
const searchType = ref('name')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 表格数据
const refereeList = ref([])

// 项目名称缓存
const refereeProjectsCache = ref({})

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加裁判')
const isEdit = ref(false)
const submitLoading = ref(false)
const refereeFormRef = ref(null)

// 表单数据
const refereeForm = reactive({
  refereeId: '',
  name: '',
  gender: 'm',
  title: '',
  deptId: '',
  phone: ''
})

// 表单验证规则
const rules = {
  refereeId: [
    { required: true, message: '请输入裁判编号', trigger: 'blur' },
    { pattern: /^R\d{3}$/, message: '裁判编号格式不正确（如：R001）', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2-20个字符', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  title: [
    { required: true, message: '请选择职称', trigger: 'change' }
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
    const params = {
      pageNum: currentPage.value,
      pageSize: pageSize.value
    }
    if (searchType.value === 'name') {
      params.name = searchName.value || undefined
    } else {
      params.projectName = searchName.value || undefined
    }
    const res = await getRefereePage(params)
    console.log('裁判数据响应:', res)
    if (res.data) {
      refereeList.value = res.data.records || res.data.list || []
      if (res.data.total !== undefined && res.data.total > 0) {
        total.value = res.data.total
      } else if (res.data.pages && res.data.size) {
        total.value = res.data.pages * res.data.size
      } else {
        total.value = res.data.records?.length || 0
      }

      // 加载每个裁判的项目名称
      for (const referee of refereeList.value) {
        try {
          const projectRes = await getRefereeProjects(referee.refereeId)
          refereeProjectsCache.value[referee.refereeId] = projectRes.data || []
        } catch (e) {
          refereeProjectsCache.value[referee.refereeId] = []
        }
      }
    } else {
      refereeList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败: ' + (error.message || '未知错误'))
    refereeList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 添加
const handleAdd = () => {
  dialogTitle.value = '添加裁判'
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑裁判'
  isEdit.value = true
  Object.assign(refereeForm, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该裁判吗？', '提示', {
      type: 'warning'
    })
    await deleteReferee(row.refereeId)
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
  if (!refereeFormRef.value) return
  
  await refereeFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateReferee(refereeForm)
          ElMessage.success('更新成功')
        } else {
          await addReferee(refereeForm)
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
  if (refereeFormRef.value) {
    refereeFormRef.value.resetFields()
  }
  Object.assign(refereeForm, {
    refereeId: '',
    name: '',
    gender: 'm',
    title: '',
    deptId: '',
    phone: ''
  })
}

// 学院序号转名称
const getDeptName = (deptId) => {
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
  return deptMap[deptId] || deptId
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.referees-page {
  padding: 0;
}

/* 卡片样式 */
.referees-page :deep(.el-card) {
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
}

.referees-page :deep(.el-card__header) {
  padding: 16px 24px;
  border-bottom: 1px solid #E5E7EB;
  background: #FFFFFF;
}

/* 卡片头部 */
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
  font-size: 20px;
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

.referees-page :deep(.el-button--primary) {
  background: #b4e9b6;
  border-color: #b4e9b6;
  border-radius: 10px;
}

.referees-page :deep(.el-button--primary:hover) {
  background: #a3d9a4;
  border-color: #a3d9a4;
}

/* 表格样式 */
.referees-page :deep(.el-table) {
  --el-table-border-color: #E5E7EB;
  --el-table-text-color: #4B5563;
  font-size: 14px;
}

.referees-page :deep(.el-table th.el-table__cell) {
  background: #F9FAFB;
  color: #111827;
  font-weight: 600;
}

.referees-page :deep(.el-table tr:hover) {
  background: #E8F5E9;
}

.referees-page :deep(.el-button--primary) {
  color: #4CAF50;
}

.referees-page :deep(.el-button--danger) {
  color: #EF4444;
}

/* 分页样式 */
.referees-page :deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
}

.referees-page :deep(.el-pagination .el-pager li.is-active) {
  background: #b4e9b6;
}

/* 对话框样式 */
.referees-page :deep(.el-dialog) {
  border-radius: 16px;
}

.referees-page :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.referees-page :deep(.el-dialog__title) {
  font-weight: 600;
  color: #111827;
  font-size: 18px;
}

.referees-page :deep(.el-dialog__body) {
  padding: 24px;
}

.referees-page :deep(.el-form-item__label) {
  color: #4B5563;
  font-weight: 500;
}

.referees-page :deep(.el-input),
.referees-page :deep(.el-select) {
  border-radius: 10px;
  border: 1.5px solid #E5E7EB;
}

.referees-page :deep(.el-input:focus),
.referees-page :deep(.el-select:focus) {
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}
</style>