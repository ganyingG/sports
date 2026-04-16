<template>
  <div class="dashboard">
    <!-- 顶部统计卡片区域 - 白色卡片清新风格 -->
    <el-row :gutter="20" class="stat-row">
      <el-col :span="6">
        <div class="stat-card" @click="goToStudents">
          <div class="stat-icon-wrap stat-icon-blue">
            <el-icon class="stat-icon"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.studentCount }}</div>
            <div class="stat-label">学生总数</div>
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="stat-card" @click="goToProjects">
          <div class="stat-icon-wrap stat-icon-yellow">
            <el-icon class="stat-icon"><Medal /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.projectCount }}</div>
            <div class="stat-label">比赛项目</div>
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="stat-card" @click="goToReferees">
          <div class="stat-icon-wrap stat-icon-pink">
            <el-icon class="stat-icon"><Monitor /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.refereeCount }}</div>
            <div class="stat-label">裁判人员</div>
          </div>
        </div>
      </el-col>

      <el-col :span="6">
        <div class="stat-card" @click="goToEquipment">
          <div class="stat-icon-wrap stat-icon-orange">
            <el-icon class="stat-icon"><Box /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.equipmentCount }}</div>
            <div class="stat-label">器材设备</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 中间区域 - 学院参与情况柱状图 -->
    <el-card class="chart-card">
      <template #header>
        <div class="card-header">
          <span class="header-title">各学院参与情况</span>
        </div>
      </template>
      <div class="bar-chart-container" ref="barChartRef"></div>
    </el-card>

    <!-- 底部区域 - 两个并排卡片 -->
    <el-row :gutter="20" class="bottom-row">
      <!-- 底部左侧 - 各项目参与比例环形图 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">各项目参与比例</span>
            </div>
          </template>
          <div class="donut-container">
            <div class="donut-chart" ref="donutChartRef"></div>
            <div class="donut-legend">
              <div class="legend-item" v-for="(type, index) in projectData.types" :key="index">
                <span class="legend-dot" :style="{ background: projectColors[index % projectColors.length] }"></span>
                <span class="legend-label">{{ type }}</span>
                <span class="legend-value">{{ projectData.counts[index] || 0 }}%</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <!-- 底部右侧 - 裁判学院分布 -->
      <el-col :span="12">
        <el-card class="chart-card">
          <template #header>
            <div class="card-header">
              <span class="header-title">裁判学院分布</span>
            </div>
          </template>
          <div class="referee-container">
            <div class="referee-list">
              <div class="referee-item" v-for="(college, index) in refereeData.colleges" :key="index">
                <span class="referee-dot" :style="{ background: refereeColors[index % refereeColors.length] }"></span>
                <span class="referee-name">{{ college }}</span>
                <div class="referee-bar-wrap">
                  <div class="referee-bar" :style="{ width: (refereeData.percentages[index] || 0) + '%', background: refereeColors[index % refereeColors.length] }"></div>
                </div>
                <span class="referee-value">{{ refereeData.percentages[index] || 0 }}%</span>
              </div>
            </div>
            <div class="referee-chart" ref="refereeChartRef"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { User, Medal, Monitor, Box } from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import request from '../utils/request'

const router = useRouter()
const barChartRef = ref(null)
const donutChartRef = ref(null)
const refereeChartRef = ref(null)
let barChartInstance = null
let donutChartInstance = null
let refereeChartInstance = null

// 统计数据
const stats = ref({
  studentCount: 0,
  projectCount: 0,
  refereeCount: 0,
  equipmentCount: 0
})

// 图表数据
const collegeData = ref({ colleges: [], studentCounts: [], projectCounts: [] })
const projectData = ref({ types: [], counts: [] })
const refereeData = ref({ colleges: [], counts: [], percentages: [] })

const projectColors = ['#CE93D8', '#90CAF9', '#A5D6A7', '#F48FB1', '#FFCC80', '#EF9A9A', '#80CBC4', '#CE93D8']
const refereeColors = ['#A5D6A7', '#FFCC80', '#CE93D8', '#90CAF9', '#F48FB1', '#80CBC4', '#EF9A9A', '#FFE0B2']

// 获取统计数据
const fetchStatistics = async () => {
  try {
    const res = await request.get('/statistics')
    if (res.code === 200) {
      stats.value = res.data
    }
  } catch (error) {
    console.error('获取统计数据失败:', error)
  }
}

// 获取学院统计数据
const fetchCollegeData = async () => {
  try {
    const res = await request.get('/statistics/colleges')
    if (res.code === 200) {
      collegeData.value = res.data
    }
  } catch (error) {
    console.error('获取学院统计数据失败:', error)
  }
}

// 获取项目统计数据
const fetchProjectData = async () => {
  try {
    const res = await request.get('/statistics/projects')
    if (res.code === 200) {
      projectData.value = res.data
    }
  } catch (error) {
    console.error('获取项目统计数据失败:', error)
  }
}

// 获取裁判统计数据
const fetchRefereeData = async () => {
  try {
    const res = await request.get('/statistics/referees')
    if (res.code === 200) {
      refereeData.value = res.data
    }
  } catch (error) {
    console.error('获取裁判统计数据失败:', error)
  }
}

