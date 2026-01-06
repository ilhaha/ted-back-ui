<template>
  <div class="gi_table_page">
    <GiTable title="人员复审信息表管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" :row-selection="rowSelection" @refresh="search" @select="select"
      @select-all="selectAll">
      <template #toolbar-left>
        <a-input-search v-model="queryForm.name" placeholder="请输入姓名" allow-clear @search="search" />
        <a-input-search v-model="queryForm.idCard" placeholder="请输入身份证号" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:personQualification:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button @click="onImport" v-permission="['exam:personQualification:import']">
          <template #icon><icon-upload /></template>
          <template #default>导入</template>
        </a-button>
        <a-button v-permission="['exam:personQualification:audit']" :disabled="!selectedKeys.length"
          :reviewLoading="reviewLoading" type="primary" @click="handleBatchReview">
          <template #icon><icon-check /></template>
          <template #default>批量审核</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <!-- 审核 -->
          <a-link v-if="record.auditStatus === 0" v-permission="['exam:personQualification:audit']" title="审核"
            @click="onAudit(record)" :reviewLoading="reviewLoading">
            审核
          </a-link>
          <a-link v-permission="['exam:personQualification:update']" title="修改" @click="onUpdate(record)"
            v-if="record.auditStatus === 0">修改</a-link>
          <a-link v-permission="['exam:personQualification:delete']" status="danger" :disabled="record.disabled"
            v-if="record.auditStatus === 0" :title="record.disabled ? '不可删除' : '删除'" @click="onDelete(record)">
            删除
          </a-link>
        </a-space>
      </template>
      <template #auditStatus="{ record }">
        <a-tag :color="getStatusColor(record.auditStatus)">{{
          getStatusText(record.auditStatus)
        }}</a-tag>
      </template>
    </GiTable>

    <PersonQualificationAddModal ref="PersonQualificationAddModalRef" @save-success="search" />
    <PersonQualificationDetailDrawer ref="PersonQualificationDetailDrawerRef" />
    <PersonQualificationImportModal ref="PersonQualificationImportModalRef" @import-success="search" />
    <!-- <PersonQualificationAuditModal ref="PersonQualificationAuditModalRef" @audit-success="search" /> -->
  </div>
</template>

<script setup lang="ts">
import PersonQualificationAddModal from "./PersonQualificationAddModal.vue";
import PersonQualificationDetailDrawer from "./PersonQualificationDetailDrawer.vue";
import PersonQualificationAuditModal from "./PersonQualificationAuditModal.vue";
import { auditPersonQualification, batchAuditPersonQualification } from "@/apis/exam/personQualification";
import { Modal, Message } from "@arco-design/web-vue";
import {
  type PersonQualificationResp,
  type PersonQualificationQuery,
  deletePersonQualification,
  exportPersonQualification,
  listPersonQualification,
} from "@/apis/exam/personQualification";
import PersonQualificationImportModal from "./PersonQualificationImportModal.vue";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "PersonQualification" });

const queryForm = reactive<PersonQualificationQuery>({
  name: undefined,
  idCard: undefined,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
  selectedKeys,
  select,
  selectAll
} = useTable((page) => listPersonQualification({ ...queryForm, ...page }), {
  immediate: true,
});
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedKeys,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  }
})

const columns = ref<TableInstanceColumns[]>([
  { title: "姓名", dataIndex: "name", slotName: "name" },
  { title: "身份证号", dataIndex: "idCard", slotName: "idCard" },
  { title: "文化程度", dataIndex: "education", slotName: "education" },
  { title: "联系电话", dataIndex: "phone", slotName: "phone" },
  { title: "聘用单位", dataIndex: "employer", slotName: "employer" },
  {
    title: "资格项目代码",
    dataIndex: "qualificationCategoryCode",
    slotName: "qualificationCategoryCode",
  },
  { title: "复审状态", dataIndex: "auditStatus", slotName: "auditStatus" },
  { title: "创建时间", dataIndex: "createTime", slotName: "createTime" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "exam:personQualification:update",
      "exam:personQualification:delete",
    ]),
  },
]);
const getStatusText = (auditStatus: number) => {
  switch (auditStatus) {
    case 0:
      return "待审核";
    case 1:
      return "审核通过";
    case 2:
      return "不通过";
    default:
      return "";
  }
};
const getStatusColor = (auditStatus: number) => {
  switch (auditStatus) {
    case 0:
      return "orange";
    case 1:
      return "green";
    case 2:
      return "red";
    default:
      return "default";
  }
};

const reviewLoading = ref(false);
// 批量审核
const handleBatchReview = async () => {
  if (selectedKeys.value.length === 0) {
    Message.warning("请先选择要审核的记录");
    return;
  }
  const alreadyReviewed = dataList.value
    .filter(item => selectedKeys.value.includes(item.id)) // 只看选中的记录
    .filter(item => item.auditStatus === 1); // 已审核通过的记录
    
  if (alreadyReviewed.length > 0) {
    const names = alreadyReviewed.map(item => item.name);
    Message.error(`${names.join('、')} 已完成审核，无法重复操作`);
    return false;
  }
  try {
    Modal.confirm({
      title: "确认审核",
      content: `确定是否通过所选人员的复审？`,
      okText: "确认",
      cancelText: "取消",
      async onOk() {
        reviewLoading.value = true;
        await batchAuditPersonQualification(selectedKeys.value);
        Message.success("已审核");
        search();
      },
    });
  } catch (error) {
  } finally {
    reviewLoading.value = false;
  }
};

// 重置
const reset = () => {
  queryForm.name = undefined;
  queryForm.idCard = undefined;
  search();
};

// 删除
const onDelete = (record: PersonQualificationResp) => {
  return handleDelete(() => deletePersonQualification(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

const PersonQualificationAddModalRef =
  ref<InstanceType<typeof PersonQualificationAddModal>>();
// 新增
const onAdd = () => {
  PersonQualificationAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: PersonQualificationResp) => {
  PersonQualificationAddModalRef.value?.onUpdate(record.id);
};


//导入
const PersonQualificationImportModalRef =
  ref<InstanceType<typeof PersonQualificationImportModal>>();

const onImport = () => {
  PersonQualificationImportModalRef.value?.onOpen();
};

//审核
const onAudit = async (record: PersonQualificationResp) => {
  Modal.confirm({
    title: '确认审核',
    content: `确定是否通过该人员的复审？`,
    okText: '确认',
    cancelText: '取消',
    async onOk() {
      try {
        reviewLoading.value = true;
        await auditPersonQualification({
          id: record.id,
          auditStatus: 1
        });
        Message.success('已审核');
        search();
      } finally {
        reviewLoading.value = false;
      }
    }
  });
};
</script>

<style scoped lang="scss"></style>
