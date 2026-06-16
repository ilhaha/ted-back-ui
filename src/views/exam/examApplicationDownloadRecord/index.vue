<template>
  <div class="gi_table_page">
    <GiTable
      title="考生申请下载记录管理"
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
	    <a-input-search v-model="queryForm.noticeId" placeholder="请输入考试通知ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.projectId" placeholder="请输入考试项目ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.candidateId" placeholder="请输入考生ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.applyNo" placeholder="请输入申请编号" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examApplicationDownloadRecord:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:examApplicationDownloadRecord:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examApplicationDownloadRecord:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:examApplicationDownloadRecord:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:examApplicationDownloadRecord:delete']"
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

    <ExamApplicationDownloadRecordAddModal ref="ExamApplicationDownloadRecordAddModalRef" @save-success="search" />
    <ExamApplicationDownloadRecordDetailDrawer ref="ExamApplicationDownloadRecordDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamApplicationDownloadRecordAddModal from './ExamApplicationDownloadRecordAddModal.vue'
import ExamApplicationDownloadRecordDetailDrawer from './ExamApplicationDownloadRecordDetailDrawer.vue'
import { type ExamApplicationDownloadRecordResp, type ExamApplicationDownloadRecordQuery, deleteExamApplicationDownloadRecord, exportExamApplicationDownloadRecord, listExamApplicationDownloadRecord } from '@/apis/exam/examApplicationDownloadRecord'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamApplicationDownloadRecord' })


const queryForm = reactive<ExamApplicationDownloadRecordQuery>({
  noticeId: undefined,
  projectId: undefined,
  candidateId: undefined,
  applyNo: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamApplicationDownloadRecord({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '考试通知ID', dataIndex: 'noticeId', slotName: 'noticeId' },
  { title: '考试项目ID', dataIndex: 'projectId', slotName: 'projectId' },
  { title: '考生ID', dataIndex: 'candidateId', slotName: 'candidateId' },
  { title: '申请编号', dataIndex: 'applyNo', slotName: 'applyNo' },
  { title: '删除标记', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examApplicationDownloadRecord:detail', 'exam:examApplicationDownloadRecord:update', 'exam:examApplicationDownloadRecord:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.noticeId = undefined
  queryForm.projectId = undefined
  queryForm.candidateId = undefined
  queryForm.applyNo = undefined
  search()
}

// 删除
const onDelete = (record: ExamApplicationDownloadRecordResp) => {
  return handleDelete(() => deleteExamApplicationDownloadRecord(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamApplicationDownloadRecord(queryForm))
}

const ExamApplicationDownloadRecordAddModalRef = ref<InstanceType<typeof ExamApplicationDownloadRecordAddModal>>()
// 新增
const onAdd = () => {
  ExamApplicationDownloadRecordAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamApplicationDownloadRecordResp) => {
  ExamApplicationDownloadRecordAddModalRef.value?.onUpdate(record.id)
}

const ExamApplicationDownloadRecordDetailDrawerRef = ref<InstanceType<typeof ExamApplicationDownloadRecordDetailDrawer>>()
// 详情
const onDetail = (record: ExamApplicationDownloadRecordResp) => {
  ExamApplicationDownloadRecordDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
