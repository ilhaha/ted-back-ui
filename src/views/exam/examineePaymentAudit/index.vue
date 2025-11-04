<template>
  <div class="gi_table_page">
    <GiTable
      title="考生缴费审核管理"
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
          v-model="queryForm.examPlanId"
          placeholder="请输入关联考试计划ID"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.examineeId"
          placeholder="请输入考生ID"
          allow-clear
          @search="search"
        />
        <a-select
          v-model="queryForm.auditStatus"
          :options="audit_status_enum"
          placeholder="请选择审核状态：0-待缴费 1-已缴费待审核，2-审核通过，3-审核驳回"
          allow-clear
          style="width: 150px"
          @change="search"
        />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button
          v-permission="['exam:examineePaymentAudit:add']"
          type="primary"
          @click="onAdd"
        >
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button
          v-permission="['exam:examineePaymentAudit:export']"
          @click="onExport"
        >
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link
            v-permission="['exam:examineePaymentAudit:detail']"
            title="详情"
            @click="onDetail(record)"
            >详情</a-link
          >
          <a-link
            v-permission="['exam:examineePaymentAudit:update']"
            title="修改"
            @click="onUpdate(record)"
            >修改</a-link
          >
          <a-link
            v-permission="['exam:examineePaymentAudit:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
      <template #auditStatus="{ record }">
        <template>
          <a-space size="large">
            <a-dropdown @select="handleSelect">
              <a-button>Click Me</a-button>
              <template #content>
                <a-doption>Option 1</a-doption>
                <a-doption disabled>Option 2</a-doption>
                <a-doption :value="{ value: 'Option3' }">Option 3</a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </template>
        <a-tag :color="getStatusColor(record.auditStatus)">{{
          getStatusText(record.auditStatus)
        }}</a-tag>
      </template>
    </GiTable>

    <ExamineePaymentAuditAddModal
      ref="ExamineePaymentAuditAddModalRef"
      @save-success="search"
    />
    <ExamineePaymentAuditDetailDrawer
      ref="ExamineePaymentAuditDetailDrawerRef"
    />
  </div>
</template>

<script setup lang="ts">
import ExamineePaymentAuditAddModal from "./ExamineePaymentAuditAddModal.vue";
import ExamineePaymentAuditDetailDrawer from "./ExamineePaymentAuditDetailDrawer.vue";
import {
  type ExamineePaymentAuditResp,
  type ExamineePaymentAuditQuery,
  deleteExamineePaymentAudit,
  exportExamineePaymentAudit,
  listExamineePaymentAudit,
} from "@/apis/exam/examineePaymentAudit";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "ExamineePaymentAudit" });

const queryForm = reactive<ExamineePaymentAuditQuery>({
  examPlanId: undefined,
  examineeId: undefined,
  auditStatus: undefined,
  sort: ["id,desc"],
});

const getStatusText = (auditStatus: number) => {
  switch (auditStatus) {
    case 0:
      return "待缴费";
    case 1:
      return "已缴费待审核";
    case 2:
      return "审核通过";
    case 3:
      return "审核驳回补正";
    default:
      return "";
  }
};
const getStatusColor = (auditStatus: number) => {
  switch (auditStatus) {
    case 0:
      return "red";
    case 1:
      return "orange";
    case 2:
      return "green";
    case 3:
      return "red";
    default:
      return "default";
  }
};
// const statusList = ref([
//   { label: "待缴费", value: 0 },
//   { label: "已缴费待审核", value: 1 },
//   { label: "审核通过", value: 2 },
//   { label: "审核驳回补正", value: 3 },
// ]);

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listExamineePaymentAudit({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: "考生名字", dataIndex: "examineeName", slotName: "examineeName" },
  { title: "考试计划名称", dataIndex: "planName", slotName: "planName" },
  {
    title: "应缴费金额（元）",
    dataIndex: "paymentAmount",
    slotName: "paymentAmount",
  },
  {
    title: "缴费通知单URL",
    dataIndex: "auditNoticeUrl",
    slotName: "auditNoticeUrl",
  },
  {
    title: "缴费凭证URL",
    dataIndex: "paymentProofUrl",
    slotName: "paymentProofUrl",
  },
  { title: "缴费时间", dataIndex: "paymentTime", slotName: "paymentTime" },
  {
    title: "审核状态",
    dataIndex: "auditStatus",
    slotName: "auditStatus",
  },
  { title: "备注", dataIndex: "rejectReason", slotName: "rejectReason" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "exam:examineePaymentAudit:detail",
      "exam:examineePaymentAudit:update",
      "exam:examineePaymentAudit:delete",
    ]),
  },
]);

// 重置
const reset = () => {
  queryForm.examPlanId = undefined;
  queryForm.examineeId = undefined;
  queryForm.auditStatus = undefined;
  search();
};

// 删除
const onDelete = (record: ExamineePaymentAuditResp) => {
  return handleDelete(() => deleteExamineePaymentAudit(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportExamineePaymentAudit(queryForm));
};

const ExamineePaymentAuditAddModalRef =
  ref<InstanceType<typeof ExamineePaymentAuditAddModal>>();
// 新增
const onAdd = () => {
  ExamineePaymentAuditAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: ExamineePaymentAuditResp) => {
  ExamineePaymentAuditAddModalRef.value?.onUpdate(record.id);
};

const ExamineePaymentAuditDetailDrawerRef =
  ref<InstanceType<typeof ExamineePaymentAuditDetailDrawer>>();
// 详情
const onDetail = (record: ExamineePaymentAuditResp) => {
  ExamineePaymentAuditDetailDrawerRef.value?.onOpen(record.id);
};
</script>

<style scoped lang="scss"></style>
