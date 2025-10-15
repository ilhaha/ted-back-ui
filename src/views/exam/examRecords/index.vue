<template>
  <div class="gi_table_page">
    <GiTable
      title="考试记录管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      :row-selection="rowSelection"
      :selected-keys="selectedKeys"
      @refresh="search"
      @select="handleSelect"
      @select-all="handleSelectAll"
    >
      <template #registrationProgress="{ record }">
        <a-tag :color="getProgressColor(Number(record.registrationProgress))">
          {{ getProgressText(Number(record.registrationProgress)) }}
        </a-tag>
      </template>
      <template #reviewStatus="{ record }">
        <a-tag :color="getReviewStatusColor(Number(record.reviewStatus))">
          {{ getReviewStatusText(Number(record.reviewStatus)) }}
        </a-tag>
      </template>

      <template #toolbar-left>
        <a-space>
          <a-select
            v-model="queryForm.planId"
            placeholder="请选择计划名称"
            allow-clear
            style="width: 200px"
          >
            <a-option
              v-for="item in plan_id_enum"
              :key="item.value"
              :value="item.value"
            >
              {{ item.label }}
            </a-option>
          </a-select>
          <!--          <a-select -->
          <!--            v-model="queryForm.registrationProgress" -->
          <!--            placeholder="请选择报名进度" -->
          <!--            allow-clear -->
          <!--            style="width: 200px" -->
          <!--          > -->
          <!--            <a-option -->
          <!--              v-for="item in registration_progress_enum" -->
          <!--              :key="item.value" -->
          <!--              :value="item.value" -->
          <!--            > -->
          <!--              {{ item.label }} -->
          <!--            </a-option> -->
          <!--          </a-select> -->
          <a-button type="primary" @click="search">
            <template #icon><icon-search /></template>
            <template #default>搜索</template>
          </a-button>
          <a-button @click="reset">
            <template #icon><icon-refresh /></template>
            <template #default>重置</template>
          </a-button>
        </a-space>
      </template>
      <template #toolbar-right>
        <a-space class="batch-actions">
          <a-button
            v-permission="['exam:examRecords:audit']"
            :disabled="!selectedKeys.length"
            type="primary"
            @click="handleBatchAudit"
          >
            <template #icon><icon-check /></template>
            <template #default>批量审核</template>
          </a-button>
          <!-- <a-button v-permission="['exam:examRecords:export']" @click="onExport">
            <template #icon><icon-download /></template>
            <template #default>导出</template>
          </a-button> -->
        </a-space>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examRecords:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-popconfirm
            v-permission="['exam:examRecords:audit']"
            :disabled="record.reviewStatus !== 0"
            position="br"
            @ok="handleQuickAudit(record, 1)"
          >
            <a-link
              status="warning"
              :disabled="record.reviewStatus !== 0"
              title="点击快速审核"
            >
              审核
            </a-link>
            <template #content>
              <div style="padding: 8px; width: 300px">
                <a-radio-group v-model="tempReviewStatus" type="button">
                  <a-radio :value="1">通过</a-radio>
                  <a-radio :value="2">拒绝</a-radio>
                </a-radio-group>
              </div>
            </template>
          </a-popconfirm>
        </a-space>
        <a-link
          v-permission="['exam:examRecords:delete']"
          status="danger"
          :disabled="record.disabled"
          :title="record.disabled ? '不可删除' : '删除'"
          @click="onDelete(record)"
        >
          删除
        </a-link>
      </template>
      <template #examPaper="{ record }">
        <a-button @click="showFormattedExamPaper(record)">查看试卷</a-button>
      </template>
    </GiTable>

    <!-- 修改弹窗内容为结构化展示 -->
    <a-modal
      v-model:visible="examPaperVisible"
      title="考试试卷详情"
      width="800px"
      :footer="false"
    >
      <div class="exam-paper-container">
        <div class="exam-legend">
          <div class="legend-item">
            <div class="color-dot correct"></div>
            <span class="legend-text">正确答案</span>
            <div class="color-dot wrong"></div>
            <span class="legend-text">考生所选的错误答案</span>
            <div class="color-dot missed"></div>
            <span class="legend-text">未作答题目的正确答案</span>
            <span class="legend-desc">（单选题/判断题）</span>
          </div>
          <div class="legend-item">
            <div class="color-dot correct"></div>
            <span class="legend-text">正确答案</span>
            <div class="color-dot wrong"></div>
            <span class="legend-text">考生所选的错误答案</span>
            <div class="color-dot missed"></div>
            <span class="legend-text">考生漏选答案</span>
            <span class="legend-desc">（多选题）</span>
          </div>
        </div>
        <div
          v-for="(question, index) in formattedExamPaper.questions"
          :key="index" class="question-card"
        >
          <!-- 题型标识 -->
          <div class="question-header">
            <a-tag :color="getQuestionTypeColor(question.questionType)">
              {{ getQuestionType(question.questionType) }}
            </a-tag>
            <span class="question-index">第{{ index + 1 }}题</span>
          </div>

          <!-- 题干 -->
          <div class="question-title">
            {{ question.question }}
            <!--            {{ isTrue(question.options, (question.userAnswer || [])) }} -->
          </div>

          <!-- 选项区域 -->
          <div class="options-wrapper">
            <!-- 单选题 -->
            <template v-if="question.questionType === 0">
              <div
                v-for="(opt, optIndex) in question.options"
                :key="optIndex"
                class="option-item" :class="[{
                  'missed-answer': opt.isCorrectAnswer && !(question.userAnswer || []).includes(opt.id) && !question.userAnswer,
                  'correct-answer': opt.isCorrectAnswer && question.userAnswer,
                  'wrong-judge': (question.userAnswer || []).includes(opt.id) && !opt.isCorrectAnswer,
                }]"
              >
                <span class="option-label">{{ getOptionChar(optIndex) }}</span>
                {{ opt.question }}
              </div>
            </template>

            <!-- 多选题 -->
            <template v-if="question.questionType === 2">
              <div
                v-for="(opt, optIndex) in question.options"
                :key="optIndex"
                class="option-item" :class="{
                  'correct-answer': opt.isCorrectAnswer && (question.userAnswer || []).includes(opt.id),
                  'wrong-selected': !opt.isCorrectAnswer && (question.userAnswer || []).includes(opt.id),
                  'missed-answer': opt.isCorrectAnswer && !(question.userAnswer || []).includes(opt.id),
                }"
              >
                <span class="option-label">{{ getOptionChar(optIndex) }}</span>
                {{ opt.question }}
              </div>
            </template>

            <!-- 判断题 -->
            <template v-if="question.questionType === 1">
              <a-space>
                <div
                  v-for="(opt, optIndex) in question.options"
                  :key="optIndex"
                  class="option-item" :class="[{
                    'missed-answer': opt.isCorrectAnswer && !(question.userAnswer || []).includes(opt.id) && !question.userAnswer,
                    'correct-answer': opt.isCorrectAnswer && question.userAnswer,
                    'wrong-judge': (question.userAnswer || []).includes(opt.id) && !opt.isCorrectAnswer,
                  }]"
                >
                  {{ opt.question }}
                </div>
              </a-space>
            </template>
          </div>
        </div>
      </div>
      <!-- 自定义底部关闭按钮 -->
      <div>
        <a-button
          type="primary"
          style="float: right"
          @click="examPaperVisible = false"
        >
          关闭
        </a-button>
      </div>
    </a-modal>
    <!-- 新增批量审核弹窗 -->
    <a-modal
      v-model:visible="batchAuditVisible"
      title="批量审核"
      @ok="handleBatchAuditSubmit"
      @cancel="batchAuditVisible = false"
    >
      <a-form :model="batchAuditForm">
        <a-form-item label="审核结果">
          <a-radio-group v-model="batchAuditForm.reviewStatus">
            <a-radio :value="1">通过</a-radio>
            <a-radio :value="2">拒绝</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>
    <ExamRecordsAddModal ref="ExamRecordsAddModalRef" @save-success="search" />
    <ExamRecordsDetailDrawer
      ref="ExamRecordsDetailDrawerRef"
      :get-progress-color="getProgressColor"
      :get-progress-text="getProgressText"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { Message } from '@arco-design/web-vue'
