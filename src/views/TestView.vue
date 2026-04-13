<!-- src/views/TestView.vue -->
<template>
  <div class="test-page">
    <el-card class="test-card">
      <div class="content">
        <div class="icon-wrapper">
          <el-icon size="48" color="#667eea"><CircleCheck /></el-icon>
        </div>
        <h1>测试页面</h1>
        <p>如果能看到这个页面，说明路由配置正常</p>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { CircleCheck } from '@element-plus/icons-vue'
console.log('✅ TestView 组件已加载')
</script>

<style scoped>
.test-page {
  padding: 0;
}

.test-card {
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 16px rgba(148, 163, 184, 0.15);
  background: #ffffff;
}

.content {
  text-align: center;
  padding: 60px 40px;
}

.icon-wrapper {
  margin-bottom: 24px;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

h1 {
  margin: 0 0 12px 0;
  color: #334155;
  font-size: 24px;
  font-weight: 600;
}

p {
  margin: 0;
  color: #64748b;
  font-size: 15px;
}
</style>