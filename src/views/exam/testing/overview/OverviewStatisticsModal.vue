<template>
  <a-modal v-model:visible="visible" title="统计报表" :width="width >= 1010 ? 1010 : '100%'" :footer="false"
    :mask-closable="false">
    <a-spin :loading="loading">
      <div class="table-wrapper">
        <table class="report-table" align="center">

          <!-- ===== 表头 ===== -->
          <thead>
            <tr>
              <th colspan="10">{{ statisticsData.title || '-' }}</th>
              <th colspan="2" rowspan="2"><a-tag :color="getStatusColor(statisticsData.status)">{{
                getStatusText(statisticsData.status) }}</a-tag></th>
            </tr>
            <tr>
              <th colspan="10" class="info-th">
                <span>报名截止日期：【{{ statisticsData.applyDeadline || '-' }}】</span>
                <span class="gap">级别：【{{ getExamLevelText(statisticsData.examLevel) }}】</span>
                <span>类别：【{{ statisticsData.projectCodes || '-' }}】</span>
              </th>
            </tr>
            <tr>
              <th rowspan="2" class="fixed-left header-cell"></th>
              <th rowspan="2">报名人数</th>
              <th rowspan="2">交费人数</th>
              <th rowspan="2">及格人数</th>
              <th rowspan="2">人项总数</th>
              <th rowspan="2">初试人数</th>
              <th rowspan="2">补考人数</th>
              <th rowspan="2">理工科本科及以上初试</th>

              <th colspan="4" class="sub-header">补考各项目人数</th>
            </tr>

            <tr>
              <th>实操</th>
              <th>开卷</th>
              <th>闭卷</th>
              <th>评片</th>
            </tr>
          </thead>

          <!-- ===== 数据 ===== -->
          <tbody>
            <tr v-for="(item, index) in statisticsData.itemList" :key="item.tableHeader"
              :class="{ 'odd-row': index % 2 === 1 }">
              <td class="fixed-left">{{ item.tableHeader }}</td>

              <td><span class="data-value">{{ item.registrationCount || '-' }}</span></td>
              <td><span class="data-value">{{ item.paymentCount || '-' }}</span></td>
              <td><span class="data-value success">{{ item.passCount || '-' }}</span></td>
              <td><span class="data-value primary">{{ item.totalItemCount || '-' }}</span></td>
              <td><span class="data-value">{{ item.firstExamCount || '-' }}</span></td>
              <td><span class="data-value warning">{{ item.makeupExamCount || '-' }}</span></td>
              <td><span class="data-value">{{ item.scienceBachelorFirstExamCount || '-' }}</span></td>

              <td><span class="data-value">{{ item.practicalMakeupCount || '-' }}</span></td>
              <td><span class="data-value">{{ item.openBookMakeupCount || '-' }}</span></td>
              <td><span class="data-value">{{ item.closedBookMakeupCount || '-' }}</span> </td>
              <td><span class="data-value">{{ item.reviewFilmMakeupCount || '-' }}</span></td>
            </tr>
          </tbody>

          <tfoot>
            <tr class="total-row">
              <td class="fixed-left" colspan="2">及格率</td>
              <td colspan="10">{{ getPassRate() }}</td>
            </tr>
          </tfoot>

        </table>
      </div>

    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { ref } from 'vue'
import { getNoticeStatistics, type NoticeStatisticsResp, type NoticeStatisticsItemResp } from '@/apis/exam/examNotice'

defineOptions({ name: 'OverviewStatisticsModal' })
const { width } = useWindowSize()
const visible = ref(false)
const loading = ref(false)
const noticeId = ref('')
const statisticsData = ref<NoticeStatisticsResp>({})

/** ================= 枚举转换 ================= */
const getExamLevelText = (val?: number) => {
  switch (val) {
    case 1: return 'Ⅰ级'
    case 2: return 'Ⅱ级'
    default: return '-'
  }
}

const getLevelColor = (val?: number) => {
  switch (val) {
    case 1: return 'blue'
    case 2: return 'orange'
    default: return 'gray'
  }
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'blue'      // 待审核
    case 1: return 'green'      // 报名中
    case 2: return 'red'        // 审核未通过
    case 3: return 'blue'     // 补报中
    case 4: return 'gray'       // 报名结束
    case 5: return 'orange'      // 已开考
    case 6: return 'default'    // 已结束
    default: return 'default'
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待审'
    case 1: return '报名中'
    case 2: return '已驳回'
    case 3: return '补报中'
    case 4: return '报名已结束'
    case 5: return '考试中'
    case 6: return '已结束'
    default: return '未知状态'
  }
};