import ExamRecordsAddModal from './ExamRecordsAddModal.vue'
import ExamRecordsDetailDrawer from './ExamRecordsDetailDrawer.vue'
import { type ExamRecordsQuery, type ExamRecordsResp, deleteExamRecords, exportExamRecords, listExamRecords } from '@/apis/exam/examRecords'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { useExamRecords } from '@/hooks/exam/useExamRecords'
import { submitReviewResult } from '@/apis/invigilate/planInvigilate'

defineOptions({ name: 'ExamRecords' })

const { plan_id_enum, registration_progress_enum, getPlanList } = useExamRecords()
// 在script部分添加以下内容
const examPaperVisible = ref(false)
const formattedExamPaper = ref('')

type AnswerStatus = 'correct' | 'wrong-selected' | 'missed'

const getAnswerStatus = (
  options: Array<{ id: number, isCorrectAnswer: boolean }>,
  userAnswer: number[],
): AnswerStatus[] => {
  // 1. 提取所有正确答案的ID集合
  const correctIds = new Set(
    options.filter((opt) => opt.isCorrectAnswer).map((opt) => opt.id),
  )

  // 2. 用户选择的ID集合
  const userSelected = new Set(userAnswer)

  // 3. 计算每个选项的状态
  return options.map((opt) => {
    if (userSelected.has(opt.id)) {
      return opt.isCorrectAnswer ? 'correct' : 'wrong-selected'
    } else {
      return opt.isCorrectAnswer ? 'missed' : 'neutral'
    }
  }).filter((status) => status !== 'neutral') // 过滤无关选项的状态
}
// 修改现有的formatExamPaper方法
const formatExamPaper = (jsonStr: string) => {
  try {
    const rawData = JSON.parse(jsonStr)
    // 定义要排除的字段
    const excludeFields = [
      'knowledgeTypeId',
      'knowledgeTypeName',
      'knowledgeTypeTopicNumber',
      'attachment',
    ]

    // 递归过滤函数
    const filterFields = (data) => {
      if (Array.isArray(data)) {
        return data.map((item) => filterFields(item))
      } else if (data && typeof data === 'object') {
        return Object.entries(data).reduce((acc, [key, value]) => {
          if (!excludeFields.includes(key)) {
            acc[key] = filterFields(value)
          }
          return acc
        }, {})
      }
      return data
    }

    return filterFields(rawData)
  } catch (e) {
    return { error: '无效的JSON格式' }
  }
}

