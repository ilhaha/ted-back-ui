<template>
  <div class="gi_table_page">
    <GiTable
      title="考生报考通知对应项目-计划明细管理"
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
	    <a-input-search v-model="queryForm.applyId" placeholder="请输入报名主表ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.examineeId" placeholder="请输入考生ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.noticeId" placeholder="请输入通知ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.projectId" placeholder="请输入报考项目ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.planId" placeholder="请输入考试计划ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examineeNoticeApplyRecord:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:examineeNoticeApplyRecord:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examineeNoticeApplyRecord:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:examineeNoticeApplyRecord:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:examineeNoticeApplyRecord:delete']"
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

    <ExamineeNoticeApplyRecordAddModal ref="ExamineeNoticeApplyRecordAddModalRef" @save-success="search" />
    <ExamineeNoticeApplyRecordDetailDrawer ref="ExamineeNoticeApplyRecordDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamineeNoticeApplyRecordAddModal from './ExamineeNoticeApplyRecordAddModal.vue'
import ExamineeNoticeApplyRecordDetailDrawer from './ExamineeNoticeApplyRecordDetailDrawer.vue'
import { type ExamineeNoticeApplyRecordResp, type ExamineeNoticeApplyRecordQuery, deleteExamineeNoticeApplyRecord, exportExamineeNoticeApplyRecord, listExamineeNoticeApplyRecord } from '@/apis/exam/examineeNoticeApplyRecord'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamineeNoticeApplyRecord' })


const queryForm = reactive<ExamineeNoticeApplyRecordQuery>({
  applyId: undefined,
  examineeId: undefined,
  noticeId: undefined,
  projectId: undefined,
  planId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamineeNoticeApplyRecord({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '报名主表ID', dataIndex: 'applyId', slotName: 'applyId' },
  { title: '考生ID', dataIndex: 'examineeId', slotName: 'examineeId' },
  { title: '通知ID', dataIndex: 'noticeId', slotName: 'noticeId' },
  { title: '报考项目ID', dataIndex: 'projectId', slotName: 'projectId' },
  { title: '考试计划ID', dataIndex: 'planId', slotName: 'planId' },
  { title: '考试场次类型：1初试，2补考', dataIndex: 'examAttemptType', slotName: 'examAttemptType' },
  { title: '报考类型位标识:1实操,2拍片,4评片,8开卷,16闭卷', dataIndex: 'practicalType', slotName: 'practicalType' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examineeNoticeApplyRecord:detail', 'exam:examineeNoticeApplyRecord:update', 'exam:examineeNoticeApplyRecord:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.applyId = undefined
  queryForm.examineeId = undefined
  queryForm.noticeId = undefined
  queryForm.projectId = undefined
  queryForm.planId = undefined
  search()
}

// 删除
const onDelete = (record: ExamineeNoticeApplyRecordResp) => {
  return handleDelete(() => deleteExamineeNoticeApplyRecord(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamineeNoticeApplyRecord(queryForm))
}

const ExamineeNoticeApplyRecordAddModalRef = ref<InstanceType<typeof ExamineeNoticeApplyRecordAddModal>>()
// 新增
const onAdd = () => {
  ExamineeNoticeApplyRecordAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamineeNoticeApplyRecordResp) => {
  ExamineeNoticeApplyRecordAddModalRef.value?.onUpdate(record.id)
}

const ExamineeNoticeApplyRecordDetailDrawerRef = ref<InstanceType<typeof ExamineeNoticeApplyRecordDetailDrawer>>()
// 详情
const onDetail = (record: ExamineeNoticeApplyRecordResp) => {
  ExamineeNoticeApplyRecordDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
