<template>
  <div class="gi_table_page">
    <GiTable
      title="个人档案管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
	  
    >
      <template #examPaper="{ record }">
        <a-button @click="showFormattedExamPaper(record)">查看试卷</a-button>
      </template>
      <template #documentListAction="{ record }">
        <a-link @click="showDocumentPreview(record.documentList)"
          >查看资料</a-link
        >
      </template>
      <template #toolbar-left>
        <a-input-search
          v-model="queryForm.nickName"
          placeholder="请输入考生名称"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.planName"
          placeholder="请输入考试计划名称"
          allow-clear
          @search="search"
        />
        <!--        <a-select-->
        <!--          v-model="queryForm.planId"-->
        <!--          :options="plan_id_enum"-->
        <!--          placeholder="请选择计划ID"-->
        <!--          allow-clear-->
        <!--          style="width: 150px"-->
        <!--          @change="search"-->
        <!--        />-->
        <!--        <a-select-->
        <!--          v-model="queryForm.registrationProgress"-->
        <!--          :options="registration_progress_enum"-->
        <!--          placeholder="请选择报名进度;0:待考试;1:考试中;2:等待成绩;3:已完成;4:未上传指定资料;"-->
        <!--          allow-clear-->
        <!--          style="width: 150px"-->
        <!--          @change="search"-->
        <!--        />-->
        <a-button type="primary" class="ml-2" @click="search">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <!--        <a-button v-permission="['exam:examRecords:add']" type="primary" @click="onAdd"> -->
        <!--          <template #icon><icon-plus /></template> -->
        <!--          <template #default>新增</template> -->
        <!--        </a-button> -->
        <!--        <a-button v-permission="['exam:examRecords:export']" @click="onExport"> -->
        <!--          <template #icon><icon-download /></template> -->
        <!--          <template #default>导出</template> -->
        <!--        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link
            v-permission="['exam:examRecords:detail']"
            title="详情"
            @click="onDetail(record)"
            >详情</a-link
          >
          <a-link
            v-permission="['exam:examRecords:update']"
            title="修改"
            @click="onUpdate(record)"
            >修改</a-link
          >
          <a-link
            v-permission="['exam:examRecords:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
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
          :key="index"
          class="question-card"
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
                class="option-item"
                :class="[
                  {
                    'missed-answer':
                      opt.isCorrectAnswer &&
                      !(question.userAnswer || []).includes(opt.id) &&
                      !question.userAnswer,
                    'correct-answer':
                      opt.isCorrectAnswer && question.userAnswer,
                    'wrong-judge':
                      (question.userAnswer || []).includes(opt.id) &&
                      !opt.isCorrectAnswer,
                  },
                ]"
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
                class="option-item"
                :class="{
                  'correct-answer':
                    opt.isCorrectAnswer &&
                    (question.userAnswer || []).includes(opt.id),
                  'wrong-selected':
                    !opt.isCorrectAnswer &&
                    (question.userAnswer || []).includes(opt.id),
                  'missed-answer':
                    opt.isCorrectAnswer &&
                    !(question.userAnswer || []).includes(opt.id),
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
                  class="option-item"
                  :class="[
                    {
                      'missed-answer':
                        opt.isCorrectAnswer &&
                        !(question.userAnswer || []).includes(opt.id) &&
                        !question.userAnswer,
                      'correct-answer':
                        opt.isCorrectAnswer && question.userAnswer,
                      'wrong-judge':
                        (question.userAnswer || []).includes(opt.id) &&
                        !opt.isCorrectAnswer,
                    },
                  ]"
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

    <ExamRecordsAddModal ref="ExamRecordsAddModalRef" @save-success="search" />
    <ExamRecordsDetailDrawer ref="ExamRecordsDetailDrawerRef" />
    <DocumentPreviewModal ref="documentPreviewRef" />
  </div>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { ref } from "vue";
import { getPersonFilePage,listPersonFile, type personFileQuery } from "@/apis/file/personFile";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import DocumentPreviewModal from "@/components/DocumentPreviewModal.vue";

defineOptions({ name: "ExamRecords" });
const documentPreviewRef = ref<InstanceType<typeof DocumentPreviewModal>>();

// 获取题型标签
const getQuestionType = (type: number) => {
  return (
    {
      0: "单选题",
      1: "判断题",
      2: "多选题",
    }[type] || "未知题型"
  );
};