// 获取题型标签
const getQuestionType = (type: number) => {
  return {
    0: '单选题',
    1: '判断题',
    2: '多选题',
  }[type] || '未知题型'
}

// 获取题型颜色
const getQuestionTypeColor = (type: number) => {
  return {
    0: 'arcoblue',
    1: 'purple',
    2: 'orange',
  }[type] || 'gray'
}

// 转换选项编号为字母
const getOptionChar = (index: number) => {
  return String.fromCharCode(65 + index)
}

const isTrue = (
  value: Array<{
    id: number
    question: string
    questionBankId: number
    isCorrectAnswer: boolean
  }>,
  userAnswer: number[],
): '对' | '错' => { // 改为返回字符串 "对" 或 "错"
  // 提取正确答案ID并排序
  const correctIds = value
    .filter((item) => item.isCorrectAnswer)
    .map((item) => item.id)
    .sort((a, b) => a - b)

  // 处理用户答案
  const processedUserAnswer = [...userAnswer].sort((a, b) => a - b)

  // 判断结果并返回对应字符串
  const isCorrect
      = correctIds.length === processedUserAnswer.length
        && correctIds.every((id, index) => id === processedUserAnswer[index])

  return isCorrect ? '对' : '错' // 根据布尔值返回中文
}

// 显示格式化JSON弹窗
const showFormattedExamPaper = (record: ExamRecordsResp) => {
  formattedExamPaper.value = formatExamPaper(record.examPaper)
  examPaperVisible.value = true
}
// 初始化获取计划列表
onMounted(() => {
  getPlanList()
})

const queryForm = reactive<ExamRecordsQuery>({
  planId: '',
  registrationProgress: undefined,
  sort: ['planId,asc'],
})

