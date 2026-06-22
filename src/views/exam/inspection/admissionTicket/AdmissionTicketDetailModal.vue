<template>
  <a-modal v-model:visible="visible" title="准考证设置详情" :width="width >= 900 ? 900 : '100%'" :footer="null"
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
                <a-button size="small" type="outline" v-hasPermission="['notice:admissionTicket:toggleStatus']"
                  :status="detailData.admissionTicketStatus === 1 ? 'danger' : 'primary'"
                  @click="onToggleStatus(detailData.admissionTicketStatus === 1 ? 0 : 1)">
                  {{ detailData.admissionTicketStatus === 1 ? '关闭下载' : '开启下载' }}
                </a-button>
              </th>
            </tr>
            <tr>
              <th colspan="4" style="text-align: center;">导出已下载人员表</th>
              <th colspan="6" style="text-align: center;">
                <a-checkbox-group v-model="selectedExportProjects" >
                  <template v-for="project in detailData.examProjectList" :key="project.projectId">
                    <a-checkbox :value="project.value" style="margin-right: 12px;">
                      {{ project.label }}
                    </a-checkbox>
                  </template>
                </a-checkbox-group>
              </th>
              <th colspan="2" style="text-align: center;">
                <a-button type="primary" size="small" @click="onBatchExport" v-hasPermission="['notice:admissionTicket:exportRecord']"
                  :disabled="selectedExportProjects.length === 0">
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
                  已下载【{{ project.downloadedCount || 0 }}】人
                </td>
                <td colspan="3">
                  <a-button type="outline" size="small"
                    :status="project.admissionTicketStatus === 1 ? 'danger' : 'primary'"
                    v-hasPermission="['notice:admissionTicket:toggleStatus']"
                    @click="onToggleProjectStatus(project.projectId, project.admissionTicketStatus === 1 ? 0 : 1)">
                    {{ project.admissionTicketStatus === 1 ? '关闭下载' : '开启下载' }}
                  </a-button>
                </td>
              </tr>

              <!-- 该项目下的考试安排 -->
              <tr v-for="item in project.projectExamInfoItemRespList" :key="item.scheduleId">
                <td colspan="2">{{ getPracticalTypeText(item.practicalType) }}</td>

                <td colspan="5">
                  <a-cascader :model-value="getExamRoomValue(project.projectId, item.scheduleId)"
                    :placeholder="getExamRoomPlaceholder(item)" allow-clear :options="examRoomSelect"
                    :disabled="project.admissionTicketStatus === 1"
                    @update:model-value="(value: any) => onExamRoomChange(project.projectId, item.scheduleId, value)" />
                </td>

                <td colspan="5">
                  <a-date-picker :model-value="getExamTimeValue(project.projectId, item.scheduleId)"
                    :placeholder="getExamTimePlaceholder(item)" :disabled="project.admissionTicketStatus === 1"
                    value-format="YYYY-MM-DD HH:mm" show-time format="YYYY-MM-DD HH:mm" style="width: 100%;"
                    @update:model-value="(value: any) => onExamTimeChange(project.projectId, item.scheduleId, value)" />
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
import { ref, reactive, watch } from 'vue'
import { Message } from '@arco-design/web-vue'
import { type AdmissionTicketInfoResp, getAdmissionTicketInfo, toggleAdmissionTicketStatus, exportAdmissionTicketRecord, toggleProjectAdmissionTicketStatus } from '@/apis/exam/examNotice'
import { selectExamTypeRoomRespList } from '@/apis/exam/classroom'

defineOptions({ name: 'InspectionAdmissionTicketDetailModal' })

const visible = ref(false)
const loading = ref(false)
const noticeId = ref('')
const detailData = ref<AdmissionTicketInfoResp>({} as AdmissionTicketInfoResp)
const { width } = useWindowSize()
const examRoomSelect = ref<any[]>([])

// 导出项目选择
const selectedExportProjects = ref<number[]>([])

// 项目数据存储 { [projectId]: { [scheduleId]: { examRoomId, examTime } } }
interface ExamItemData {
  examRoomId: number | null
  examTime: string
}
const projectData = reactive<Record<number, Record<number, ExamItemData>>>({})

// 监听弹窗关闭，清空数据
watch(visible, (val) => {
  if (!val) {
    Object.keys(projectData).forEach(key => delete projectData[Number(key)])
    noticeId.value = ''
    detailData.value = {} as AdmissionTicketInfoResp
    selectedExportProjects.value = []
  }
})

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

/** 获取考场占位符 */
const getExamRoomPlaceholder = (item: any) => {
  return item.examRoomId ? '' : '选择考场'
}

