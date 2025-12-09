<template>
  <div class="gi_table_page">
    <GiTable title="考场管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #examType="{ record }">
        <a-tag :color="getStatusColor(record.examType)" bordered>{{
          getStatusText(record.examType)
        }}</a-tag>
      </template>
      <template #classroomType="{ record }">
        <a-tag :color="getClassroomTypeColor(record.classroomType)" bordered>{{
          getClassroomTypeText(record.classroomType)
        }}</a-tag>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:classroom:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['exam:classroom:export']" @click="onExport"> -->
        <!-- <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>

      <template #action="{ record }">
        <a-space>
          <!--          <a-link
            v-permission="['exam:classroom:detail']"
            title="详情"
            @click="onDetail(record)"
            >详情</a-link
          >-->
          <a-link v-permission="['exam:classroom:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <!--          <a-link-->
          <!--            v-permission="['exam:classroom:delete']"-->
          <!--            status="danger"-->
          <!--            :disabled="record.disabled"-->
          <!--            :title="record.disabled ? '不可删除' : '删除'"-->
          <!--            @click="onDelete(record)"-->
          <!--          >-->
          <!--            删除-->
          <!--          </a-link>-->
        </a-space>
      </template>
    </GiTable>

    <ClassroomAddModal ref="ClassroomAddModalRef" @save-success="search" />
    <ClassroomDetailDrawer ref="ClassroomDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ClassroomAddModal from "./ClassroomAddModal.vue";
import ClassroomDetailDrawer from "./ClassroomDetailDrawer.vue";
import {
  type ClassroomResp,
  type ClassroomQuery,
  deleteClassroom,
  exportClassroom,
  listClassroom,
} from "@/apis/exam/classroom";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "Classroom" });

const queryForm = reactive<ClassroomQuery>({
  sort: ["tc.id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listClassroom({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  // { title: '主键id', dataIndex: 'id', slotName: 'id' },
  { title: "考场名称", dataIndex: "classroomName", slotName: "classroomName" },
  { title: "考试地点", dataIndex: "examLocation", slotName: "examLocation", },
  { title: "考试人员类型", dataIndex: "classroomType", slotName: "classroomType", },
  { title: "考试类型", dataIndex: "examType", slotName: "examType", },
  // { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  // { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  // { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  // { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  // { title: '逻辑删除', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: "最大容纳人数",
    dataIndex: "maxCandidates",
    slotName: "maxCandidates",
  },

  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      // "exam:classroom:detail",
      "exam:classroom:update",
      "exam:classroom:delete",
    ]),
  },
]);

// 重置
const reset = () => {
  search();
};

// 删除
const onDelete = (record: ClassroomResp) => {
  return handleDelete(() => deleteClassroom(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportClassroom(queryForm));
};

const ClassroomAddModalRef = ref<InstanceType<typeof ClassroomAddModal>>();
// 新增
const onAdd = () => {
  ClassroomAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: ClassroomResp) => {
  ClassroomAddModalRef.value?.onUpdate(record.classroomId);
};

const ClassroomDetailDrawerRef =
  ref<InstanceType<typeof ClassroomDetailDrawer>>();
// 详情
const onDetail = (record: ClassroomResp) => {
  ClassroomDetailDrawerRef.value?.onOpen(record.id);
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue"; // 理论考试
    case 1:
      return "orange"; // 实操考试
    default:
      return "default";
  }
};

const getClassroomTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return "orange";
    case 1:
      return "cyan";
    default:
      return "default";
  }
};

const getClassroomTypeText = (status: number) => {
  switch (status) {
    case 0:
      return "作业人员";
    case 1:
      return "检验人员";
    default:
      return "未知类型";
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "理论考试";
    case 1:
      return "实操考试";
    default:
      return "未知";
  }
};
</script>

<style scoped lang="scss"></style>