// 批量审核相关状态
const selectedKeys = ref<number[]>([]) // 改为数字数组
const batchAuditVisible = ref(false)
const batchAuditForm = reactive({
  reviewStatus: 1,
})

// 表格多选配置
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: false,
  onlyCurrent: false,
})

// 处理选择事件
const handleSelect = (keys: string[]) => {
  selectedKeys.value = keys
}

// 修改后
const handleSelectAll = (keys: any) => {
  selectedKeys.value = Array.isArray(keys) ? keys : []
}

// 批量审核按钮点击
const handleBatchAudit = () => {
  if (selectedKeys.value.length === 0) {
    Message.warning('请先选择要审核的记录')
    return
  }
  batchAuditVisible.value = true
}

// 提交批量审核
const handleBatchAuditSubmit = async () => {
  try {
    // 移除不必要的类型断言
    // eslint-disable-next-line ts/no-use-before-define
    const selectedRecords = dataList.value.filter((item) =>
      selectedKeys.value.includes(item.id), // 直接比较数字ID
    )
    // 检查考试计划ID类型
    const planIds = new Set(selectedRecords.map((item) => item.planId))

    if (planIds.size > 1) {
      Message.error('请选择同一考试计划的记录进行批量审核')
      return
    }

    // 提取考生ID
    const candidateIds = selectedRecords.map((item) => String(item.candidateId))
    const planId = String(selectedRecords[0].planId)

    await submitReviewResult(planId, {
      candidateIds,
      reviewStatus: batchAuditForm.reviewStatus,
    })

    Message.success(`已批量审核 ${selectedKeys.value.length} 条记录`)
    batchAuditVisible.value = false
    selectedKeys.value = []
    // eslint-disable-next-line ts/no-use-before-define
    search()
  // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (error) {
    Message.error('批量审核失败')
  }
}

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable(
  (page) => listExamRecords(
    { ...queryForm, ...page },
  ),
  { immediate: true },
)

// 获取进度颜色
const getProgressColor = (progress: number) => {
  const colorMap: Record<number, string> = {
    0: 'blue', // 待考试
    1: 'orange', // 考试中
    2: 'purple', // 等待成绩
    3: 'green', // 已完成
    4: 'red', // 未上传指定资料
  }
  return colorMap[progress] || 'default'
}

// 获取进度文本
const getProgressText = (progress: number) => {
  const textMap: Record<number, string> = {
    0: '待考试',
    1: '考试中',
    2: '等待成绩',
    3: '已完成',
    4: '未上传指定资料',
  }
  return textMap[progress] || '未知'
}

const columns = ref<TableInstanceColumns[]>([
  { dataIndex: 'planName', title: '考试计划名称', width: 80, fixed: 'left' },
  { dataIndex: 'candidateName', title: '考生名称', width: 150 },
  // { dataIndex: 'registrationProgress', title: '报名进度', slotName: 'registrationProgress', width: 120, align: 'center' },
  { dataIndex: 'examScores', title: '考试得分', width: 150 },
  {
    dataIndex: 'examPaper',
    title: '考试试卷',
    width: 150,
    slotName: 'examPaper', // 添加插槽名称
  },
  { dataIndex: 'createUserString', title: '创建人', width: 120 },
  { dataIndex: 'createTime', title: '创建时间', width: 180 },
  {
    dataIndex: 'reviewStatus',
    title: '审核状态',
    slotName: 'reviewStatus', // 添加插槽名称
    width: 120,
    align: 'center', 
  },
  {
    dataIndex: 'action',
    title: '操作',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examRecords:detail', 'exam:examRecords:update', 'exam:examRecords:delete']),
  },
])

// 获取审核状态颜色
const getReviewStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'arcoblue', // 待审核
    1: 'green', // 通过
    2: 'red', // 拒绝
  }
  return colorMap[status] || 'gray'
}

// 获取审核状态文本
const getReviewStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    0: '待审核',
    1: '审核通过',
    2: '审核不通过',
  }
  return textMap[status] || '未知状态'
}

// 重置
const reset = () => {
  queryForm.planId = ''
  queryForm.registrationProgress = undefined
  search()
}

