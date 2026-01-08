<template>
  <div class="gi_table_page">
    <GiTable title="资料类型管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-input-search v-model="queryForm.typeName" placeholder="请输入资料类型名称" allow-clear @search="search" />
        <a-button type="primary" class="ml-2" @click="search">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #needUploadPerson="{ record }">
        <a-tag :color="getNeedUploadPersonColor(record.needUploadPerson)" bordered>{{
          getNeedUploadPersonText(record.needUploadPerson)
        }}</a-tag>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['document:documentType:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['document:documentType:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['document:documentType:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link v-permission="['document:documentType:delete']" status="danger" :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'" @click="onDelete(record)">
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <DocumentTypeAddModal ref="DocumentTypeAddModalRef" @save-success="search" />
    <DocumentTypeDetailDrawer ref="DocumentTypeDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import DocumentTypeAddModal from './DocumentTypeAddModal.vue'
import DocumentTypeDetailDrawer from './DocumentTypeDetailDrawer.vue'
import { type DocumentTypeResp, type DocumentTypeQuery, deleteDocumentType, exportDocumentType, listDocumentType } from '@/apis/document/documentType'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'DocumentType' })


const queryForm = reactive<DocumentTypeQuery>({
  typeName: undefined,
  createUser: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listDocumentType({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '类型名称', dataIndex: 'typeName', slotName: 'typeName' },
  { title: '资料上传适用人员', dataIndex: 'needUploadPerson', slotName: 'needUploadPerson' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['document:documentType:update', 'document:documentType:delete', 'document:documentType:detail']),
  }
]);

// 重置
const reset = () => {
  queryForm.typeName = undefined
  queryForm.createUser = undefined
  search()
}

// 删除
const onDelete = (record: DocumentTypeResp) => {
  return handleDelete(() => deleteDocumentType(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportDocumentType(queryForm))
}

const DocumentTypeAddModalRef = ref<InstanceType<typeof DocumentTypeAddModal>>()
// 新增
const onAdd = () => {
  DocumentTypeAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: DocumentTypeResp) => {
  DocumentTypeAddModalRef.value?.onUpdate(record.id)
}

const DocumentTypeDetailDrawerRef = ref<InstanceType<typeof DocumentTypeDetailDrawer>>()
// 详情
const onDetail = (record: DocumentTypeResp) => {
  DocumentTypeDetailDrawerRef.value?.onOpen(record.id)
}

const getNeedUploadPersonText = (status: number) => {
  switch (status) {
    case 0:
      return "京籍与非京籍均需上传";
    case 1:
      return "仅京籍人员需上传";
    case 2:
      return "仅非京籍人员需上传";
    default:
      return "未知人员";
  }
};

const getNeedUploadPersonColor = (status: number) => {
  switch (status) {
    case 0:
      return "red";
    case 1:
      return "blue";
    case 2:
      return "orange";
    default:
      return "default";
  }
};
</script>

<style scoped lang="scss"></style>
