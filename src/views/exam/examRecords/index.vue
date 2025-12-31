<template>
  <div class="gi_table_page">
    <GiTable title="考试记录管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" :row-selection="rowSelection" @refresh="search" @select="select"
      @select-all="selectAll">


      <template #toolbar-left>
        <a-space>
          <a-cascader v-model="queryForm.planId" :options="projectPlanList" placeholder="选择考试计划" allow-clear
            @change="onPlanChange" class="search-input ml-2" />
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
          <a-button v-permission="['exam:record:input']" :disabled="!(selectedKeys.length && queryForm.planId)"
            type="primary" @click="handleBatchInput">
            <template #icon><icon-check /></template>
            <template #default>批量录入成绩</template>
          </a-button>
          <a-popconfirm title="确认生成资格证？" content="生成资格证后，所选考生成绩将无法修改，请确认是否继续。" ok-text="确认生成" cancel-text="取消"
            @ok="handleBatchGenerate">
            <a-button v-permission="['exam:certificate:generated']" :loading="generateing"
              :disabled="!(selectedKeys.length && queryForm.planId)" type="primary">
              <template #icon><icon-upload /></template>
              <template #default>批量生成资格证</template>
            </a-button>
          </a-popconfirm>
          <!-- <a-button v-permission="['exam:certificate:download']" :disabled="!(selectedKeys.length && queryForm.planId)"
            :loading="downloading" type="primary" @click="handleBatchDownload">
            <template #icon><icon-download /></template>
            <template #default>批量下载资格证</template>
          </a-button> -->
        </a-space>
      </template>
      <template #examPaper="{ record }">
        <a-link @click="showFormattedExamPaper(record)">查阅</a-link>
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
        <a-tag :color="getCertificateStatusColor(record.isCertificateGenerated)">
          {{ getCertificateStatusText(record.isCertificateGenerated) }}
        </a-tag>
      </template>
      <template #operScores="{ record }">
        <a-space v-if="record.isOperation == 1 && record.isCertificateGenerated == 0">
          <a-input-number v-model="record.operScores" :min="0" :max="100" :precision="0" placeholder="分数" />
          <a-button type="dashed" size="mini" v-permission="['exam:record:input']" @click="saveScores(record, 1)"
            :loading="saveScoresLoading">
            录入
          </a-button>
        </a-space>
        <a-space v-else>{{ record.operScores }}</a-space>
      </template>
      <template #roadScores="{ record }">
        <a-space v-if="record.isRoad == 1 && record.isCertificateGenerated == 0">
          <a-input-number v-model="record.roadScores" :min="0" :max="100" :precision="0" placeholder="分数" />
          <a-button type="dashed" size="mini" v-permission="['exam:record:input']" @click="saveScores(record, 2)"
            :loading="saveScoresLoading">
            录入
          </a-button>
        </a-space>
        <a-space v-else>{{ record.roadScores }}</a-space>
      </template>

      <template #action="{ record }">
        <a-space v-if="canGenerateCertificate(record)">
          <a-popconfirm title="确认生成资格证？" content="生成资格证后，该考生成绩将无法修改，请确认是否继续。" ok-text="确认生成" cancel-text="取消"
            @ok="generateQualificationCertificate(record)">
            <a-link v-permission="['exam:certificate:generated']" title="生成资格证" :loading="generateing">
              生成资格证
            </a-link>
          </a-popconfirm>
        </a-space>

        <!-- <a-space v-if="record.isCertificateGenerated == 1">
          <a-link v-permission="['exam:certificate:download']" title="下载资格证" :loading="downloading"
            @click="downloadQualificationCertificate(record)">
            下载资格证
          </a-link>
        </a-space> -->
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
    <!-- 新增批量录入弹窗 -->
    <a-modal v-model:visible="batchInputVisible" title="批量录入成绩" :mask-closable="false" :esc-to-close="false"
      @before-ok="handleBatchInputSubmit" @close="closeInputVisible" draggable>
      <a-form :model="inputScoresForm">
        <a-form-item label="成绩类型">
          <a-radio-group v-model="inputScoresForm.scoresType">
            <a-radio :value="1">实操成绩</a-radio>
            <a-radio :value="2">道路成绩</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="考试分数">
          <a-input-number v-model="inputScoresForm.scores" :min="0" :max="100" :precision="0" placeholder="请输入分数" />
        </a-form-item>
      </a-form>
    </a-modal>
    <ExamRecordsAddModal ref="ExamRecordsAddModalRef" @save-success="search" />
    <ExamRecordsDetailDrawer ref="ExamRecordsDetailDrawerRef" :get-progress-color="getProgressColor"
      :get-progress-text="getProgressText" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import { getCascaderProjectPlan } from '@/apis/exam/examPlan'
