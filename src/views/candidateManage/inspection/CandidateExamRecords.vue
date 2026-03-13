<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-space>
          <a-input-search @search="search" v-model="queryForm.projectName" placeholder="搜索考试项目" allow-clear
            class="search-input ml-2" />
          <a-input-search @search="search" v-model="queryForm.planName" placeholder="搜索考试计划" allow-clear
            class="search-input ml-2" />
          <a-button @click="reset">
            <template #icon><icon-refresh /></template>
            <template #default>重置</template>
          </a-button>
        </a-space>
      </template>
      <template #examPaper="{ record }">
        <a-link @click="showFormattedExamPaper(record)">查阅</a-link>
      </template>
      <template #examResultStatus="{ record }">
        <a-tag :color="getExamResultStatusColor(Number(record.examResultStatus))">
          {{ getExamResultStatusText(Number(record.examResultStatus)) }}
        </a-tag>
      </template>
      <template #roadScores="{ record }">
        <a-space>
          <span v-if="record.isRoad == 1">{{ record.roadScores }}</span>
          <a-tag color="blue" v-else>
            免考
          </a-tag>
        </a-space>
      </template>
    </GiTable>

    <!-- 修改弹窗内容为结构化展示 -->
    <a-modal v-model:visible="examPaperVisible" title="理论考试答题情况" width="800px" :footer="false">
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
        <div v-for="(question, index) in formattedExamPaper.questions" :key="index" class="question-card">
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
              <div v-for="(opt, optIndex) in question.options" :key="optIndex" class="option-item" :class="[{
                'missed-answer': opt.isCorrectAnswer && !(question.userAnswer || []).includes(opt.id) && !question.userAnswer,
                'correct-answer': opt.isCorrectAnswer && question.userAnswer,
                'wrong-judge': (question.userAnswer || []).includes(opt.id) && !opt.isCorrectAnswer,
              }]">
                <span class="option-label">{{ getOptionChar(optIndex) }}</span>
                {{ opt.question }}
              </div>
            </template>

            <!-- 多选题 -->
            <template v-if="question.questionType === 2">
              <div v-for="(opt, optIndex) in question.options" :key="optIndex" class="option-item" :class="{
                'correct-answer': opt.isCorrectAnswer && (question.userAnswer || []).includes(opt.id),
                'wrong-selected': !opt.isCorrectAnswer && (question.userAnswer || []).includes(opt.id),
                'missed-answer': opt.isCorrectAnswer && !(question.userAnswer || []).includes(opt.id),
              }">
                <span class="option-label">{{ getOptionChar(optIndex) }}</span>
                {{ opt.question }}
              </div>
            </template>

            <!-- 判断题 -->
            <template v-if="question.questionType === 1">
              <a-space>
                <div v-for="(opt, optIndex) in question.options" :key="optIndex" class="option-item" :class="[{
                  'missed-answer': opt.isCorrectAnswer && !(question.userAnswer || []).includes(opt.id) && !question.userAnswer,
                  'correct-answer': opt.isCorrectAnswer && question.userAnswer,
                  'wrong-judge': (question.userAnswer || []).includes(opt.id) && !opt.isCorrectAnswer,
                }]">
                  {{ opt.question }}
                </div>
              </a-space>
            </template>
          </div>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import {
  type ExamRecordsQuery, type ExamRecordsResp, listCandidateExamRecords
} from '@/apis/exam/examRecords'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'

defineOptions({ name: 'ExamRecords' })

// 在script部分添加以下内容
const examPaperVisible = ref(false)
const formattedExamPaper = ref('')


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


// 显示格式化JSON弹窗
const showFormattedExamPaper = (record: ExamRecordsResp) => {
  formattedExamPaper.value = formatExamPaper(record.examPaper)
  examPaperVisible.value = true
}
const queryForm = reactive<ExamRecordsQuery>({
  candidateId: '',
  planName: '',
  projectName: ''
})


const {
  tableData: dataList,
  loading,
  pagination,
  search
} = useTable(
  (page) => listCandidateExamRecords(
    { ...queryForm, ...page },
  ),
  { immediate: false },
)




const columns = ref<TableInstanceColumns[]>([
  { dataIndex: 'projectName', title: '考试项目' },
  { dataIndex: 'planName', title: '考试计划' },
  { dataIndex: 'examScores', title: '理论成绩', align: 'center', },
  {
    dataIndex: 'operScores',
    slotName: 'operScores',
    title: '实操成绩',
    titleSlotName: 'operScoresTitle',
    align: 'center',
    width: 165
  },
  {
    dataIndex: 'roadScores',
    slotName: 'roadScores',
    title: '道路成绩',
    titleSlotName: 'roadScoresTitle',
    align: 'center',
    width: 165
  },
  {
    dataIndex: 'examPaper',
    title: '理论考试答卷', slotName: 'examPaper', align: 'center' // 添加插槽名称
  },
  {
    dataIndex: 'examResultStatus',
    title: '总评', slotName: 'examResultStatus', align: 'center' // 添加插槽名称
  },
])



const getExamResultStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'red', // 不及格
    1: 'green', // 及格
    2: 'blue', // 待录入
  }
  return colorMap[status] || 'gray'
}

// 获取审核状态文本
const getExamResultStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    0: '不及格',
    1: '及格',
    2: '待录入',
  }
  return textMap[status] || '未知状态'
}


// 重置
const reset = () => {
  queryForm.planName = ''
  queryForm.projectName = ''
  search()
}

const onOpen = (candidateId: string) => {
  queryForm.candidateId = candidateId
  search()
}

const afterClose = () => {
  queryForm.planName = ''
  queryForm.projectName = ''
}

defineExpose({ onOpen, afterClose })


</script>

<style lang="scss">
.no-padding-modal .arco-modal-body {
  padding: 0 !important;
}

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
      border: 1px solid #ddd;
      /* 默认边框 */
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px;
      /* 圆角 */
      cursor: pointer;
      transition: all 0.3s ease;
      /* 过渡动画 */

      /* 悬停效果 */
      .option-item:hover {
        border-color: #409EFF;
        /* Element UI蓝色 */
        background: #f5f7fa;
      }

      &.correct-answer {
        background: rgba(76, 175, 80, 0.1);
        border: 1px solid #4CAF50;
      }

      /* 错选状态 */
      &.wrong-selected {
        background: rgba(76, 175, 80, 0.1);
        border: 2px dashed #f44336;
      }

      /* 漏选状态 */
      &.missed-answer {
        background: rgba(76, 175, 80, 0.1);
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

    &.correct {
      background: #4CAF50;
    }

    &.wrong {
      background: #f44336;
    }

    &.missed {
      background: #FFC107;
    }
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