<template>
  <div class="gi_table_page">
    <GiTable title="题目管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-input-search v-model="queryForm.question" placeholder="问题" allow-clear @search="search" />
        <a-input-search v-model="queryForm.categoryName" placeholder="八大类" allow-clear @search="search" />
        <a-input-search v-model="queryForm.projectName" placeholder="所属项目" allow-clear @search="search" />
        <a-input-search v-model="queryForm.knowledgeTypeName" placeholder="知识类型" allow-clear @search="search" />
        <!-- <a-button type="primary" class="ml-2" @click="search">
          <template #icon><icon-search /></template>
搜索
</a-button> -->
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #questionType="{ record }">
        <a-tag :color="getTypeColor(record.questionType)">{{
          getQuestionType(record.questionType)
        }}</a-tag>
      </template>
      <template #attachment="{ record }">
        <a-tag :color="getStatusColor(record.attachment)">{{
          getAttachment(record.attachment)
        }}</a-tag>
      </template>
      <template #examType="{ record }">
        <a-tag :color="getExamTypeColor(record.examType)" bordered>{{
          getExamTypeText(record.examType)
        }}</a-tag>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['examconnect:questionBank:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button @click="onImport" v-permission="['examconnect:questionBank:import']">
          <template #icon><icon-upload /></template>
          <template #default>导入</template>
        </a-button>
        <a-button @click="openBatchDelete" v-permission="['examconnect:questionBank:delete']" status="danger">
          <template #icon><icon-delete /></template>
          <template #default>批量删除</template>
        </a-button>
        <!-- <a-button @click="onExportExcel">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['examconnect:questionBank:detail']" title="题目信息" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['examconnect:questionBank:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link v-permission="['examconnect:questionBank:delete']" status="danger" :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'" @click="onDelete(record)">
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <QuestionBankAddModal ref="QuestionBankAddModalRef" @save-success="search" />
    <QuestionBankDetailDrawer ref="QuestionBankDetailDrawerRef" />
    <QuestionBankImportModal ref="QuestionBankImportModalRef" @import-success="search" />
    <ExportQuestionsExcel ref="ExportQuestionsExcelRef" />

    <a-modal v-model:visible="batchDeleteVisible" title="项目题目批量删除" :mask-closable="false" :esc-to-close="false"
      :width="width >= 600 ? 600 : '100%'" draggable @before-ok="batchDelete" @close="search">
      <GiForm ref="formRef" v-model="batchDeleteForm" :columns="batchDeleteColumns" />
      <template #footer>
        <a-button type="primary" @click="batchDelete" :loading="batchDeleteLoading">确认删除</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import QuestionBankAddModal from "./QuestionBankAddModal.vue";
import QuestionBankDetailDrawer from "./QuestionBankDetailDrawer.vue";
import QuestionBankImportModal from "./QuestionBankImportModal.vue";
import ExportQuestionsExcel from "./ExportQuestionsExcel.vue";
import { useExamPlanProject, useResetReactive } from "@/hooks";
import { useWindowSize } from "@vueuse/core";
import { Message } from '@arco-design/web-vue'

import {
  type QuestionBankResp,
  type QuestionBankQuery,
  deleteQuestionBank,
  exportQuestionBank,
  listQuestionBank,
  batchDeleteQuestionBank
} from "@/apis/examconnect/questionBank";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import { type ColumnItem, GiForm } from "@/components/GiForm";

const { examProjectOptions, getExamProjectOptions } = useExamPlanProject();


defineOptions({ name: "QuestionBank" });

const { width } = useWindowSize();

const batchDeleteVisible = ref(false);

const [batchDeleteForm] = useResetReactive({
  examProjectId: [],
});

const formRef = ref<InstanceType<typeof GiForm>>();
const batchDeleteLoading = ref(false);

const queryForm = reactive<QuestionBankQuery>({
  categoryName: undefined,
  knowledgeTypeName: undefined,
  projectName: undefined,
  question: undefined,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listQuestionBank({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: "问题", dataIndex: "question", slotName: "question" },
  { title: "所属八大类", dataIndex: "categoryName", slotName: "categoryName" },
  { title: "所属考试项目", dataIndex: "projectName", slotName: "projectName" },
  {
    title: "知识类型",
    dataIndex: "knowledgeTypeName",
    slotName: "knowledgeTypeName",
  },
  { title: "题型", dataIndex: "questionType", slotName: "questionType" },
  { title: "考试人员类型", dataIndex: "examType", slotName: "examType" },
  { title: "题目附件", dataIndex: "attachment", slotName: "attachment" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "examconnect:questionBank:update",
      "examconnect:questionBank:delete",
      "examconnect:questionBank:detail"
    ]),
  },
]);


