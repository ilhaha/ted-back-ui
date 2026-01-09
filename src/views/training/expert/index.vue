<template>
  <div class="gi_table_page">
    <GiTable
      title="专家信息管理"
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
      <template #previewImage="{ record }">
        <a-image
          v-if="record.avatar"
          width="80"
          height="60"
          :src="record.avatar"
          :preview-props="{ zoomRate: 1.5 }"
          class="preview-image"
          fit="cover"
          
        />
        <span v-else>-</span>
      </template>
      <template #toolbar-left>
        <a-input-search
          v-model="queryForm.name"
          placeholder="请输入专家名字"
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
      <!-- <template #toolbar-right>
        <a-button v-permission="['training:expert:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template> -->
      <template #action="{ record }">
        <a-space>
<!--          <a-link
            v-permission="['training:expert:detail']"
            title="详情"
            @click="onDetail(record)"
            >详情</a-link
          >-->
          <a-link
            v-permission="['training:expert:update']"
            title="修改"
            @click="onUpdate(record)"
            >修改</a-link
          >
          <a-link
            v-permission="['training:expert:delete']"
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

    <ExpertAddModal ref="ExpertAddModalRef" @save-success="search" />
    <ExpertDetailDrawer ref="ExpertDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExpertAddModal from "./ExpertAddModal.vue";
import ExpertDetailDrawer from "./ExpertDetailDrawer.vue";
import {
  type ExpertResp,
  type ExpertQuery,
  deleteExpert,
  exportExpert,
  listExpert,
} from "@/apis/training/expert";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "Expert" });

const queryForm = reactive<ExpertQuery>({
  name: undefined,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listExpert({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: '所属机构', dataIndex: 'organization', slotName: 'organization' },
  { title: '专家名字', dataIndex: 'name', slotName: 'name' },
  { title: '学历', dataIndex: 'education', slotName: 'education' },
  { title: '专家称号', dataIndex: 'title', slotName: 'title' },
  { title: '头像', dataIndex: 'avatar', slotName: 'previewImage' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:expert:update', 'training:expert:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.name = undefined
  search()
}

// 删除
const onDelete = (record: ExpertResp) => {
  return handleDelete(() => deleteExpert(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportExpert(queryForm))
}

const ExpertAddModalRef = ref<InstanceType<typeof ExpertAddModal>>()
// 新增
const onAdd = () => {
  ExpertAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExpertResp) => {
  ExpertAddModalRef.value?.onUpdate(record.id)
}

const ExpertDetailDrawerRef = ref<InstanceType<typeof ExpertDetailDrawer>>()
// 详情
const onDetail = (record: ExpertResp) => {
  ExpertDetailDrawerRef.value?.onOpen(record.id)
}


</script>

<style scoped lang="scss"></style>
