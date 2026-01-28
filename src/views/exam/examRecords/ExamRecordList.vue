<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" :row-selection="rowSelection" @refresh="search" @select="select"
      @select-all="selectAll">
      <template #toolbar-left>
        <a-space>
          <a-input-search @search="search" v-model="queryForm.candidateName" placeholder="搜索考生姓名" allow-clear
            class="search-input ml-2" />
          <a-input-search @search="search" v-model="queryForm.username" placeholder="搜索考生身份证" allow-clear
            class="search-input ml-2" />
          <a-select v-model="queryForm.isCertificateGenerated" placeholder="请选择证书状态" allow-clear
            class="search-input ml-2" @change="search">
            <a-option key="0" :value="0">未生成</a-option>
            <a-option key="1" :value="1">已生成</a-option>
          </a-select>
          <a-button @click="reset">
            <template #icon><icon-refresh /></template>
            <template #default>重置</template>
          </a-button>
        </a-space>
      </template>
      <template #toolbar-right>
        <a-space class="batch-actions">
          <a-popconfirm title="确认生成资格证？" content="生成资格证信息后，所选考生成绩将无法修改，请确认是否继续。" ok-text="确认生成" cancel-text="取消"
            @ok="handleBatchGenerate">
            <a-button v-permission="['exam:certificate:generated']" :loading="generateing"
              :disabled="!(selectedKeys.length && queryForm.planId)" type="primary">
              <template #icon><icon-upload /></template>
              <template #default>批量生成资格证信息</template>
            </a-button>
          </a-popconfirm>
        </a-space>
      </template>
      <template #examScoresTitle>
        理论成绩
        <a-space>
          <a-link v-permission="['update:theoretical:score']" title="修改理论成绩" @click="openInputExamScore"
            v-if="!isShowInputExamScore">【修改】</a-link>
          <a-popconfirm content="确定要修改理论成绩吗？" ok-text="确定" cancel-text="取消" @ok="saveExamScores">
            <a-link v-permission="['update:theoretical:score']" title="修改理论成绩绩" v-if="isShowInputExamScore"
              :loading="saveScoresLoading">
              【保存】
            </a-link>
          </a-popconfirm>
        </a-space>
      </template>
      <template #operScoresTitle>
        实操成绩
        <a-space>
          <a-link v-permission="['exam:record:input']" title="录入实操成绩" @click="openInputOperScore"
            v-if="!isShowInputOperScore && hasOper">【录入】</a-link>
          <a-popconfirm content="确定要保存实操成绩吗？" ok-text="确定" cancel-text="取消" @ok="saveOperScores">
            <a-link v-permission="['exam:record:input']" title="保存实操成绩" v-if="isShowInputOperScore && hasOper"
              :loading="saveScoresLoading">
              【保存】
            </a-link>
          </a-popconfirm>
        </a-space>
      </template>
      <template #roadScoresTitle>
        道路成绩
        <a-space>
          <a-link v-permission="['exam:record:input']" title="录入道路成绩" @click="openInputRoadScore"
            v-if="!isShowInputRoadScore && hasRoad">【录入】</a-link>
          <a-popconfirm content="确定要保存道路成绩吗？" ok-text="确定" cancel-text="取消" @ok="saveRoadScores">
            <a-link v-permission="['exam:record:input']" title="保存道路成绩" v-if="isShowInputRoadScore && hasRoad"
              :loading="saveScoresLoading">
              【保存】
            </a-link>
          </a-popconfirm>
        </a-space>
      </template>
      <template #examPaper="{ record }">
        <a-link @click="showFormattedExamPaper(record)" v-if="record.examPaper">查阅</a-link>
        <a-tag color="red" v-else>
          缺考
        </a-tag>
      </template>
      <template #registrationProgress="{ record }">
        <a-tag :color="getProgressColor(Number(record.registrationProgress))">
          {{ getProgressText(Number(record.registrationProgress)) }}
        </a-tag>
      </template>
      <template #examResultStatus="{ record }">
        <a-tag :color="getExamResultStatusColor(Number(record.examResultStatus))">
          {{ getExamResultStatusText(Number(record.examResultStatus)) }}
        </a-tag>
      </template>
      <template #reviewStatus="{ record }">
        <a-tag :color="getReviewStatusColor(Number(record.reviewStatus))">
          {{ getReviewStatusText(Number(record.reviewStatus)) }}
        </a-tag>
      </template>

      <template #isCertificateGenerated="{ record }">
        <a-tag :color="getCertificateStatusColor(record.isCertificateGenerated)" v-if="record.examResultStatus != 0">
          {{ getCertificateStatusText(record.isCertificateGenerated) }}
        </a-tag>
        <a-tag color="red" v-else>
          不具备取证条件
        </a-tag>
      </template>
      <template #examScores="{ record }">
        <a-space v-if="canInputExamScore(record)">
          <a-input-number v-model="record.examScores" :min="0" :max="100" :precision="0" placeholder="分数" />
        </a-space>
        <a-space v-else>
          {{ record.examScores }}
        </a-space>
      </template>
      <template #operScores="{ record }">
        <!-- 焊接项目 -->
        <span v-if="record.projectId === 110 || record.projectId === 111">
          <a-space direction="vertical" style="width: 100%;">
            <div v-for="item in record.weldingOperScoreVoList" :key="item.id">
              <span>{{ item.projectCode }} <a-divider direction="vertical" />
              </span>
              <a-input-number v-if="canInputOperScore(record)" v-model="item.operScore" :min="0" :max="100"
                :precision="0" placeholder="分数" />
              <a-tag v-else color="blue">{{ item.operScore ?? '-' }}</a-tag>
            </div>
          </a-space>
        </span>

        <!-- 普通项目 -->
        <span v-else>
          <a-space>
            <a-input-number v-if="canInputOperScore(record)" v-model="record.operScores" :min="0" :max="100"
              :precision="0" placeholder="分数" />
            <span v-else>{{ record.operScores }}</span>
          </a-space>
        </span>
      </template>


      <template #roadScores="{ record }">
        <a-space v-if="canInputRoadScore(record)">
          <a-input-number v-model="record.roadScores" :min="0" :max="100" :precision="0" placeholder="分数" />
        </a-space>
        <a-space v-else>
          <span v-if="hasRoad">{{ record.roadScores }}</span>
          <a-tag color="blue" v-else>
            免考
          </a-tag>
        </a-space>
      </template>

      <template #action="{ record }">
        <a-space v-if="canGenerateCertificate(record)">
          <a-popconfirm title="确认生成资格证？" content="生成资格证信息后，该考生成绩将无法修改，请确认是否继续。" ok-text="确认生成" cancel-text="取消"
            @ok="generateQualificationCertificate(record)">
            <a-link v-permission="['exam:certificate:generated']" title="生成资格证信息" :loading="generateing">
              生成资格证信息
            </a-link>
          </a-popconfirm>
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
import { Message } from '@arco-design/web-vue'
import { getCascaderProjectPlan } from '@/apis/exam/examPlan'
import {
  type ExamRecordsQuery, type ExamRecordsResp, deleteExamRecords, exportExamRecords, listExamRecords, inputScores,
  generateQualificationCertificate as generateQualificationCertificateApi,
  downloadQualificationCertificate as downloadQualificationCertificateApi,
  inputWeldingScores, updateExamScores
} from '@/apis/exam/examRecords'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamRecords' })

