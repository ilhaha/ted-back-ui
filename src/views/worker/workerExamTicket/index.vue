<template>
  <div class="gi_table_page">
    <GiTable
      title="作业人员准考证管理"
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
	    <a-input-search v-model="queryForm.enrollId" placeholder="请输入报名id" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.candidateName" placeholder="请输入作业人员姓名" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.ticketUrl" placeholder="请输入准考证地址" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createTime" placeholder="请输入创建时间" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.updateTime" placeholder="请输入更新时间" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.isDeleted" placeholder="请输入删除标记(0未删,1已删)" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['worker:workerExamTicket:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['worker:workerExamTicket:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['worker:workerExamTicket:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['worker:workerExamTicket:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['worker:workerExamTicket:delete']"
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

    <WorkerExamTicketAddModal ref="WorkerExamTicketAddModalRef" @save-success="search" />
    <WorkerExamTicketDetailDrawer ref="WorkerExamTicketDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import WorkerExamTicketAddModal from './WorkerExamTicketAddModal.vue'
import WorkerExamTicketDetailDrawer from './WorkerExamTicketDetailDrawer.vue'
import { type WorkerExamTicketResp, type WorkerExamTicketQuery, deleteWorkerExamTicket, exportWorkerExamTicket, listWorkerExamTicket } from '@/apis/worker/workerExamTicket'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'WorkerExamTicket' })


const queryForm = reactive<WorkerExamTicketQuery>({
  enrollId: undefined,
  candidateName: undefined,
  ticketUrl: undefined,
  createTime: undefined,
  updateTime: undefined,
  isDeleted: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listWorkerExamTicket({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '报名id', dataIndex: 'enrollId', slotName: 'enrollId' },
  { title: '作业人员姓名', dataIndex: 'candidateName', slotName: 'candidateName' },
  { title: '准考证地址', dataIndex: 'ticketUrl', slotName: 'ticketUrl' },
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
    show: has.hasPermOr(['worker:workerExamTicket:detail', 'worker:workerExamTicket:update', 'worker:workerExamTicket:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.enrollId = undefined
  queryForm.candidateName = undefined
  queryForm.ticketUrl = undefined
  queryForm.createTime = undefined
  queryForm.updateTime = undefined
  queryForm.isDeleted = undefined
  search()
}

// 删除
const onDelete = (record: WorkerExamTicketResp) => {
  return handleDelete(() => deleteWorkerExamTicket(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportWorkerExamTicket(queryForm))
}

const WorkerExamTicketAddModalRef = ref<InstanceType<typeof WorkerExamTicketAddModal>>()
// 新增
const onAdd = () => {
  WorkerExamTicketAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: WorkerExamTicketResp) => {
  WorkerExamTicketAddModalRef.value?.onUpdate(record.id)
}

const WorkerExamTicketDetailDrawerRef = ref<InstanceType<typeof WorkerExamTicketDetailDrawer>>()
// 详情
const onDetail = (record: WorkerExamTicketResp) => {
  WorkerExamTicketDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
