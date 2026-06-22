<template>
  <div class="gi_table_page">
    <GiTable
      title="检验、检测通知总览管理"
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
        <a-select
          v-model="queryForm.categoryId"
          placeholder="所属类别"
          allow-clear
          class="search-input ml-2"
          @change="search"
          style="margin-left: 8px"
          :options="categorySelect"
        >
        </a-select>
        <a-select
          v-model="queryForm.isTypeTest"
          placeholder="通知类型"
          allow-clear
          class="search-input ml-2"
          @change="search"
          style="margin-left: 8px"
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
          class="search-input ml-2"
          @change="search"
          style="margin-left: 8px"
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
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)" bordered>
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template #isTypeTest="{ record }">
        <a-tag :color="getIsTypeTestColor(record.isTypeTest)" bordered>
          {{ getIsTypeTestText(record.isTypeTest) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link
            v-permission="['notice:overview:statistics']"
            title="统计"
            @click="onStatistics(record)"
            >统计</a-link
          >
          <a-link
            v-permission="['notice:overview:registrationStatus']"
            title="报名情况"
            @click="onRegistrationStatus(record)"
            >报名情况</a-link
          >
        </a-space>
      </template>
    </GiTable>
    <OverviewStatisticsModal ref="OverviewStatisticsModalRef" />
    <OverviewRegistrationModal ref="OverviewRegistrationModalRef" />
  </div>
</template>

<script setup lang="ts">
import {
  type ExamNoticeResp,
  type ExamNoticeQuery,
  overviewPage,
} from "@/apis/exam/examNotice";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import { selectOptions } from "@/apis/exam/category";
import OverviewStatisticsModal from "./OverviewStatisticsModal.vue";
import OverviewRegistrationModal from "./OverviewRegistrationModal.vue";

defineOptions({ name: "InspectionOverview" });

const OverviewStatisticsModalRef =
  ref<InstanceType<typeof OverviewStatisticsModal>>();
const OverviewRegistrationModalRef =
  ref<InstanceType<typeof OverviewRegistrationModal>>();

// 统计
const onStatistics = (record: ExamNoticeResp) => {
  OverviewStatisticsModalRef.value?.onOpen(record.id);
};

// 报名情况
const onRegistrationStatus = (record: ExamNoticeResp) => {
  OverviewRegistrationModalRef.value?.onOpen(record.id);
};

const queryForm = reactive<ExamNoticeQuery>({
  title: undefined,
  applyDeadline: undefined,
  isTypeTest: undefined,
  status: undefined,
  categoryId: 42,
  categoryType: 4,
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable((page) => overviewPage({ ...queryForm, ...page }), {
  immediate: true,
});

const columns = ref<TableInstanceColumns[]>([
  // { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: "通知内容", dataIndex: "title", slotName: "title" },
  {
    title: "报名截止时间",
    dataIndex: "applyDeadline",
    slotName: "applyDeadline",
  },
  { title: "所属类别", dataIndex: "categoryName", slotName: "categoryName" },
  { title: "考试项目", dataIndex: "projectCodes", slotName: "projectCodes" },
  {
    title: "通知类型",
    dataIndex: "isTypeTest",
    slotName: "isTypeTest",
  },
  { title: "说明", dataIndex: "remark", slotName: "remark" },
  { title: "状态", dataIndex: "status", slotName: "status" },
  { title: "创建人", dataIndex: "createUserString", slotName: "createUser" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "notice:overview:statistics",
      "notice:overview:registrationStatus",
    ]),
  },
]);

// 重置
const reset = () => {
  queryForm.title = undefined;
  queryForm.applyDeadline = undefined;
  queryForm.isTypeTest = undefined;
  queryForm.status = undefined;
  queryForm.categoryId = 42;
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
      return "blue"; // 待审核
    case 1:
      return "green"; // 报名中
    case 2:
      return "red"; // 审核未通过
    case 3:
      return "blue"; // 补报中
    case 4:
      return "gray"; // 报名结束
    case 5:
      return "orange"; // 已开考
    case 6:
      return "default"; // 已结束
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
const initProjectSelect = async () => {
  const res = await selectOptions([4]);
  categorySelect.value = res.data || [];
};

onMounted(async () => {
  initProjectSelect();
});
</script>

<style scoped lang="scss"></style>