// 删除
const onDelete = (record: ExamRecordsResp) => {
  return handleDelete(() => deleteExamRecords(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamRecords(queryForm))
}

const ExamRecordsAddModalRef = ref<InstanceType<typeof ExamRecordsAddModal>>()

// // 新增
// const onAdd = () => {
//   ExamRecordsAddModalRef.value?.onAdd()
// }

// // 修改
// const onUpdate = (record: ExamRecordsResp) => {
//   ExamRecordsAddModalRef.value?.onUpdate(record.id)
// }

const ExamRecordsDetailDrawerRef = ref<InstanceType<typeof ExamRecordsDetailDrawer>>()
// 详情
const onDetail = (record: ExamRecordsResp) => {
  ExamRecordsDetailDrawerRef.value?.onOpen(record.id)
}

// 在script中添加
const tempReviewStatus = ref(1)
const tempReviewComment = ref('')

// 提交审核逻辑
const handleQuickAudit = async (record: ExamRecordsResp) => {
  try {
    await submitReviewResult(record.planId, {
      candidateIds: [record.candidateId], // 保持数组格式
      reviewStatus: tempReviewStatus.value,
    })
    Message.success('审核提交成功')
    search()
  // eslint-disable-next-line unused-imports/no-unused-vars
  } catch (error) {
    Message.error('审核提交失败')
  } finally {
    tempReviewStatus.value = 1
    tempReviewComment.value = ''
  }
}
</script>

<style scoped lang="scss">
:deep(.arco-tag) {
  text-align: center;
}

// 添加批量操作按钮样式
.batch-actions {
  margin-left: 12px;
  .arco-btn {
    margin-right: 8px;
  }
}

:deep(.gi-table-row-selected) {
  background-color: var(--color-primary-light-1);
}

.exam-paper-container {
  max-height: 500px;
  overflow: auto;
  padding: 12px;

  .question-card {
    margin-bottom: 24px;
    border-bottom: 1px solid #f0f0f0;
    padding-bottom: 16px;

    &:last-child {
      border-bottom: none;
    }
  }

  .question-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;

    .question-index {
      margin-left: 8px;
      color: #888;
      font-size: 0.9em;
    }
  }

  .question-title {
    font-weight: 500;
    margin-bottom: 12px;
    color: #333;
  }

  .options-wrapper {
    .option-item {
      border: 1px solid #ddd;      /* 默认边框 */
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;         /* 圆角 */
      cursor: pointer;
      transition: all 0.3s ease;  /* 过渡动画 */

      /* 悬停效果 */
      .option-item:hover {
        border-color: #409EFF;      /* Element UI蓝色 */
        background: #f5f7fa;
      }

      &.correct-answer {
        background: rgba(76,175,80,0.1);
        border: 1px solid #4CAF50;
      }

      /* 错选状态 */
      &.wrong-selected {
        background: rgba(76,175,80,0.1);
        border: 2px dashed #f44336;
      }

      /* 漏选状态 */
      &.missed-answer {
        background: rgba(76,175,80,0.1);
        border: 2px dotted #FFC107;
        opacity: 0.8;
      }

      &.wrong-judge {
        background: #ffebee;
        color: #f44336;
      }

      .option-label {
        display: inline-block;
        width: 20px;
        font-weight: bold;
        color: #666;
      }
    }

    .judge-item {
      padding: 6px 16px;
      border-radius: 4px;
      border: 2px solid white; // 统一设置边框宽度和样式[3,5](@ref)

      &.correct-judge {
        background: #e8f5e9;
        color: #4CAF50;
        border-color: #4CAF50; // 绿色边框[3,6](@ref)
      }

      &.wrong-judge {
        background: #ffebee;
        color: #f44336;
        border-color: #f44336; // 红色边框[3,6](@ref)
      }
    }
  }
}

.exam-legend {
  display: flex;
  gap: 20px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 13px;

  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    &.correct { background: #4CAF50; }
    &.wrong { background: #f44336; }
    &.missed { background: #FFC107; }
  }

  .legend-text {
    color: #606266;
    margin-right: 6px;
  }

  .legend-desc {
    color: #909399;
    font-style: italic;
    margin-left: 4px;
  }
}
</style>