import ExamRecordsAddModal from './ExamRecordsAddModal.vue'
import ExamRecordsDetailDrawer from './ExamRecordsDetailDrawer.vue'
import {
  type ExamRecordsQuery, type ExamRecordsResp, deleteExamRecords, exportExamRecords, listExamRecords, inputScores,
  generateQualificationCertificate as generateQualificationCertificateApi,
  downloadQualificationCertificate as downloadQualificationCertificateApi,
} from '@/apis/exam/examRecords'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamRecords' })

// 在script部分添加以下内容
const examPaperVisible = ref(false)
const formattedExamPaper = ref('')
const projectPlanList = ref<any[]>([])

const saveScoresLoading = ref(false)

const inputScoresForm = ref<any>({
  recordIds: [],
  scores: 0,
  scoresType: 1
})

const generateQualificationForm = ref<any>({
  recordIds: [],
  planType: 0,
})

const downloading = ref(false);

const generateing = ref(false);

const closeInputVisible = () => {
  batchInputVisible.value = false
  inputScoresForm.value = {
    recordIds: [],
    scores: 0,
    scoresType: 1
  }
}

// 下载资格证
const downloadQualificationCertificate = async (record: any) => {
  if (record.isCertificateGenerated !== 1) {
    Message.warning('该记录未生成资格证，无法下载');
    return;
  }
  try {
    downloading.value = true;
    const res = await downloadQualificationCertificateApi([record.id], 0);
    const blob = new Blob([res], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const filename = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_资格证.zip`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
  } finally {
    downloading.value = false;
  }
};

// 生成资格证
const generateQualificationCertificate = async (record: any) => {
  if (record.isCertificateGenerated !== 0) {
    Message.warning('该记录已生成资格证，无法再次生成');
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
  if (record.examScores < 70) return false;
  if (record.isOperation === 1 && record.operScores < 70) return false;
  if (record.isRoad === 1 && record.roadScores < 70) return false;
  return true;
};

// 单个录入成绩
const saveScores = async (record: ExamRecordsResp, scoresType: number) => {
  inputScoresForm.value.recordIds = [record.id]
  inputScoresForm.value.scoresType = scoresType
  inputScoresForm.value.scores = scoresType === 1 ? record.operScores : record.roadScores
  try {
    saveScoresLoading.value = true
    await inputScores(inputScoresForm.value)
    Message.success('已录入')
    search()
  } catch (error) {
  } finally {
    saveScoresLoading.value = false
  }
}

const onPlanChange = (val: any) => {
  selectedKeys.value = [];
  search();
};

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
// 初始化获取计划列表
onMounted(async () => {
  const res = await getCascaderProjectPlan(0);
  projectPlanList.value = res.data || [];
})

const queryForm = reactive<ExamRecordsQuery>({
  planId: '',
  candidateName: '',
  isCertificateGenerated: '',
  registrationProgress: undefined,
  username: '',
  sort: ['id,desc'],
  isOrgQuery: false
})

// 批量下载资格证按钮点击
const handleBatchDownload = async () => {
  if (selectedKeys.value.length === 0) {
    Message.warning('请先选择要下载资格证的记录')
    return
  }
  try {
    const selectedRecords = dataList.value.filter(item =>
      selectedKeys.value.includes(item.id)
    );
    // 检查是否选择了同一考试计划
    const planIds = new Set(selectedRecords.map(item => item.planId));
    if (planIds.size > 1) {
      Message.error('请选择同一考试计划的记录进行下载');
      return;
    }
    // 找出未生成证书的记录
    const noCertificateRecords = selectedRecords.filter(item => item.isCertificateGenerated == '0');

    if (noCertificateRecords.length > 0) {
      const names = noCertificateRecords.map(item => item.candidateName);
      Message.error(`${names.join('、')} 未生成证书，无法下载`);
      return;
    }
    downloading.value = true;
    const res = await downloadQualificationCertificateApi(selectedKeys.value, 0);
    const blob = new Blob([res], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const filename = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_资格证.zip`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    selectedKeys.value = [];
  } catch (error) {
  } finally {
    downloading.value = false;
  }
}
// 批量生成资格证按钮点击
const handleBatchGenerate = async () => {
  if (selectedKeys.value.length === 0) {
    Message.warning('请先选择要生成资格证的记录')
    return
  }
  try {
    const selectedRecords = dataList.value.filter(item =>
      selectedKeys.value.includes(item.id)
    );

    // 检查是否选择了同一考试计划
    const planIds = new Set(selectedRecords.map(item => item.planId));
    if (planIds.size > 1) {
      Message.error('请选择同一考试计划的记录进行录入');
      return;
    }
    // 找出已生成证书的记录
    const certificateRecords = selectedRecords.filter(item => item.isCertificateGenerated == '1');

    if (certificateRecords.length > 0) {
      const names = certificateRecords.map(item => item.candidateName);
      Message.error(`${names.join('、')} 已生成证书，无法再次生成`);
      return;
    }
    generateing.value = true;
    generateQualificationForm.value.recordIds = selectedKeys.value
    await generateQualificationCertificateApi(generateQualificationForm.value);
    Message.success(`已生成 ${selectedKeys.value.length} 条记录资格证`);
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


const batchInputVisible = ref(false)

// 批量录入按钮点击
const handleBatchInput = () => {
  if (selectedKeys.value.length === 0) {
    Message.warning('请先选择要录入成绩的记录')
    return
  }
  inputScoresForm.value.recordIds = selectedKeys.value
  inputScoresForm.value.scores = 0
  inputScoresForm.value.scoresType = 1
  batchInputVisible.value = true
}

// 批量录入成绩提交
const handleBatchInputSubmit = async () => {
  try {
    const selectedRecords = dataList.value.filter(item =>
      selectedKeys.value.includes(item.id)
    );

    // 检查是否选择了同一考试计划
    const planIds = new Set(selectedRecords.map(item => item.planId));
    if (planIds.size > 1) {
      Message.error('请选择同一考试计划的记录进行录入');
      return false;
    }
    // 找出已生成证书的记录
    const certificateRecords = selectedRecords.filter(item => item.isCertificateGenerated == '1');

    if (certificateRecords.length > 0) {
      const names = certificateRecords.map(item => item.candidateName);
      Message.error(`${names.join('、')} 已生成证书，无法再次录入成绩`);
      return false;
    }

    inputScoresForm.value.recordIds = selectedKeys.value;
    await inputScores(inputScoresForm.value);
    Message.success(`已录入 ${selectedKeys.value.length} 条记录成绩`);
    batchInputVisible.value = false;
    selectedKeys.value = [];
    search();
  } catch (error) {
  }
};


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
  { dataIndex: 'projectName', title: '考试项目' },
  { dataIndex: 'planName', title: '考试计划' },
  { dataIndex: 'candidateName', title: '考生姓名' },
  { dataIndex: 'username', title: '考生身份证号' },
  { dataIndex: 'className', title: '所属班级' },
  // { dataIndex: 'registrationProgress', title: '报名进度', slotName: 'registrationProgress', width: 120, align: 'center' },
  { dataIndex: 'examScores', title: '理论成绩', align: 'center', },
  { dataIndex: 'operScores', slotName: 'operScores', title: '实操成绩', align: 'center', width: 160 },
  { dataIndex: 'roadScores', slotName: 'roadScores', title: '道路成绩', align: 'center', width: 160 },
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
    show: has.hasPermOr(['exam:examRecords:detail', 'exam:examRecords:update', 'exam:examRecords:delete']),
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
    0: '不合格',
    1: '合格',
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
  queryForm.planId = ''
  queryForm.registrationProgress = undefined
  queryForm.candidateName = ''
  queryForm.isCertificateGenerated = ''
  queryForm.username = ''
  search()
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