// 在script部分添加以下内容
const examPaperVisible = ref(false)
const formattedExamPaper = ref('')

const saveScoresLoading = ref(false)

const inputScoresForm = ref<any>({
  scoresList: [],
  scores: 0,
  scoresType: 1
})

const generateQualificationForm = ref<any>({
  recordIds: [],
  planType: 0,
})


const generateing = ref(false);

const isShowInputExamScore = ref(false)

const isShowInputOperScore = ref(false)

const isShowInputRoadScore = ref(false)

const hasOper = ref(0)

const hasRoad = ref(0)

// 显示录入理论成绩的输入框
const openInputExamScore = () => {
  if (isShowInputOperScore.value) {
    Message.warning("请先完成实操成绩的录入")
    return
  }
  if (isShowInputRoadScore.value) {
    Message.warning("请先完成道路成绩的录入")
    return
  }
  isShowInputExamScore.value = true;
}

// 是否可以修改理论成绩
const canInputExamScore = computed(() => {
  return (record: any) => {
    return record.examPaper && record.isCertificateGenerated === 0 && isShowInputExamScore.value
  }
})


// 显示录入实操成绩的输入框
const openInputOperScore = () => {
  if (isShowInputRoadScore.value) {
    Message.warning("请先完成道路成绩的录入")
    return
  }
  if (isShowInputExamScore.value) {
    Message.warning("请先完成理论成绩的修改")
    return
  }
  isShowInputOperScore.value = true;
}

// 是否可以录入实操成绩
const canInputOperScore = computed(() => {
  return (record: any) => {
    return record.isOperation === 1 && record.isCertificateGenerated === 0 && isShowInputOperScore.value
  }
})

