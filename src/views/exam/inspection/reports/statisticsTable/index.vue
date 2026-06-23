<template>
  <div class="gi_table_page">
    <GiTable
      title="检验统计表"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      :row-selection="rowSelection"
      @refresh="search"
      @select="select"
      @select-all="selectAll"
    >
      <template #toolbar-left>
        <a-select
          v-model="queryForm.categoryId"
          placeholder="所属类别"
          allow-clear
          class="search-input"
          :options="categorySelect"
          @change="search"
        />
        <a-select
          v-model="queryForm.isTypeTest"
          placeholder="通知类型"
          allow-clear
          class="search-input"
          @change="search"
        >
          <a-option value="0">定检监检</a-option>
          <a-option value="1">型式试验</a-option>
        </a-select>
        <a-input-search
          v-model="queryForm.title"
          placeholder="请输入通知内容"
          allow-clear
          @search="search"
        />
        <a-select
          v-model="queryForm.status"
          placeholder="通知状态"
          allow-clear
          class="search-input"
          @change="search"
        >
          <a-option value="1">报名中</a-option>
          <a-option value="3">补报中</a-option>
          <a-option value="4">报名已结束</a-option>
          <a-option value="5">考试中</a-option>
          <a-option value="6">已结束</a-option>
        </a-select>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button
          v-permission="['notice:statisticsTable:exportTrainingPaid']"
          type="primary"
          :disabled="selectedKeys.length === 0 || batchExportLoading"
          :loading="batchExportLoading"
          @click="onBatchExportPaidTraining"
        >
          批量导出交费表
        </a-button>
      </template>

      <template #isTypeTest="{ record }">
        <a-tag :color="getIsTypeTestColor(record.isTypeTest)" bordered>
          {{ getIsTypeTestText(record.isTypeTest) }}
        </a-tag>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)" bordered>
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link
            v-permission="['notice:statisticsTable:exportTrainingPaid']"
            title="导出交费表"
            :loading="exportLoadingId === record.id"
            :disabled="!!exportLoadingId || batchExportLoading"
            @click="onExportPaidTraining(record)"
          >
            导出交费表
          </a-link>
        </a-space>
      </template>
    </GiTable>
  </div>
</template>

<script setup lang="ts">
import {
  type ExamNoticeResp,
  type ExamNoticeQuery,
  exportPaidTrainingUsers,
  statisticsTablePage,
} from "@/apis/exam/examNotice";
import { selectOptions } from "@/apis/exam/category";
import { Message } from "@arco-design/web-vue";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "InspectionReportsStatisticsTable" });

const queryForm = reactive<ExamNoticeQuery>({
  title: undefined,
  applyDeadline: undefined,
  examLevel: undefined,
  isTypeTest: undefined,
  status: undefined,
  categoryId: undefined,
  categoryType: 4
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  selectedKeys,
  select,
  selectAll,
} = useTable((page) => statisticsTablePage({ ...queryForm, ...page }), {
  immediate: true,
});

const rowSelection = reactive({
  type: "checkbox",
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedKeys,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys;
  },
});

const columns = ref<TableInstanceColumns[]>([
  { title: "通知内容", dataIndex: "title", slotName: "title" },
  { title: "报名截止时间", dataIndex: "applyDeadline", slotName: "applyDeadline" },
  { title: "所属类别", dataIndex: "categoryName", slotName: "categoryName" },
  { title: "考试项目", dataIndex: "projectCodes", slotName: "projectCodes" },
  { title: "通知类型", dataIndex: "isTypeTest", slotName: "isTypeTest" },
  { title: "说明", dataIndex: "remark", slotName: "remark" },
  { title: "状态", dataIndex: "status", slotName: "status" },
  { title: "创建人", dataIndex: "createUserString", slotName: "createUser" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 220,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr(["notice:statisticsTable:exportTrainingPaid"]),
  },
]);

const exportLoadingId = ref<string | null>(null);
const batchExportLoading = ref(false);

const onExportPaidTraining = async (record: ExamNoticeResp) => {
  if (exportLoadingId.value || batchExportLoading.value) return;
  exportLoadingId.value = record.id;
  try {
    await useDownload(() => exportPaidTrainingUsers([record.id]));
  } finally {
    exportLoadingId.value = null;
  }
};

const onBatchExportPaidTraining = async () => {
  if (selectedKeys.value.length === 0) {
    Message.warning("请选择要导出的通知");
    return;
  }
  if (batchExportLoading.value || exportLoadingId.value) return;
  batchExportLoading.value = true;
  try {
    await useDownload(() => exportPaidTrainingUsers(selectedKeys.value));
  } finally {
    batchExportLoading.value = false;
  }
};

const reset = () => {
  queryForm.title = undefined;
  queryForm.applyDeadline = undefined;
  queryForm.isTypeTest = undefined;
  queryForm.status = undefined;
  queryForm.categoryId = undefined;
  queryForm.categoryType = 4;
  search();
};

const getIsTypeTestColor = (isTypeTest: number) => {
  switch (isTypeTest) {
    case 0:
      return "blue";
    case 1:
      return "orange";
    default:
      return "default";
  }
};

const getIsTypeTestText = (isTypeTest: number) => {
  switch (isTypeTest) {
    case 0:
      return "定检监检";
    case 1:
      return "型式试验";
    default:
      return "未知";
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue";
    case 1:
      return "green";
    case 2:
      return "red";
    case 3:
      return "blue";
    case 4:
      return "gray";
    case 5:
      return "orange";
    case 6:
      return "default";
    default:
      return "default";
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待审";
    case 1:
      return "报名中";
    case 2:
      return "已驳回";
    case 3:
      return "补报中";
    case 4:
      return "报名已结束";
    case 5:
      return "考试中";
    case 6:
      return "已结束";
    default:
      return "未知状态";
  }
};

const categorySelect = ref([]);
const initCategorySelect = async () => {
  const res = await selectOptions([4]);
  categorySelect.value = res.data || [];
};

onMounted(() => {
  initCategorySelect();
});
</script>

<style scoped lang="scss">
.search-input {
  margin-left: 8px;
}
</style>