// 获取题型颜色
const getQuestionTypeColor = (type: number) => {
  return (
    {
      0: "arcoblue",
      1: "purple",
      2: "orange",
    }[type] || "gray"
  );
};

// 转换选项编号为字母
const getOptionChar = (index: number) => {
  return String.fromCharCode(65 + index);
};
const showDocumentPreview = (documents: any[]) => {
  if (!documents?.length) {
    Message.warning("暂无申请资料");
    return;
  }
  documentPreviewRef.value?.handleOpen(documents);
};

const queryForm = reactive<personFileQuery>({
  nickName: undefined,
  planName: undefined,
  registrationProgress: undefined,
  sort: ["tep.id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => getPersonFilePage({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: "计划名称", dataIndex: "examPlanName", slotName: "examPlanName" },
  { title: "考生名称", dataIndex: "nickname", slotName: "nickname" },
  { title: "考试得分", dataIndex: "examScores", slotName: "examScores" },
  {
    title: "申请资料",
    dataIndex: "documentList",
    slotName: "documentListAction",
  },
  { title: "查看试卷", dataIndex: "examPaper", slotName: "examPaper" },
]);

const examPaperVisible = ref(false);
const formattedExamPaper = ref("");
const formatExamPaper = (jsonStr: string) => {
  try {
    const rawData = JSON.parse(jsonStr);
    // 定义要排除的字段
    const excludeFields = [
      "knowledgeTypeId",
      "knowledgeTypeName",
      "knowledgeTypeTopicNumber",
      "attachment",
    ];

    // 递归过滤函数
    const filterFields = (data) => {
      if (Array.isArray(data)) {
        return data.map((item) => filterFields(item));
      } else if (data && typeof data === "object") {
        return Object.entries(data).reduce((acc, [key, value]) => {
          if (!excludeFields.includes(key)) {
            acc[key] = filterFields(value);
          }
          return acc;
        }, {});
      }
      return data;
    };

    return filterFields(rawData);
  } catch (e) {
    return { error: "无效的JSON格式" };
  }
};
// 显示格式化JSON弹窗
const showFormattedExamPaper = (record: ExamRecordsResp) => {
  formattedExamPaper.value = formatExamPaper(record.examPaper);
  examPaperVisible.value = true;
};
// 重置
const reset = () => {
  queryForm.nickName = undefined;
  queryForm.planName = undefined;
  queryForm.planId = undefined;
  queryForm.registrationProgress = undefined;
  search();
};

// 删除
const onDelete = (record: ExamRecordsResp) => {
  return handleDelete(() => deleteExamRecords(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportExamRecords(queryForm));
};

const ExamRecordsAddModalRef = ref<InstanceType<typeof ExamRecordsAddModal>>();
// 新增
const onAdd = () => {
  ExamRecordsAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: ExamRecordsResp) => {
  ExamRecordsAddModalRef.value?.onUpdate(record.id);
};

const ExamRecordsDetailDrawerRef =
  ref<InstanceType<typeof ExamRecordsDetailDrawer>>();
// 详情
const onDetail = (record: ExamRecordsResp) => {
  ExamRecordsDetailDrawerRef.value?.onOpen(record.id);
};
</script>

<style scoped lang="scss">
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
      border: 1px solid #ddd; /* 默认边框 */
      padding: 10px;
      margin: 5px 0;
      border-radius: 4px; /* 圆角 */
      cursor: pointer;
      transition: all 0.3s ease; /* 过渡动画 */

      /* 悬停效果 */
      .option-item:hover {
        border-color: #409eff; /* Element UI蓝色 */
        background: #f5f7fa;
      }

      &.correct-answer {
        background: rgba(76, 175, 80, 0.1);
        border: 1px solid #4caf50;
      }

      /* 错选状态 */
      &.wrong-selected {
        background: rgba(76, 175, 80, 0.1);
        border: 2px dashed #f44336;
      }

      /* 漏选状态 */
      &.missed-answer {
        background: rgba(76, 175, 80, 0.1);
        border: 2px dotted #ffc107;
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
        color: #4caf50;
        border-color: #4caf50; // 绿色边框[3,6](@ref)
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
      background: #4caf50;
    }
    &.wrong {
      background: #f44336;
    }
    &.missed {
      background: #ffc107;
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
