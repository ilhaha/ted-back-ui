<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card class="general-card" :title="`作业项目已考试人数统计（总人数：${totalData.totalCount}）`">
      <template #extra>
        <a-range-picker v-model="dateRange" value-format="YYYY-MM-DD" @change="getChartData" />
      </template>
      <div class="content">
        <a-empty v-if="!loading && chartData.length === 0" description="暂无考试数据" />
        <div v-else class="chartContainer">
          <Chart ref="chartRef" :option="chartOption" style="height: 100%" />
        </div>
      </div>
    </a-card>
  </a-spin>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { getStatisticsExamCompleted } from '@/apis/exam/examPlan'
import { useChart } from '@/hooks'
import { ref } from 'vue'
import dayjs from 'dayjs'

interface ChartData {
  projectName: string
  projectCode: string
  recordCount: number
}

interface TotalData {
  totalCount: number
  totalName: string
}

const chartRef = useTemplateRef('chartRef')
const chartData = ref<ChartData[]>([])
const totalData = ref<TotalData>({ totalCount: 0, totalName: '全部项目' })

// 默认当前月第一天到今天
const now = dayjs()
const dateRange = ref([
  now.startOf('month').format('YYYY-MM-DD'),
  now.format('YYYY-MM-DD')
])

const { chartOption } = useChart((isDark: boolean) => {
  return {
    tooltip: {
      trigger: 'axis',
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: chartData.value.map((item) => `${item.projectName}(${item.projectCode})`),
      axisLabel: {
        rotate: 45,
        interval: 0,
      },
    },
    yAxis: {
      type: 'value',
      name: '已考试人数',
    },
    series: [
      {
        name: '已考试人数',
        type: 'line',
        data: chartData.value.map((item) => item.recordCount),
        smooth: true,
        symbol: 'circle',
        symbolSize: 8,
        lineStyle: {
          width: 2,
          color: '#165dff',
        },
        itemStyle: {
          color: '#165dff',
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
        },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: 'rgba(22, 93, 255, 0.3)',
              },
              {
                offset: 1,
                color: 'rgba(22, 93, 255, 0.05)',
              },
            ],
          },
        },
      },
    ],
  }
})

const loading = ref(false)
// 查询图表数据
const getChartData = async () => {
  try {
    loading.value = true
    const startTime = dateRange.value?.[0] || ''
    const endTime = dateRange.value?.[1] || ''
    const { data } = await getStatisticsExamCompleted({ startTime, endTime })
    chartData.value = data || []
    if (chartData.value.length > 0 && 'totalCount' in chartData.value[0]) {
      totalData.value = {
        totalCount: chartData.value[0].totalCount as number,
        totalName: '已考试总人数'
      }
    } else {
      totalData.value = {
        totalCount: chartData.value.reduce((sum, item) => sum + (item.recordCount || 0), 0),
        totalName: '已考试总人数'
      }
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  getChartData()
})
</script>

<style scoped lang="scss">
.content {
  height: 468px;
  display: flex;
  align-items: center;
  justify-content: center;

  .chartContainer {
    width: 100%;
    height: 100%;
  }

  :deep(.arco-empty) {
    margin: 0;
  }
}
</style>
