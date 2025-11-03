<template>
  <div class="gi_table_page">
    <GiTable
      title="作业人员报名上传的资料管理"
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
	    <a-input-search v-model="queryForm.workerApplyId" placeholder="请输入作业人员报名表ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['worker:workerApplyDocument:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['worker:workerApplyDocument:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['worker:workerApplyDocument:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['worker:workerApplyDocument:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['worker:workerApplyDocument:delete']"
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

    <WorkerApplyDocumentAddModal ref="WorkerApplyDocumentAddModalRef" @save-success="search" />
    <WorkerApplyDocumentDetailDrawer ref="WorkerApplyDocumentDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import WorkerApplyDocumentAddModal from './WorkerApplyDocumentAddModal.vue'
import WorkerApplyDocumentDetailDrawer from './WorkerApplyDocumentDetailDrawer.vue'
import { type WorkerApplyDocumentResp, type WorkerApplyDocumentQuery, deleteWorkerApplyDocument, exportWorkerApplyDocument, listWorkerApplyDocument } from '@/apis/worker/workerApplyDocument'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'WorkerApplyDocument' })


const queryForm = reactive<WorkerApplyDocumentQuery>({
  workerApplyId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listWorkerApplyDocument({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '作业人员报名表ID', dataIndex: 'workerApplyId', slotName: 'workerApplyId' },
  { title: '资料存储路径', dataIndex: 'docPath', slotName: 'docPath' },
  { title: '关联资料类型ID', dataIndex: 'typeId', slotName: 'typeId' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['worker:workerApplyDocument:detail', 'worker:workerApplyDocument:update', 'worker:workerApplyDocument:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.workerApplyId = undefined
  search()
}

// 删除
const onDelete = (record: WorkerApplyDocumentResp) => {
  return handleDelete(() => deleteWorkerApplyDocument(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportWorkerApplyDocument(queryForm))
}

const WorkerApplyDocumentAddModalRef = ref<InstanceType<typeof WorkerApplyDocumentAddModal>>()
// 新增
const onAdd = () => {
  WorkerApplyDocumentAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: WorkerApplyDocumentResp) => {
  WorkerApplyDocumentAddModalRef.value?.onUpdate(record.id)
}

const WorkerApplyDocumentDetailDrawerRef = ref<InstanceType<typeof WorkerApplyDocumentDetailDrawer>>()
// 详情
const onDetail = (record: WorkerApplyDocumentResp) => {
  WorkerApplyDocumentDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
