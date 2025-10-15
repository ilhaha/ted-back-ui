<template>
  <div class="gi_table_page">
    <GiTable
      title="八大类管理"
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
      <template #video="{ record }">
        <video
          v-if="record.videoUrl"
          :src="record.videoUrl"
          controls
          style="width: 120px; height: 80px"
        ></video>
        <span v-else>无视频</span>
      </template>
      <template #toolbar-left>
        <a-input-search
          v-model="queryForm.name"
          placeholder="请输入种类名称"
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
        <a-button
          v-permission="['exam:category:add']"
          type="primary"
          @click="onAdd"
        >
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['exam:category:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
<!--          <a-link
            v-permission="['exam:category:detail']"
            title="详情"
            @click="onDetail(record)"
            >详情</a-link
          >-->
          <a-link
            v-permission="['exam:category:update']"
            title="修改"
            @click="onUpdate(record)"
            >修改</a-link
          >
          <a-link
            v-permission="['exam:category:delete']"
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

    <CategoryAddModal ref="CategoryAddModalRef" @save-success="search" />
    <CategoryDetailDrawer ref="CategoryDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import CategoryAddModal from "./CategoryAddModal.vue";
import CategoryDetailDrawer from "./CategoryDetailDrawer.vue";
import {
  type CategoryResp,
  type CategoryQuery,
  deleteCategory,
  exportCategory,
  listCategory,
} from "@/apis/exam/category";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "Category" });

const queryForm = reactive<CategoryQuery>({
  name: undefined,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listCategory({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: "八大类名称", dataIndex: "name", slotName: "name" },
  { title: "代号", dataIndex: "code", slotName: "code" },
  { title: "题目数量", dataIndex: "topicNumber", slotName: "topicNumber" },
  {
    title: "警示短片",
    dataIndex: "videoUrl",
    slotName: "video",
  },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      // "exam:category:detail",
      "exam:category:update",
      "exam:category:delete",
    ]),
  },
]);

// 重置
const reset = () => {
  queryForm.name = undefined;
  search();
};

// 删除
const onDelete = (record: CategoryResp) => {
  return handleDelete(() => deleteCategory(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportCategory(queryForm));
};

const CategoryAddModalRef = ref<InstanceType<typeof CategoryAddModal>>();
// 新增
const onAdd = () => {
  CategoryAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: CategoryResp) => {
  CategoryAddModalRef.value?.onUpdate(record.id);
};

const CategoryDetailDrawerRef =
  ref<InstanceType<typeof CategoryDetailDrawer>>();
// 详情
const onDetail = (record: CategoryResp) => {
  CategoryDetailDrawerRef.value?.onOpen(record.id);
};
</script>

<style scoped lang="scss"></style>
