<template>
  <div class="gi_table_page">
    <GiTable
      title="考生资料关系管理"
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
	    <a-input-search v-model="queryForm.examineeId" placeholder="请输入考生ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.documentId" placeholder="请输入资料ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createUser" placeholder="请输入创建人ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['document:examineeDocument:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['document:examineeDocument:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['document:examineeDocument:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['document:examineeDocument:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['document:examineeDocument:delete']"
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

    <ExamineeDocumentAddModal ref="ExamineeDocumentAddModalRef" @save-success="search" />
    <ExamineeDocumentDetailDrawer ref="ExamineeDocumentDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamineeDocumentAddModal from './ExamineeDocumentAddModal.vue'
import ExamineeDocumentDetailDrawer from './ExamineeDocumentDetailDrawer.vue'
import { type ExamineeDocumentResp, type ExamineeDocumentQuery, deleteExamineeDocument, exportExamineeDocument, listExamineeDocument } from '@/apis/document/examineeDocument'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamineeDocument' })


const queryForm = reactive<ExamineeDocumentQuery>({
  examineeId: undefined,
  documentId: undefined,
  createUser: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamineeDocument({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '关联ID', dataIndex: 'id', slotName: 'id' },
  { title: '考生ID', dataIndex: 'examineeId', slotName: 'examineeId' },
  { title: '资料ID', dataIndex: 'documentId', slotName: 'documentId' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人ID', dataIndex: 'updatedUser', slotName: 'updatedUser' },
  { title: '创建时间', dataIndex: 'createdTime', slotName: 'createdTime' },
  { title: '更新时间', dataIndex: 'updatedTime', slotName: 'updatedTime' },
  { title: '删除标记(0未删,1已删)', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['document:examineeDocument:detail', 'document:examineeDocument:update', 'document:examineeDocument:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.examineeId = undefined
  queryForm.documentId = undefined
  queryForm.createUser = undefined
  search()
}

// 删除
const onDelete = (record: ExamineeDocumentResp) => {
  return handleDelete(() => deleteExamineeDocument(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamineeDocument(queryForm))
}

const ExamineeDocumentAddModalRef = ref<InstanceType<typeof ExamineeDocumentAddModal>>()
// 新增
const onAdd = () => {
  ExamineeDocumentAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamineeDocumentResp) => {
  ExamineeDocumentAddModalRef.value?.onUpdate(record.id)
}

const ExamineeDocumentDetailDrawerRef = ref<InstanceType<typeof ExamineeDocumentDetailDrawer>>()
// 详情
const onDetail = (record: ExamineeDocumentResp) => {
  ExamineeDocumentDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