const batchDeleteColumns: ColumnItem[] = reactive([
  {
    label: "考试项目",
    field: "examProjectId",
    type: "cascader",
    required: true,
    span: 24,
    rules: [
      { required: true, message: "请选择考试项目", trigger: "change" }
    ],
    props: computed(() => ({
      options: examProjectOptions.value,
      allowSearch: true,
      multiple: true,
    })),
  },
]);

const batchDelete = async () => {
  // 表单实例校验
  const isInvalid = await formRef.value?.formRef?.validate()
  if (isInvalid) return false
  batchDeleteLoading.value = true;
  try {
    await batchDeleteQuestionBank(batchDeleteForm.examProjectId);
    Message.success("已删除");
    batchDeleteVisible.value = false;
  } finally {
    batchDeleteLoading.value = false;
  }
};

const getAttachment = (str: string) => {
  if (str) return "有附件";
  return "无附件";
};

const getQuestionType = (str: string | number) => {
  const key = String(str);
  switch (key) {
    case "0":
      return "单选题";
    case "1":
      return "判断题";
    case "2":
      return "多选题";
    case "3":
      return "简答题";
    default:
      return "未知题型";
  }
};

// 打开批量删除窗口
const openBatchDelete = async () => {
  batchDeleteVisible.value = true;
  batchDeleteForm.examProjectId = [];
  await getExamProjectOptions(2);
};

// 重置
const reset = () => {
  queryForm.categoryName = undefined
  queryForm.knowledgeTypeName = undefined
  queryForm.knowledgeTypeName = undefined
  queryForm.question = undefined
  search()
};

// 删除
const onDelete = (record: QuestionBankResp) => {
  return handleDelete(() => deleteQuestionBank(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

const getStatusColor = (str: string) => {
  if (str) return "green";
  return "red";
};


const getExamTypeColor = (status: number) => {
  switch (status) {
    case 1:
      return "blue"; // 作业人员
    case 2:
      return "orange"; // 检验人员
    default:
      return "default";
  }
};

const getExamTypeText = (status: number) => {
  switch (status) {
    case 1:
      return "作业人员";
    case 2:
      return "检验人员";
    default:
      return "未知状态";
  }
};

const getTypeColor = (str: string | number) => {
  const key = String(str);
  switch (key) {
    case "0":
      return "blue"; // 单选题
    case "1":
      return "orange"; // 判断题
    case "2":
      return "gold"; // 多选题
    case "3":
      return "purple"; // 简答题
    default:
      return "gray"; // 未知
  }
};

// 导出
const onExport = () => {
  useDownload(() => exportQuestionBank(queryForm));
};

const QuestionBankAddModalRef =
  ref<InstanceType<typeof QuestionBankAddModal>>();
// 新增
const onAdd = () => {
  QuestionBankAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: QuestionBankResp) => {
  QuestionBankAddModalRef.value?.onUpdate(record.id);
};

const QuestionBankDetailDrawerRef =
  ref<InstanceType<typeof QuestionBankDetailDrawer>>();
// 详情
const onDetail = (record: QuestionBankResp) => {
  QuestionBankDetailDrawerRef.value?.onOpen(record.id);
};

const QuestionBankImportModalRef =
  ref<InstanceType<typeof QuestionBankImportModal>>();
// 导入功能
const onImport = () => {
  QuestionBankImportModalRef.value?.onOpen();
};

const exportQuestionsExcelRef =
  ref<InstanceType<typeof ExportQuestionsExcel>>();
// 导入功能excel
const onExportExcel = () => {
  exportQuestionsExcelRef.value?.onOpen();
};

</script>

<style scoped lang="scss"></style>
