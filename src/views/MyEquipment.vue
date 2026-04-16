<template>
  <div class="equipment-page">
    <el-card>
      <template #header>
        <div class="card-header">
          <div class="header-title">
            <el-icon class="title-icon"><Box /></el-icon>
            <span>器材管理</span>
          </div>
          <el-button type="primary" :icon="Plus" @click="handleAdd">添加器材</el-button>
        </div>
      </template>

      <!-- 搜索栏 -->
      <div class="search-section">
        <el-input
          v-model="searchName"
          placeholder="请输入器材名称"
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
        :data="equipmentList"
        v-loading="loading"
        border
        style="width: 100%; margin-top: 20px"
      >
        <el-table-column prop="equipmentId" label="器材编号" width="120" />
        <el-table-column prop="equipmentName" label="器材名称" width="150" />
        <el-table-column prop="specification" label="规格" width="150" />
        <el-table-column prop="stockQuantity" label="库存数量" width="120" />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusName(row.status) }}
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
      width="500px"
      @close="handleDialogClose"
    >
      <el-form
        :model="equipmentForm"
        :rules="rules"
        ref="equipmentFormRef"
        label-width="100px"
      >
        <el-form-item label="器材编号" prop="equipmentId">
          <el-input v-model="equipmentForm.equipmentId" placeholder="请输入器材编号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="器材名称" prop="equipmentName">
          <el-input v-model="equipmentForm.equipmentName" placeholder="请输入器材名称" />
        </el-form-item>
        <el-form-item label="规格" prop="specification">
          <el-input v-model="equipmentForm.specification" placeholder="请输入规格" />
        </el-form-item>
        <el-form-item label="库存数量" prop="stockQuantity">
          <el-input-number v-model="equipmentForm.stockQuantity" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="equipmentForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="可用" value="available" />
            <el-option label="维护中" value="maintenance" />
            <el-option label="报废" value="scrap" />
          </el-select>
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
import { Plus, Search, Edit, Delete, Box } from '@element-plus/icons-vue'
import {
  getEquipmentPage,
  addEquipment,
  updateEquipment,
  deleteEquipment
} from '../api/equipment'

// 查询参数
const searchName = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)

// 表格数据
const equipmentList = ref([])

// 对话框
const dialogVisible = ref(false)
const dialogTitle = ref('添加器材')
const isEdit = ref(false)
const submitLoading = ref(false)
const equipmentFormRef = ref(null)

// 状态映射
const statusMap = {
  'available': { name: '可用', type: 'success' },
  'maintenance': { name: '维护中', type: 'warning' },
  'scrap': { name: '报废', type: 'danger' }
}

const getStatusName = (status) => {
  return statusMap[status]?.name || status
}

const getStatusType = (status) => {
  return statusMap[status]?.type || ''
}

// 表单数据
const equipmentForm = reactive({
  equipmentId: '',
  equipmentName: '',
  specification: '',
  stockQuantity: 0,
  status: 'available'
})

// 表单验证规则
const rules = {
  equipmentId: [
    { required: true, message: '请输入器材编号', trigger: 'blur' },
    { pattern: /^E\d{3}$/, message: '器材编号格式不正确（如：E001）', trigger: 'blur' }
  ],
  equipmentName: [
    { required: true, message: '请输入器材名称', trigger: 'blur' },
    { min: 2, max: 50, message: '器材名称长度在2-50个字符', trigger: 'blur' }
  ],
  stockQuantity: [
    { required: true, message: '请输入库存数量', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const res = await getEquipmentPage({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      equipmentName: searchName.value || undefined
    })
    console.log('器材数据响应:', res)
    if (res.data) {
      equipmentList.value = res.data.records || res.data.list || []
      if (res.data.total !== undefined && res.data.total > 0) {
        total.value = res.data.total
      } else if (res.data.pages && res.data.size) {
        total.value = res.data.pages * res.data.size
      } else {
        total.value = res.data.records?.length || 0
      }
    } else {
      equipmentList.value = []
      total.value = 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败: ' + (error.message || '未知错误'))
    equipmentList.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

// 添加
const handleAdd = () => {
  dialogTitle.value = '添加器材'
  isEdit.value = false
  dialogVisible.value = true
}

// 编辑
const handleEdit = (row) => {
  dialogTitle.value = '编辑器材'
  isEdit.value = true
  Object.assign(equipmentForm, row)
  dialogVisible.value = true
}

// 删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确认删除该器材吗？', '提示', {
      type: 'warning'
    })
    await deleteEquipment(row.equipmentId)
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
  if (!equipmentFormRef.value) return
  
  await equipmentFormRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true
      try {
        if (isEdit.value) {
          await updateEquipment(equipmentForm)
          ElMessage.success('更新成功')
        } else {
          await addEquipment(equipmentForm)
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
  if (equipmentFormRef.value) {
    equipmentFormRef.value.resetFields()
  }
  Object.assign(equipmentForm, {
    equipmentId: '',
    equipmentName: '',
    specification: '',
    stockQuantity: 0,
    status: 'available'
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.equipment-page {
  padding: 0;
}

/* 卡片样式 */
.equipment-page :deep(.el-card) {
  border-radius: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
  background: #FFFFFF;
}

.equipment-page :deep(.el-card__header) {
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

.equipment-page :deep(.el-button--primary) {
  background: #b4e9b6;
  border-color: #b4e9b6;
  border-radius: 10px;
}

.equipment-page :deep(.el-button--primary:hover) {
  background: #a3d9a4;
  border-color: #a3d9a4;
}

/* 表格样式 */
.equipment-page :deep(.el-table) {
  --el-table-border-color: #E5E7EB;
  --el-table-text-color: #4B5563;
  font-size: 14px;
}

.equipment-page :deep(.el-table th.el-table__cell) {
  background: #F9FAFB;
  color: #111827;
  font-weight: 600;
}

.equipment-page :deep(.el-table tr:hover) {
  background: #E8F5E9;
}

.equipment-page :deep(.el-button--primary) {
  color: #4CAF50;
}

.equipment-page :deep(.el-button--danger) {
  color: #EF4444;
}

/* 分页样式 */
.equipment-page :deep(.el-pagination) {
  margin-top: 20px;
  justify-content: flex-end;
}

.equipment-page :deep(.el-pagination .el-pager li.is-active) {
  background: #b4e9b6;
}

/* 对话框样式 */
.equipment-page :deep(.el-dialog) {
  border-radius: 16px;
}

.equipment-page :deep(.el-dialog__header) {
  padding: 20px 24px;
  border-bottom: 1px solid #E5E7EB;
}

.equipment-page :deep(.el-dialog__title) {
  font-weight: 600;
  color: #111827;
  font-size: 18px;
}

.equipment-page :deep(.el-dialog__body) {
  padding: 24px;
}

.equipment-page :deep(.el-form-item__label) {
  color: #4B5563;
  font-weight: 500;
}

.equipment-page :deep(.el-input),
.equipment-page :deep(.el-select) {
  border-radius: 10px;
  border: 1.5px solid #E5E7EB;
}

.equipment-page :deep(.el-input:focus),
.equipment-page :deep(.el-select:focus) {
  border-color: #4CAF50;
  box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
}
</style>