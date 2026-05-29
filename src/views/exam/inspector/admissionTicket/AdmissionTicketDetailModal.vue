<template>
  <a-modal v-model:visible="visible" title="准考证详情" :width="width >= 900 ? 900 : '100%'" :footer="null"
    :mask-closable="false">
    <a-spin :loading="loading">
      <div class="table-wrapper">
        <table class="report-table" align="center">

          <!-- ===== 表头 ===== -->
          <thead>
            <tr style="background: rgb(232, 243, 255)">
              <th colspan="12">{{ detailData.title || '-' }}</th>
            </tr>
            <tr>
              <th colspan="4">下载状态</th>
              <th colspan="4">
                <a-tag :color="detailData.admissionTicketStatus === 1 ? 'green' : 'gray'">
                  {{ detailData.admissionTicketStatus === 1 ? '已开启' : '已关闭' }}
                </a-tag>
              </th>
              <th colspan="4">
                <a-button type="primary" size="small"
                  @click="onToggleStatus(detailData.admissionTicketStatus === 1 ? 0 : 1)">
                  {{ detailData.admissionTicketStatus === 1 ? '关闭下载' : '开启下载' }}
                </a-button>
              </th>

            </tr>
            <tr>
              <th colspan="12">
                已下载人员表：
                <a-checkbox-group v-model:modelValue="selectedProjects">
                  <a-checkbox v-for="item in detailData.examProjectList" :key="item.value" :value="item.value">
                    {{ item.label }}
                  </a-checkbox>
                </a-checkbox-group>
                <a-button type="primary" size="small" :disabled="selectedProjects.length === 0" @click="onExport">
                  <template #icon><icon-download /></template>
                  导出
                </a-button>
              </th>
            </tr>
          </thead>
          <tbody>
            <!-- 项目循环 -->
            <template v-for="project in detailData.projectExamInfoRespList" :key="project.projectId">
              <!-- 项目标题行 -->
              <tr class="project-row" style="background: rgb(232, 243, 255)">
                <td colspan="3">
                  {{ project.projectCode }}
                </td>
                <td colspan="3">
                  <a-tag :color="project.admissionTicketStatus === 1 ? 'green' : 'gray'">
                    {{ project.admissionTicketStatus === 1 ? '已开启' : '已关闭' }}
                  </a-tag>
                </td>
                <td colspan="3">
                  已下载【0】人
                </td>
                <td colspan="3">
                  <a-button type="primary" size="small"
                    @click="onToggleStatus(project.admissionTicketStatus === 1 ? 0 : 1)">
                    {{ project.admissionTicketStatus === 1 ? '关闭下载' : '开启下载' }}
                  </a-button>
                </td>
              </tr>

              <!-- 该项目下的考试安排 -->
              <tr v-for="item in project.projectExamInfoItemRespList" :key="item.scheduleId">
                <td colspan="2">{{ getPracticalTypeText(item.practicalType) }}</td>

                <td colspan="5">
                  <a-cascader placeholder="考场" allow-clear class="search-input ml-2" :options="examRoomSelect" />
                </td>

                <td colspan="5">
                  <a-input placeholder="考试时间" />
                </td>

              </tr>
            </template>
          </tbody>

        </table>
      </div>

    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { type AdmissionTicketInfoResp, getAdmissionTicketInfo, toggleAdmissionTicketStatus, exportAdmissionTicket } from '@/apis/exam/examNotice'
import { selectExamTypeRoomRespList } from '@/apis/exam/classroom'

defineOptions({ name: 'AdmissionTicketDetailModal' })

const visible = ref(false)
const loading = ref(false)
const noticeId = ref('')
const detailData = ref<AdmissionTicketInfoResp>({} as AdmissionTicketInfoResp)
const selectedProjects = ref<(string | number)[]>([])
const { width } = useWindowSize()
const examRoomSelect = ref<any[]>([])

/** 考试类型映射 */
const practicalTypeMap: Record<number, string> = {
  1: '实操',
  2: '拍片',
  4: '评片',
  8: '开卷',
  16: '闭卷'
}

/** 获取考试类型文字 */
const getPracticalTypeText = (type: number) => {
  return practicalTypeMap[type] || '未知'
}

/** 获取详情数据 */
const fetchDetail = async () => {
  if (!noticeId.value) return
  loading.value = true
  try {
    const res = await getAdmissionTicketInfo(noticeId.value)
    detailData.value = res.data || {} as AdmissionTicketInfoResp
  } finally {
    loading.value = false
  }
}

const getExamRoomSelect = async () => {
  const res = await selectExamTypeRoomRespList(1)
  examRoomSelect.value = res.data
}

/** 切换下载状态 */
const onToggleStatus = async (status: number) => {
  try {
    await toggleAdmissionTicketStatus(noticeId.value, status)
    Message.success(status === 1 ? '已开启下载' : '已关闭下载')
    fetchDetail()
  } catch (error) {
  }
}

/** 导出准考证 */
const onExport = async () => {
  if (selectedProjects.value.length === 0) {
    Message.warning('请选择要导出的项目')
    return
  }
  try {
    await exportAdmissionTicket(noticeId.value, selectedProjects.value)
    Message.success('导出成功')
  } catch (error) {
  }
}

/** 打开弹窗 */
const onOpen = (id: string) => {
  noticeId.value = id
  visible.value = true
  selectedProjects.value = []
  fetchDetail()
  getExamRoomSelect()
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
  margin-right: 24px;
  /* ✔ 关键：间距 */
  display: inline-block;
}

.info-th .gap {
  margin-right: 24px;
}

/* ========== 表格基础 ========== */
.report-table {
  width: 100%;
  min-width: 100%;
  border-collapse: collapse;
  text-align: center;
  background: #fff;
  table-layout: fixed;
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
