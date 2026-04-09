<template>
  <div class="gi_table_page">
    <GiTable
      title="考试确认错误日志管理"
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
        <!-- <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button> -->
      </template>
    </GiTable>

    <ExamAsyncErrorLogAddModal ref="ExamAsyncErrorLogAddModalRef" @save-success="search" />
    <ExamAsyncErrorLogDetailDrawer ref="ExamAsyncErrorLogDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamAsyncErrorLogAddModal from './ExamAsyncErrorLogAddModal.vue'
import ExamAsyncErrorLogDetailDrawer from './ExamAsyncErrorLogDetailDrawer.vue'
import { type ExamAsyncErrorLogResp, type ExamAsyncErrorLogQuery, deleteExamAsyncErrorLog, exportExamAsyncErrorLog, listExamAsyncErrorLog } from '@/apis/exam/examAsyncErrorLog'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamAsyncErrorLog' })


const queryForm = reactive<ExamAsyncErrorLogQuery>({
  sort: ['id,desc'],
  status: 0
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamAsyncErrorLog({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '考试计划ID', dataIndex: 'planId', slotName: 'planId' },
  { title: '报名ID', dataIndex: 'enrollId', slotName: 'enrollId' },
  { title: '失败步骤', dataIndex: 'step', slotName: 'step' },
  { title: '错误简要信息', dataIndex: 'errorMsg', slotName: 'errorMsg' },
  { title: '异常堆栈信息', dataIndex: 'stackTrace', slotName: 'stackTrace' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },

]);

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: ExamAsyncErrorLogResp) => {
  return handleDelete(() => deleteExamAsyncErrorLog(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamAsyncErrorLog(queryForm))
}

const ExamAsyncErrorLogAddModalRef = ref<InstanceType<typeof ExamAsyncErrorLogAddModal>>()
// 新增
const onAdd = () => {
  ExamAsyncErrorLogAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamAsyncErrorLogResp) => {
  ExamAsyncErrorLogAddModalRef.value?.onUpdate(record.id)
}

const ExamAsyncErrorLogDetailDrawerRef = ref<InstanceType<typeof ExamAsyncErrorLogDetailDrawer>>()
// 详情
const onDetail = (record: ExamAsyncErrorLogResp) => {
  ExamAsyncErrorLogDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