// 显示录入道路成绩的输入框
const openInputRoadScore = () => {
  if (isShowInputOperScore.value) {
    Message.warning("请先完成实操成绩的录入")
    return
  }
  if (isShowInputExamScore.value) {
    Message.warning("请先完成理论成绩的修改")
    return
  }
  isShowInputRoadScore.value = true;
}

// 是否可以道路录入成绩
const canInputRoadScore = computed(() => {
  return (record: any) => {
    return record.isRoad == 1 && record.isCertificateGenerated == 0 && isShowInputRoadScore.value
  }
})



// 生成资格证
const generateQualificationCertificate = async (record: any) => {
  if (record.isCertificateGenerated !== 0) {
    Message.warning('该记录已生成资格证信息，无法再次生成');
    return;
  }
  if (record.examScores < 70) {
    Message.warning('理论成绩未达标，无法生成资格证');
    return;
  }
  if (record.isOperation === 1 && record.operScores < 70) {
    Message.warning('实操成绩未达标，无法生成资格证');
    return;
  }
  if (record.isRoad === 1 && record.roadScores < 70) {
    Message.warning('道路成绩未达标，无法生成资格证');
    return;
  }
  try {
    generateing.value = true;
    generateQualificationForm.value.recordIds = [record.id]
    await generateQualificationCertificateApi(generateQualificationForm.value)
    isShowInputOperScore.value = false
    isShowInputRoadScore.value = false
    Message.success('资格证生成成功');
    search();
  } catch (error) {
  } finally {
    generateing.value = false;
  }

};

// 判断是否可以生成资格证
const canGenerateCertificate = (record: any) => {
  if (record.isCertificateGenerated !== 0) return false;
  // if (record.examScores < 70) return false;
  // if (record.isOperation === 1 && record.operScores < 70) return false;
  // if (record.isRoad === 1 && record.roadScores < 70) return false;
  return record.examResultStatus == 1 && !isShowInputOperScore.value && !isShowInputRoadScore.value && !isShowInputExamScore.value;
};

// 批量修改理论成绩
const saveExamScores = async () => {
  // 过滤出 未生成证书 + 已填写分数的记录
  const targetList = dataList.value.filter(item => item.isCertificateGenerated === 0 &&
    item.examScores !== null &&
    item.examScores !== undefined
  )
  if (targetList.length === 0) {
    Message.warning('暂无可修改的理论成绩')
    return
  }
  inputScoresForm.value.scoresType = 0
  inputScoresForm.value.scoresList = targetList.map(item => ({
    recordId: item.id,
    scores: item.examScores
  }))

  try {
    saveScoresLoading.value = true
    await updateExamScores(inputScoresForm.value)
    Message.success('理论成绩已修改')
    isShowInputExamScore.value = false
    search()
  } finally {
    saveScoresLoading.value = false
  }
}

// 批量保存实操成绩
const saveOperScores = async () => {
  // 过滤出需要保存的记录：需要实操 + 未生成证书 + 已填写分数
  const targetList = dataList.value.filter(item => {
    if (item.isOperation !== 1 || item.isCertificateGenerated !== 0) return false

    if (item.projectId === 110 || item.projectId === 111) {
      return Boolean(item.weldingOperScoreVoList?.some(w => w.operScore !== null && w.operScore !== undefined))
    } else {
      return item.operScores !== null && item.operScores !== undefined
    }
  })

  if (targetList.length === 0) {
    Message.warning('暂无可保存的实操成绩')
    return
  }

  // 判断要保存的是哪种类型
  const firstItem = targetList[0]

  if (firstItem.projectId === 110 || firstItem.projectId === 111) {
    // 焊接项目
    const weldingScoresList = targetList
      .flatMap(item =>
        item.weldingOperScoreVoList
          .filter(w => w.operScore !== null && w.operScore !== undefined)
          .map(w => ({
            recordId: item.id,
            weldingOperScoreId: w.id,
            operScore: w.operScore
          }))
      )

    if (weldingScoresList.length === 0) {
      Message.warning('暂无焊接项目可保存的实操成绩')
      return
    }
    try {
      saveScoresLoading.value = true
      await inputWeldingScores(weldingScoresList)
      Message.success('焊接项目实操成绩已保存')
    } finally {
      saveScoresLoading.value = false
    }
  } else {
    // 普通项目
    const normalScoresList = targetList
      .filter(item => item.projectId !== 110 && item.projectId !== 111)
      .map(item => ({
        recordId: item.id,
        scores: item.operScores
      }))

    if (normalScoresList.length === 0) {
      Message.warning('暂无普通项目可保存的实操成绩')
      return
    }

    inputScoresForm.value.scoresType = 1
    inputScoresForm.value.scoresList = normalScoresList

    try {
      saveScoresLoading.value = true
      await inputScores(inputScoresForm.value)
      Message.success('普通项目实操成绩已保存')
    } finally {
      saveScoresLoading.value = false
    }
  }

  // 关闭弹窗 & 刷新列表
  isShowInputOperScore.value = false
  search()
}