const goToProjects = () => router.push('/projects')
const goToStudents = () => router.push('/students')
const goToReferees = () => router.push('/referees')
const goToEquipment = () => router.push('/equipment')

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value) return
  barChartInstance = echarts.init(barChartRef.value)
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: [12, 16],
      borderWidth: 0,
      extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);'
    },
    legend: {
      data: ['运动员数量', '参与项目数'],
      top: 0,
      right: 0,
      textStyle: { color: '#6B7280', fontSize: 12 },
      itemWidth: 12,
      itemHeight: 12
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
    xAxis: {
      type: 'category',
      data: collegeData.value.colleges,
      axisLine: { lineStyle: { color: '#E5E7EB' } },
      axisLabel: { color: '#6B7280', fontSize: 12 }
    },
    yAxis: {
      type: 'value',
      name: '数量',
      nameTextStyle: { color: '#9CA3AF', fontSize: 12 },
      axisLabel: { color: '#6B7280' },
      splitLine: { lineStyle: { color: '#F3F4F6' } }
    },
    series: [
      {
        name: '运动员数量',
        type: 'bar',
        barWidth: '30%',
        data: collegeData.value.studentCounts,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#90CAF9'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      },
      {
        name: '参与项目数',
        type: 'bar',
        barWidth: '30%',
        data: collegeData.value.projectCounts,
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: '#FFCC80'
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        }
      }
    ]
  }
  barChartInstance.setOption(option)
}

// 初始化环形图
const initDonutChart = () => {
  if (!donutChartRef.value) return
  donutChartInstance = echarts.init(donutChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: [12, 16],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);'
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '75%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: { show: false },
        emphasis: {
          label: { show: false },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.2)'
          }
        },
        data: projectData.value.types.map((name, index) => ({
          value: projectData.value.counts[index] || 0,
          name: name,
          itemStyle: { color: projectColors[index % projectColors.length] }
        }))
      }
    ]
  }
  donutChartInstance.setOption(option)
}

// 初始化裁判分布饼图
const initRefereeChart = () => {
  if (!refereeChartRef.value) return
  refereeChartInstance = echarts.init(refereeChartRef.value)
  const option = {
    tooltip: {
      trigger: 'item',
      backgroundColor: '#fff',
      borderRadius: 8,
      padding: [12, 16],
      extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);'
    },
    series: [
      {
        type: 'pie',
        radius: ['0%', '70%'],
        center: ['50%', '50%'],
        roseType: 'radius',
        itemStyle: {
          borderRadius: 4,
          borderColor: '#fff',
          borderWidth: 1
        },
        label: { show: false },
        data: refereeData.value.colleges.map((name, index) => ({
          value: refereeData.value.counts[index] || 0,
          name: name,
          itemStyle: { color: refereeColors[index % refereeColors.length] }
        }))
      }
    ]
  }
  refereeChartInstance.setOption(option)
}

onMounted(async () => {
  // 并行获取所有数据
  await Promise.all([
    fetchStatistics(),
    fetchCollegeData(),
    fetchProjectData(),
    fetchRefereeData()
  ])

  nextTick(() => {
    initBarChart()
    initDonutChart()
    initRefereeChart()
    window.addEventListener('resize', () => {
      barChartInstance?.resize()
      donutChartInstance?.resize()
      refereeChartInstance?.resize()
    })
  })
})
</script>

<style scoped>
.dashboard {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 统计卡片 - 极简商务风格 */
.stat-row {
  flex-shrink: 0;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 16px;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.28s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #E5E7EB;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrap {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon-blue {
  background: #E1BEE7;
  color: #8E24AA;
}

.stat-icon-yellow {
  background: #FFE0B2;
  color: #FB8C00;
}

.stat-icon-pink {
  background: #F8BBD0;
  color: #EC407A;
}

.stat-icon-orange {
  background: #C8E6C9;
  color: #43A047;
}

.stat-icon {
  font-size: 22px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  color: #111827;
}

.stat-label {
  font-size: 14px;
  margin-top: 4px;
  color: #6B7280;
}

/* 图表卡片 */
.chart-card {
  border-radius: 16px;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  background: #FFFFFF;
  transition: all 0.28s ease;
}

.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.chart-card :deep(.el-card__header) {
  padding: 16px 20px;
  border-bottom: 1px solid #E5E7EB;
}

.chart-card :deep(.el-card__body) {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

/* 柱状图容器 */
.bar-chart-container {
  height: 280px;
  width: 100%;
}

/* 底部区域 */
.bottom-row {
  flex: none;
  height: auto;
}

.bottom-row .el-col {
  height: auto;
}

.bottom-row .chart-card {
  height: 280px;
  display: flex;
  flex-direction: column;
}

.bottom-row .chart-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* 环形图容器 */
.donut-container {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 24px;
}

.donut-chart {
  width: 180px;
  height: 180px;
  flex-shrink: 0;
}

.donut-legend {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-label {
  flex: 1;
  font-size: 14px;
  color: #4B5563;
}

.legend-value {
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

/* 裁判分布容器 */
.referee-container {
  display: flex;
  align-items: center;
  flex: 1;
  gap: 20px;
}

.referee-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.referee-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.referee-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.referee-name {
  width: 70px;
  font-size: 13px;
  color: #4B5563;
  flex-shrink: 0;
}

.referee-bar-wrap {
  flex: 1;
  height: 8px;
  background: #F3F4F6;
  border-radius: 4px;
  overflow: hidden;
}

.referee-bar {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.referee-value {
  width: 36px;
  text-align: right;
  font-size: 13px;
  font-weight: 500;
  color: #6B7280;
}

.referee-chart {
  width: 140px;
  height: 140px;
  flex-shrink: 0;
}

/* 响应式适配 */
@media (max-width: 1200px) {
  .bottom-row .el-col {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .stat-row .el-col {
    margin-bottom: 12px;
  }
  .bar-chart-container {
    height: 220px;
  }
  .donut-container {
    flex-direction: column;
  }
  .referee-container {
    flex-direction: column;
  }
}
</style>