/** 获取考试时间占位符 */
const getExamTimePlaceholder = (item: any) => {
  return item.examTime || '输入考试时间'
}

/** 获取考场值 */
const getExamRoomValue = (projectId: number, scheduleId: number) => {
  return projectData[projectId]?.[scheduleId]?.examRoomId
}

/** 获取考试时间值 */
const getExamTimeValue = (projectId: number, scheduleId: number) => {
  return projectData[projectId]?.[scheduleId]?.examTime
}

/** 初始化项目数据 */
const initProjectData = () => {
  // 清除旧数据
  const keys = Object.keys(projectData)
  keys.forEach(key => delete projectData[Number(key)])

  // 设置新数据
  for (const project of detailData.value.projectExamInfoRespList || []) {
    projectData[project.projectId] = {}
    for (const item of project.projectExamInfoItemRespList || []) {
      projectData[project.projectId][item.scheduleId] = {
        examRoomId: item.examRoomId ?? null,
        examTime: item.examTime || ''
      }
    }
  }
}

/** 获取详情数据 */
const fetchDetail = async () => {
  if (!noticeId.value) return
  loading.value = true
  try {
    const res = await getAdmissionTicketInfo(noticeId.value)
    detailData.value = res.data || {} as AdmissionTicketInfoResp
    initProjectData()
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

/** 切换通知项目下载状态 */
const onToggleProjectStatus = async (projectId: number, status: number) => {
  if (detailData.value.admissionTicketStatus !== 1) {
    Message.warning('请先开启通知准考证下载')
    return
  }
  try {
    // 开启下载时，收集该项目下所有考试安排的数据
    const project = detailData.value.projectExamInfoRespList?.find(p => p.projectId === projectId)
    const scheduleList: { scheduleId: number; examRoomId: number | null; examTime: string }[] = []

    if (status === 1 && project) {
      // 验证所有考试安排都有考场和考试时间
      for (const item of project.projectExamInfoItemRespList || []) {
        const data = projectData[projectId]?.[item.scheduleId]
        const examRoomId = data?.examRoomId ?? null
        const examTime = data?.examTime ?? ''

        if (!examRoomId) {
          Message.warning(`请为【${project.projectCode}】的【${getPracticalTypeText(item.practicalType)}】选择考场`)
          return
        }
        if (!examTime) {
          Message.warning(`请为【${project.projectCode}】的【${getPracticalTypeText(item.practicalType)}】输入考试时间`)
          return
        }

        scheduleList.push({
          scheduleId: item.scheduleId,
          practicalType: item.practicalType,
          examRoomId,
          examTime
        })
      }
    }
    await toggleProjectAdmissionTicketStatus(noticeId.value, projectId, status, scheduleList)
    Message.success(status === 1 ? '已开启下载' : '已关闭下载')
    fetchDetail()
  } catch (error) {
  }
}

/** 考场变化 */
const onExamRoomChange = (projectId: number, scheduleId: number, value: any) => {
  if (!projectData[projectId]) {
    projectData[projectId] = {}
  }
  if (!projectData[projectId][scheduleId]) {
    projectData[projectId][scheduleId] = { examRoomId: null, examTime: '' }
  }
  // 级联选择器返回数组，取最后一个值（最底层）
  if (value && Array.isArray(value)) {
    projectData[projectId][scheduleId].examRoomId = value[value.length - 1] ?? null
  } else {
    projectData[projectId][scheduleId].examRoomId = value ?? null
  }
}

/** 考试时间变化 */
const onExamTimeChange = (projectId: number, scheduleId: number, value: any) => {
  if (!projectData[projectId]) {
    projectData[projectId] = {}
  }
  if (!projectData[projectId][scheduleId]) {
    projectData[projectId][scheduleId] = { examRoomId: null, examTime: '' }
  }
  projectData[projectId][scheduleId].examTime = value?.target?.value || value || ''
}


/** 批量导出选中的项目准考证 */
const onBatchExport = async () => {
  if (selectedExportProjects.value.length === 0) {
    Message.warning('请选择要导出的项目')
    return
  }

  loading.value = true
  try {
    const res = await exportAdmissionTicketRecord({
      noticeId: noticeId.value,
      projectIds: selectedExportProjects.value
    })


    // =========================
    // 核心：触发浏览器下载
    // =========================
    const blob = new Blob([res.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })

    const url = window.URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = `准考证导出.xlsx`

    document.body.appendChild(link)
    link.click()

    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } finally {
    loading.value = false
  }
}

/** 打开弹窗 */
const onOpen = (id: string) => {
  noticeId.value = id
  visible.value = true
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

/* ========== 项目操作行 ========== */
.project-action-row td {
  background: #fff !important;
  padding: 8px 12px;
}
</style>
