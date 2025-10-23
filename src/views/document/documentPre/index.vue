<template>
  <div class="gi_table_page">
    <GiTable
      title="机构报考-考生上传资料管理"
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
	    <a-input-search v-model="queryForm.enrollPreUploadId" placeholder="请输入机构报考-考生扫码上传文件表id" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.docPath" placeholder="请输入存储路径" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.typeId" placeholder="请输入关联资料类型ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['document:documentPre:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['document:documentPre:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['document:documentPre:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['document:documentPre:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['document:documentPre:delete']"
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

    <DocumentPreAddModal ref="DocumentPreAddModalRef" @save-success="search" />
    <DocumentPreDetailDrawer ref="DocumentPreDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import DocumentPreAddModal from './DocumentPreAddModal.vue'
import DocumentPreDetailDrawer from './DocumentPreDetailDrawer.vue'
import { type DocumentPreResp, type DocumentPreQuery, deleteDocumentPre, exportDocumentPre, listDocumentPre } from '@/apis/document/documentPre'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'DocumentPre' })


const queryForm = reactive<DocumentPreQuery>({
  enrollPreUploadId: undefined,
  docPath: undefined,
  typeId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listDocumentPre({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '资料ID', dataIndex: 'id', slotName: 'id' },
  { title: '机构报考-考生扫码上传文件表id', dataIndex: 'enrollPreUploadId', slotName: 'enrollPreUploadId' },
  { title: '存储路径', dataIndex: 'docPath', slotName: 'docPath' },
  { title: '关联资料类型ID', dataIndex: 'typeId', slotName: 'typeId' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '删除标记(0未删,1已删)', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['document:documentPre:detail', 'document:documentPre:update', 'document:documentPre:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.enrollPreUploadId = undefined
  queryForm.docPath = undefined
  queryForm.typeId = undefined
  search()
}

// 删除
const onDelete = (record: DocumentPreResp) => {
  return handleDelete(() => deleteDocumentPre(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportDocumentPre(queryForm))
}

const DocumentPreAddModalRef = ref<InstanceType<typeof DocumentPreAddModal>>()
// 新增
const onAdd = () => {
  DocumentPreAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: DocumentPreResp) => {
  DocumentPreAddModalRef.value?.onUpdate(record.id)
}

const DocumentPreDetailDrawerRef = ref<InstanceType<typeof DocumentPreDetailDrawer>>()
// 详情
const onDetail = (record: DocumentPreResp) => {
  DocumentPreDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
