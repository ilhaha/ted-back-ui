<template>
  <div class="gi_table_page">
    <GiTable
      title="题目管理"
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
      <template #toolbar-left>
        <a-input-search
          v-model="queryForm.question"
          placeholder="题目标题"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.categoryName"
          placeholder="八大类"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.projectName"
          placeholder="所属项目"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.knowledgeTypeName"
          placeholder="知识类型"
          allow-clear
          @search="search"
        />
        <a-button type="primary" class="ml-2" @click="search">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
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
      <template #toolbar-right>
        <a-button
          v-permission="['examconnect:questionBank:add']"
          type="primary"
          @click="onAdd"
        >
          <template #icon><icon-plus /></template>
          <template #default>新增题目</template>
        </a-button>
        <a-button @click="onImport">
          <template #icon><icon-upload /></template>
          <template #default>导入题目</template>
        </a-button>
         <a-button @click="onExportExcel">
          <template #icon><icon-download /></template>
          <template #default>导出题目Excel</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link
            v-permission="['examconnect:questionBank:detail']"
            title="题目信息"
            @click="onDetail(record)"
            >详情</a-link
          >
          <a-link
            v-permission="['examconnect:questionBank:update']"
            title="修改"
            @click="onUpdate(record)"
            >修改</a-link
          >
          <a-link
            v-permission="['examconnect:questionBank:delete']"
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

    <QuestionBankAddModal
      ref="QuestionBankAddModalRef"
      @save-success="search"
    />
    <QuestionBankDetailDrawer ref="QuestionBankDetailDrawerRef" />
    <QuestionBankImportModal ref="QuestionBankImportModalRef" />
    <exportQuestionsExcel ref="exportQuestionsExcelRef" />
  </div>
</template>

<script setup lang="ts">
import QuestionBankAddModal from "./QuestionBankAddModal.vue";
import QuestionBankDetailDrawer from "./QuestionBankDetailDrawer.vue";
import QuestionBankImportModal from "./QuestionBankImportModal.vue";
import exportQuestionsExcel from "./exportQuestionsExcel.vue";
import {
  type QuestionBankResp,
  type QuestionBankQuery,
  deleteQuestionBank,
  exportQuestionBank,
  listQuestionBank,
} from "@/apis/examconnect/questionBank";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "QuestionBank" });

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
  { title: "题目标题", dataIndex: "question", slotName: "question" },
  { title: "所属八大类", dataIndex: "categoryName", slotName: "categoryName" },
  { title: "所属考试项目", dataIndex: "projectName", slotName: "projectName" },
  {
    title: "知识类型",
    dataIndex: "knowledgeTypeName",
    slotName: "knowledgeTypeName",
  },
  { title: "题目类型", dataIndex: "questionType", slotName: "questionType" },
  { title: "题目附件", dataIndex: "attachment", slotName: "attachment" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "examconnect:questionBank:detail",
      "examconnect:questionBank:update",
      "examconnect:questionBank:delete",
    ]),
  },
]);

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

// 重置
const reset = () => {
  queryForm.categoryId = undefined;
  search();
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
  ref<InstanceType<typeof exportQuestionsExcel>>();
// 导入功能excel
const onExportExcel = () => {
  exportQuestionsExcelRef.value?.onOpen();
};

</script>

<style scoped lang="scss"></style>