// 批量保存道路成绩
const saveRoadScores = async () => {
  // 过滤出：需要道路 + 未生成证书 + 已填写分数的记录
  const targetList = dataList.value.filter(item =>
    item.isRoad == 1 && item.isCertificateGenerated === 0 &&
    item.roadScores !== null &&
    item.roadScores !== undefined
  )
  if (targetList.length === 0) {
    Message.warning('暂无可保存的道路成绩')
    return
  }
  inputScoresForm.value.scoresType = 2
  inputScoresForm.value.scoresList = targetList.map(item => ({
    recordId: item.id,
    scores: item.roadScores
  }))

  try {
    saveScoresLoading.value = true
    await inputScores(inputScoresForm.value)
    Message.success('道路成绩已保存')
    isShowInputRoadScore.value = false
    search()
  } finally {
    saveScoresLoading.value = false
  }
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


// 显示格式化JSON弹窗
const showFormattedExamPaper = (record: ExamRecordsResp) => {
  formattedExamPaper.value = formatExamPaper(record.examPaper)
  examPaperVisible.value = true
}
const queryForm = reactive<ExamRecordsQuery>({
  classId: '',
  planId: '',
  candidateName: '',
  isCertificateGenerated: '',
  username: '',
  sort: ['id,desc'],
  isOrgQuery: false
})

// 批量生成资格证按钮点击
const handleBatchGenerate = async () => {
  if (selectedKeys.value.length === 0) {
    Message.warning('请先选择要生成资格证信息的记录')
    return
  }
  try {
    const selectedRecords = dataList.value.filter(item =>
      selectedKeys.value.includes(item.id)
    );

    // 找出已生成证书的记录
    const certificateRecords = selectedRecords.filter(item => item.isCertificateGenerated == '1');

    if (certificateRecords.length > 0) {
      const names = certificateRecords.map(item => item.candidateName);
      Message.error(`${names.join('、')} 已生成资格证书信息，无法再次生成`);
      return;
    }
    generateing.value = true;
    generateQualificationForm.value.recordIds = selectedKeys.value
    await generateQualificationCertificateApi(generateQualificationForm.value);
    Message.success(`已生成 ${selectedKeys.value.length} 条记录资格证信息`);
    isShowInputOperScore.value = false
    isShowInputRoadScore.value = false
    selectedKeys.value = [];
    generateQualificationForm.value = {
      recordIds: [],
      planIds: [],
      planType: 0,
    }
    search();

  } catch (error) {
  } finally {
    generateing.value = false;
  }
}

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  selectedKeys,
  select,
  selectAll
} = useTable(
  (page) => listExamRecords(
    { ...queryForm, ...page },
  ),
  { immediate: false },
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
  { dataIndex: 'projectName', title: '考试项目' },
  { dataIndex: 'planName', title: '考试计划' },
  { dataIndex: 'seatId', title: '序号' },
  { dataIndex: 'candidateName', title: '考生姓名' },
  { dataIndex: 'username', title: '考生身份证号' },
  {
    dataIndex: 'examScores', slotName: 'examScores', title: '理论成绩', align: 'center', titleSlotName: 'examScoresTitle', width: 165
  },
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
  { dataIndex: 'isCertificateGenerated', slotName: 'isCertificateGenerated', title: '证书状态', align: 'center', },
  {
    dataIndex: 'action',
    title: '操作',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:certificate:generated']),
  },
])

// 表格多选配置
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedKeys,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  }
})

// 证书状态
const getCertificateStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'red', // 待审核
    1: 'green', // 通过
  }
  return colorMap[status] || 'gray'
}

// 证书状态文本
const getCertificateStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    0: '未生成',
    1: '已生成',
  }
  return textMap[status] || '未知状态'
}

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
  queryForm.candidateName = ''
  queryForm.isCertificateGenerated = ''
  queryForm.username = ''
  search()
}

const onOpen = (classId: string, planId: string, hasOperFlag: number, hasRoadFlag: number) => {
  queryForm.classId = classId
  queryForm.planId = planId
  hasOper.value = hasOperFlag
  hasRoad.value = hasRoadFlag
  search()
}

const afterClose = () => {
  queryForm.candidateName = ''
  queryForm.isCertificateGenerated = ''
  queryForm.username = ''
  isShowInputOperScore.value = false
  isShowInputRoadScore.value = false
  isShowInputExamScore.value = false
}

defineExpose({ onOpen, afterClose })


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