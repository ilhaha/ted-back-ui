<template>
  <div class="gi_table_page">
    <GiTable
      title="知识类型占比管理"
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
          v-model="queryForm.projectName"
          placeholder="项目名称"
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
          v-permission="['examconnect:knowledgeType:add']"
          type="primary"
          @click="onAdd"
        >
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['examconnect:knowledgeType:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <!--          <a-link v-permission="['examconnect:knowledgeType:detail']" title="详情" @click="onDetail(record)">详情</a-link>-->
          <a-link
            v-permission="['examconnect:knowledgeType:update']"
            title="修改"
            @click="onUpdate(record)"
            >修改</a-link
          >
          <a-link
            v-permission="['examconnect:knowledgeType:delete']"
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

    <KnowledgeTypeAddModal
      ref="KnowledgeTypeAddModalRef"
      @save-success="search"
    />
    <KnowledgeTypeDetailDrawer
      ref="KnowledgeTypeDetailDrawerRef"
      :project-name="currentRecord?.projectName"
    />
  </div>
</template>

<script setup lang="ts">
import KnowledgeTypeAddModal from "./KnowledgeTypeAddModal.vue";
import KnowledgeTypeDetailDrawer from "./KnowledgeTypeDetailDrawer.vue";
import {
  type KnowledgeTypeResp,
  type KnowledgeTypeQuery,
  deleteKnowledgeType,
  exportKnowledgeType,
  listKnowledgeType,
} from "@/apis/examconnect/knowledgeType";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "KnowledgeType" });

const queryForm = reactive<KnowledgeTypeQuery>({
  projectName: undefined,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listKnowledgeType({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: "知识类型名称", dataIndex: "name", slotName: "name" },
  { title: "所属考核项目种类", dataIndex: "categoryName", slotName: "categoryName" },
  { title: "项目名称", dataIndex: "projectName", slotName: "projectName" },
  { title: "占比（百分比）", dataIndex: "proportion", slotName: "proportion" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "examconnect:knowledgeType:detail",
      "examconnect:knowledgeType:update",
      "examconnect:knowledgeType:delete",
    ]),
  },
]);

// 重置
const reset = () => {
  queryForm.projectName = undefined;
  queryForm.projectId = undefined;
  search();
};

// 删除
const onDelete = (record: KnowledgeTypeResp) => {
  return handleDelete(() => deleteKnowledgeType(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportKnowledgeType(queryForm));
};

const KnowledgeTypeAddModalRef =
  ref<InstanceType<typeof KnowledgeTypeAddModal>>();
// 新增
const onAdd = () => {
  KnowledgeTypeAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: KnowledgeTypeResp) => {
  KnowledgeTypeAddModalRef.value?.onUpdate(record.id);
};

const KnowledgeTypeDetailDrawerRef =
  ref<InstanceType<typeof KnowledgeTypeDetailDrawer>>();
const currentRecord = ref<KnowledgeTypeResp>();
// 详情
const onDetail = (record: KnowledgeTypeResp) => {
  currentRecord.value = record;
  KnowledgeTypeDetailDrawerRef.value?.onOpen(record.id);
};
</script>

<style scoped lang="scss"></style>
