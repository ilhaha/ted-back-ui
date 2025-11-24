<template>
  <div class="gi_table_page">
    <GiTable
      title="考生报名表管理"
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
        <!--        <a-button v-permission="['exam:enroll:add']" type="primary" @click="onAdd">-->
        <!--          <template #icon><icon-plus /></template>-->
        <!--          <template #default>新增</template>-->
        <!--        </a-button>-->
        <!-- <a-button v-permission="['exam:enroll:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link
            v-permission="['exam:enroll:delete']"
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

    <EnrollAddModal ref="EnrollAddModalRef" @save-success="search" />
    <EnrollDetailDrawer ref="EnrollDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import EnrollAddModal from "./EnrollAddModal.vue";
import EnrollDetailDrawer from "./EnrollDetailDrawer.vue";
import {
  type EnrollResp,
  type EnrollQuery,
  deleteEnroll,
  exportEnroll,
  listEnroll,
} from "@/apis/exam/enroll";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "Enroll" });

const queryForm = reactive<EnrollQuery>({
  nickName: undefined,
  planName: undefined,
  enrollStatus: undefined,
  sort: ["te.id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listEnroll({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  // { title: '考生计划关联表id', dataIndex: 'id', slotName: 'id' },
  { title: "考生", dataIndex: "nickName", slotName: "userId" },
  { title: "考试计划", dataIndex: "examPlanName", slotName: "examPlanId" },
  // { title: '考试状态（0：未报名，1：已报名：2：已完成，3：已过期）', dataIndex: 'enrollStatus', slotName: 'enrollStatus' },
  // { title: '创建时间戳', dataIndex: 'createTime', slotName: 'createTime' },
  // { title: '更新时间戳', dataIndex: 'updateTime', slotName: 'updateTime' },
  // { title: '删除标记', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  // { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  // { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  // { title: '准考证号', dataIndex: 'examNumber', slotName: 'examNumber' },
  { title: "考场", dataIndex: "classroomName", slotName: "classroomId" },
  { title: "座位号", dataIndex: "seatId", slotName: "seatId" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "exam:enroll:delete",
    ]),
  },
]);

// 重置
const reset = () => {
    queryForm.enrollStatus = undefined;
    queryForm.nickName = undefined;
    queryForm.planName = undefined;
  search();
};

// 删除
const onDelete = (record: EnrollResp) => {
  return handleDelete(() => deleteEnroll(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportEnroll(queryForm));
};

const EnrollAddModalRef = ref<InstanceType<typeof EnrollAddModal>>();
// 新增
const onAdd = () => {
  EnrollAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: EnrollResp) => {
  EnrollAddModalRef.value?.onUpdate(record.id);
};

const EnrollDetailDrawerRef = ref<InstanceType<typeof EnrollDetailDrawer>>();
// 详情
const onDetail = (record: EnrollResp) => {
  EnrollDetailDrawerRef.value?.onOpen(record.id);
};
</script>

<style scoped lang="scss"></style>
