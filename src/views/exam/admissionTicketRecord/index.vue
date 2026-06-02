<template>
  <div class="gi_table_page">
    <GiTable
      title="下载准考证记录管理"
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
	    <a-input-search v-model="queryForm.noticeId" placeholder="请输入通知ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.projectId" placeholder="请输入项目ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.candidateId" placeholder="请输入考生ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:admissionTicketRecord:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:admissionTicketRecord:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:admissionTicketRecord:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:admissionTicketRecord:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:admissionTicketRecord:delete']"
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

    <AdmissionTicketRecordAddModal ref="AdmissionTicketRecordAddModalRef" @save-success="search" />
    <AdmissionTicketRecordDetailDrawer ref="AdmissionTicketRecordDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import AdmissionTicketRecordAddModal from './AdmissionTicketRecordAddModal.vue'
import AdmissionTicketRecordDetailDrawer from './AdmissionTicketRecordDetailDrawer.vue'
import { type AdmissionTicketRecordResp, type AdmissionTicketRecordQuery, deleteAdmissionTicketRecord, exportAdmissionTicketRecord, listAdmissionTicketRecord } from '@/apis/exam/admissionTicketRecord'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'AdmissionTicketRecord' })


const queryForm = reactive<AdmissionTicketRecordQuery>({
  noticeId: undefined,
  projectId: undefined,
  candidateId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listAdmissionTicketRecord({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '通知ID', dataIndex: 'noticeId', slotName: 'noticeId' },
  { title: '项目ID', dataIndex: 'projectId', slotName: 'projectId' },
  { title: '考生ID', dataIndex: 'candidateId', slotName: 'candidateId' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '是否删除（0-未删除，1-已删除）', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:admissionTicketRecord:detail', 'exam:admissionTicketRecord:update', 'exam:admissionTicketRecord:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.noticeId = undefined
  queryForm.projectId = undefined
  queryForm.candidateId = undefined
  search()
}

// 删除
const onDelete = (record: AdmissionTicketRecordResp) => {
  return handleDelete(() => deleteAdmissionTicketRecord(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportAdmissionTicketRecord(queryForm))
}

const AdmissionTicketRecordAddModalRef = ref<InstanceType<typeof AdmissionTicketRecordAddModal>>()
// 新增
const onAdd = () => {
  AdmissionTicketRecordAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: AdmissionTicketRecordResp) => {
  AdmissionTicketRecordAddModalRef.value?.onUpdate(record.id)
}

const AdmissionTicketRecordDetailDrawerRef = ref<InstanceType<typeof AdmissionTicketRecordDetailDrawer>>()
// 详情
const onDetail = (record: AdmissionTicketRecordResp) => {
  AdmissionTicketRecordDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
