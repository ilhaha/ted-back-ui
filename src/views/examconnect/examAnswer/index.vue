<template>
  <div class="gi_table_page">
    <GiTable
      title="考生答题，记录考生答题情况管理"
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
	    <a-input-search v-model="queryForm.candidateId" placeholder="请输入考生ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['examconnect:examAnswer:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['examconnect:examAnswer:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['examconnect:examAnswer:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['examconnect:examAnswer:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['examconnect:examAnswer:delete']"
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

    <ExamAnswerAddModal ref="ExamAnswerAddModalRef" @save-success="search" />
    <ExamAnswerDetailDrawer ref="ExamAnswerDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamAnswerAddModal from './ExamAnswerAddModal.vue'
import ExamAnswerDetailDrawer from './ExamAnswerDetailDrawer.vue'
import { type ExamAnswerResp, type ExamAnswerQuery, deleteExamAnswer, exportExamAnswer, listExamAnswer } from '@/apis/examconnect/examAnswer'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamAnswer' })


const queryForm = reactive<ExamAnswerQuery>({
  candidateId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamAnswer({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '考生ID', dataIndex: 'candidateId', slotName: 'candidateId' },
  { title: '考试计划ID', dataIndex: 'planId', slotName: 'planId' },
  { title: '题库ID', dataIndex: 'questionId', slotName: 'questionId' },
  { title: '排序（答题顺序）', dataIndex: 'sort', slotName: 'sort' },
  { title: '步骤ID', dataIndex: 'stepId', slotName: 'stepId' },
  { title: '是否正确（0-错误，1-正确）', dataIndex: 'isCorrect', slotName: 'isCorrect' },
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
    show: has.hasPermOr(['examconnect:examAnswer:detail', 'examconnect:examAnswer:update', 'examconnect:examAnswer:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.candidateId = undefined
  search()
}

// 删除
const onDelete = (record: ExamAnswerResp) => {
  return handleDelete(() => deleteExamAnswer(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamAnswer(queryForm))
}

const ExamAnswerAddModalRef = ref<InstanceType<typeof ExamAnswerAddModal>>()
// 新增
const onAdd = () => {
  ExamAnswerAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamAnswerResp) => {
  ExamAnswerAddModalRef.value?.onUpdate(record.id)
}

const ExamAnswerDetailDrawerRef = ref<InstanceType<typeof ExamAnswerDetailDrawer>>()
// 详情
const onDetail = (record: ExamAnswerResp) => {
  ExamAnswerDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
