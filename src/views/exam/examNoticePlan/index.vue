<template>
  <div class="gi_table_page">
    <GiTable
      title="考试通知与考试计划关联管理"
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
	    <a-input-search v-model="queryForm.planId" placeholder="请输入考试计划ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examNoticePlan:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:examNoticePlan:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examNoticePlan:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:examNoticePlan:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:examNoticePlan:delete']"
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

    <ExamNoticePlanAddModal ref="ExamNoticePlanAddModalRef" @save-success="search" />
    <ExamNoticePlanDetailDrawer ref="ExamNoticePlanDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamNoticePlanAddModal from './ExamNoticePlanAddModal.vue'
import ExamNoticePlanDetailDrawer from './ExamNoticePlanDetailDrawer.vue'
import { type ExamNoticePlanResp, type ExamNoticePlanQuery, deleteExamNoticePlan, exportExamNoticePlan, listExamNoticePlan } from '@/apis/exam/examNoticePlan'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamNoticePlan' })


const queryForm = reactive<ExamNoticePlanQuery>({
  noticeId: undefined,
  planId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamNoticePlan({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '考试通知ID', dataIndex: 'noticeId', slotName: 'noticeId' },
  { title: '考试计划ID', dataIndex: 'planId', slotName: 'planId' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间戳', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间戳', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '删除标记', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examNoticePlan:detail', 'exam:examNoticePlan:update', 'exam:examNoticePlan:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.noticeId = undefined
  queryForm.planId = undefined
  search()
}

// 删除
const onDelete = (record: ExamNoticePlanResp) => {
  return handleDelete(() => deleteExamNoticePlan(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamNoticePlan(queryForm))
}

const ExamNoticePlanAddModalRef = ref<InstanceType<typeof ExamNoticePlanAddModal>>()
// 新增
const onAdd = () => {
  ExamNoticePlanAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamNoticePlanResp) => {
  ExamNoticePlanAddModalRef.value?.onUpdate(record.id)
}

const ExamNoticePlanDetailDrawerRef = ref<InstanceType<typeof ExamNoticePlanDetailDrawer>>()
// 详情
const onDetail = (record: ExamNoticePlanResp) => {
  ExamNoticePlanDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