// 计算及格率 = 及格人数 / 报名人数 * 100%
const getPassRate = () => {
  const itemList = statisticsData.value.itemList?.slice(2) || []
  if (!itemList.length) return '-'
  const totalPass = itemList.reduce((sum, item) => {
    return sum + Number(item.passCount || 0)
  }, 0)
  const totalRegistration = itemList.reduce((sum, item) => {
    return sum + Number(item.registrationCount || 0)
  }, 0)  
  if (totalRegistration === 0) return '-'
  const rate = ((totalPass / totalRegistration) * 100).toFixed(1)
  return `${rate}%`
}

/** ================= 请求 ================= */
const fetchStatistics = async () => {
  if (!noticeId.value) return
  loading.value = true
  try {
    const res = await getNoticeStatistics(noticeId.value)
    if (res.code === '0') {
      statisticsData.value = res.data || {}
    }
  } finally {
    loading.value = false
  }
}

/** ================= 打开弹窗 ================= */
const onOpen = (id: string) => {
  noticeId.value = id
  visible.value = true
  fetchStatistics()
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
/* ========== 主题变量 ========== */
:root {
  --border: #e8edf4;
  --text: #1d2129;
  --sub-text: #86909c;
  --bg: #ffffff;
  --bg-header: #f7f8fa;
  --bg-hover: #f5f8ff;
  --bg-zebra: #fafbfc;
  --primary: #1677ff;
  --success: #52c41a;
  --warning: #fa8c16;
}

/* ========== 容器 ========== */
.table-wrapper {
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow-x: auto;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04);
  background: var(--bg);
}

.info-th {
  padding: 14px 16px;
  line-height: 1.8;
}

.info-th span {
  margin-right: 24px; /* ✔ 关键：间距 */
  display: inline-block;
}

.info-th .gap {
  margin-right: 24px;
}

/* ========== 表格基础 ========== */
.report-table {
  width: auto;
  border-collapse: collapse;
  font-size: 13px;
  text-align: center;
  background: #fff;
  margin: 0 auto;
  min-width: 100%;
}

.report-table th,
.report-table td {
  border: 1px solid #e8edf4;
  /* ✅ 恢复完整边框 */
  padding: 10px 12px;
  white-space: nowrap;
  color: #1d2129;
}

/* ========== 表头 ========== */
.report-table thead th {
  background: var(--bg-header);
  font-weight: 600;
  position: sticky;
  top: 0;
  z-index: 5;
}

/* 子表头 */
.sub-header {
  background: #eef2f7;
  color: #4e5969;
  font-weight: 500;
}

/* ========== 斑马纹（更轻） ========== */
.report-table tbody tr:nth-child(even) {
  background: var(--bg-zebra);
}

/* hover（避免太重） */
.report-table tbody tr:hover {
  background: var(--bg-hover);
}

/* ========== 左侧固定列 ========== */
.fixed-left {
  position: sticky;
  left: 0;
  z-index: 3;
  background: var(--bg);
  font-weight: 600;
  min-width: 120px;
}

/* 表头 + 左侧交叉层级 */
thead .fixed-left {
  z-index: 6;
  background: var(--bg-header);
}

/* ========== 数值样式 ========== */
.data-value {
  font-weight: 600;
}

.primary {
  color: var(--primary);
}

.success {
  color: var(--success);
}

.warning {
  color: var(--warning);
}

.secondary {
  color: var(--sub-text);
}

/* ========== 合计行（重点优化） ========== */
.total-row {
  position: sticky;
  bottom: 0;
  z-index: 4;
}

.total-row td {
  background: #e6f4ff;
  font-weight: 700;
}

/* 合计行左侧固定列 */
.total-row .fixed-left {
  background: #e6f4ff;
}

/* hover 合计行 */
.total-row:hover td {
  background: #d6ecff;
}

/* ========== 滚动条（可选优化） ========== */
.table-wrapper::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #d0d7de;
  border-radius: 4px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f6f8fa;
}
</style>