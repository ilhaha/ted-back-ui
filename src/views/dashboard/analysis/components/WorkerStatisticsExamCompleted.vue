<template>
  <a-spin :loading="loading" style="width: 100%">
    <a-card class="general-card" :title="`作业项目已考试人数统计（总人数：${totalCount}）`">
      <template #extra>
        <a-range-picker v-model="dateRange" value-format="YYYY-MM-DD" @change="getChartData" />
      </template>
      <div class="content">
        <a-empty v-if="!loading && chartData.length === 0" description="暂无考试数据" />
        <div v-else class="chartContainer">
          <Chart ref="chartRef" :option="chartOption" style="height: 100%" @mouseover="onChartMouseover" />
        </div>
      </div>
    </a-card>
  </a-spin>
</template>

<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { getStatisticsExamCompleted } from '@/apis/exam/examPlan'
import { useChart } from '@/hooks'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

interface ChartData {
  projectName: string
  projectCode: string
  recordCount: number
  orgList?: DetailItem[]
}

interface TotalData {
  totalCount: number
  totalName: string
}

interface DetailItem {
  name: string
  phone: string
  idCardNo: string
  companyName: string
}

const chartRef = useTemplateRef('chartRef')
const chartData = ref<ChartData[]>([])
const totalData = ref<TotalData>({ totalCount: 0, totalName: '全部项目' })

// 通过循环 chartData 计算总人数
const totalCount = computed(() => {
  return chartData.value.reduce((sum, item) => sum + (item.totalCount || 0), 0)
})

// 当前选中的项目信息
const detailLoading = ref(false)
const detailData = ref<DetailItem[]>([])

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
      position: (pos: number[] | undefined) => {
        return [pos![0] - 250, pos![1] + 10]
      },
      extraCssText: 'max-width: 500px;',
      formatter: (params: any) => {
        if (!params || params.length === 0) return ''
        const item = params[0]
        const projectName = item.name
        const recordCount = item.value

        // 如果有详情数据，显示详情
        if (detailData.value.length > 0) {
          let tableHtml = `
            <table style="border-collapse: collapse; font-size: 12px; table-layout: fixed;">
              <colgroup>
                <col style="width: 60%;">
                <col style="width: 40%;">
              </colgroup>
              <tr style="background: #f0f0f0;">
                <th style="padding: 4px 6px; border: 1px solid #ddd;">机构名称</th>
                <th style="padding: 4px 6px; border: 1px solid #ddd; text-align: right;">及格 / 不及格 / 待录入 / 总人数</th>

              </tr>
          `
          detailData.value.forEach((d: any) => {
            tableHtml += `
              <tr>
                <td style="padding: 4px 6px; border: 1px solid #ddd; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${d.orgName || '-'}">${d.orgName || '-'}</td>
                <td style="padding: 4px 6px; border: 1px solid #ddd; text-align: right;">${d.passCount ?? '-'}  /  ${d.failCount ?? '-'}  /  ${d.notSureCount ?? '-'}  /  ${d.recordCount ?? '-'}</td>

              </tr>
            `
          })
          tableHtml += '</table>'

          return `
            <div style="min-width: 220px;">
              <div style="font-weight: bold; margin-bottom: 4px;">${projectName}</div>
              <div style="color: #666; margin-bottom: 8px;">已考试人数：${recordCount}</div>
              ${detailLoading.value ? '<div>加载中...</div>' : tableHtml}
            </div>
          `
        }

        return `<div style="min-width: 200px;">
          <div style="font-weight: bold;">${projectName}</div>
          <div style="color: #666;">已考试人数：${recordCount}</div>
          ${detailLoading.value ? '<div style="margin-top: 4px;">加载中...</div>' : '<div style="color: #999; margin-top: 4px;">悬停获取详情...</div>'}
        </div>`
      },
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
        name: '及格人数',
        type: 'line',
        data: chartData.value.map((item) => item.totalCount),
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

const onChartMouseover = (params: any) => {
  detailData.value = chartData.value[params.dataIndex].orgList || []
}

</script>

<style scoped lang="scss">
.content {
  min-height: 468px;
  display: flex;
  flex-direction: column;

  .chartContainer {
    width: 100%;
    height: 468px;
  }

  :deep(.arco-empty) {
    margin: 0;
  }
}
</style>
