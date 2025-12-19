<template>
  <div class="gi_table_page">
    <GiTable
      title="考试劳务费配置管理"
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
	    <a-input-search v-model="queryForm.planId" placeholder="请输入计划ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.candidateId" placeholder="请输入考生ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.violationDesc" placeholder="请输入违规描述" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examViolation:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:examViolation:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examViolation:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:examViolation:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:examViolation:delete']"
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

    <ExamViolationAddModal ref="ExamViolationAddModalRef" @save-success="search" />
    <ExamViolationDetailDrawer ref="ExamViolationDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamViolationAddModal from './ExamViolationAddModal.vue'
import ExamViolationDetailDrawer from './ExamViolationDetailDrawer.vue'
import { type ExamViolationResp, type ExamViolationQuery, deleteExamViolation, exportExamViolation, listExamViolation } from '@/apis/exam/examViolation'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamViolation' })


const queryForm = reactive<ExamViolationQuery>({
  planId: undefined,
  candidateId: undefined,
  violationDesc: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamViolation({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '', dataIndex: 'id', slotName: 'id' },
  { title: '计划ID', dataIndex: 'planId', slotName: 'planId' },
  { title: '考生ID', dataIndex: 'candidateId', slotName: 'candidateId' },
  { title: '违规描述', dataIndex: 'violationDesc', slotName: 'violationDesc' },
  { title: '违规图片', dataIndex: 'illegalUrl', slotName: 'illegalUrl' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '修改人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '修改时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examViolation:detail', 'exam:examViolation:update', 'exam:examViolation:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.planId = undefined
  queryForm.candidateId = undefined
  queryForm.violationDesc = undefined
  search()
}

// 删除
const onDelete = (record: ExamViolationResp) => {
  return handleDelete(() => deleteExamViolation(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamViolation(queryForm))
}

const ExamViolationAddModalRef = ref<InstanceType<typeof ExamViolationAddModal>>()
// 新增
const onAdd = () => {
  ExamViolationAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamViolationResp) => {
  ExamViolationAddModalRef.value?.onUpdate(record.id)
}

const ExamViolationDetailDrawerRef = ref<InstanceType<typeof ExamViolationDetailDrawer>>()
// 详情
const onDetail = (record: ExamViolationResp) => {
  ExamViolationDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
