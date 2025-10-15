<template>
  <div class="gi_table_page">
    <GiTable
      title="步骤，存储题目的不同回答步骤管理"
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
	    <a-input-search v-model="queryForm.question" placeholder="请输入问题内容" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['examconnect:step:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['examconnect:step:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['examconnect:step:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['examconnect:step:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['examconnect:step:delete']"
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

    <StepAddModal ref="StepAddModalRef" @save-success="search" />
    <StepDetailDrawer ref="StepDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import StepAddModal from './StepAddModal.vue'
import StepDetailDrawer from './StepDetailDrawer.vue'
import { type StepResp, type StepQuery, deleteStep, exportStep, listStep } from '@/apis/examconnect/step'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Step' })


const queryForm = reactive<StepQuery>({
  question: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listStep({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  // { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '问题内容', dataIndex: 'question', slotName: 'question' },
  { title: '所属题库ID', dataIndex: 'questionBankId', slotName: 'questionBankId' },
  { title: '答案', dataIndex: 'isCorrectAnswer', slotName: 'isCorrectAnswer' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['examconnect:step:detail', 'examconnect:step:update', 'examconnect:step:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.question = undefined
  search()
}

// 删除
const onDelete = (record: StepResp) => {
  return handleDelete(() => deleteStep(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportStep(queryForm))
}

const StepAddModalRef = ref<InstanceType<typeof StepAddModal>>()
// 新增
const onAdd = () => {
  StepAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: StepResp) => {
  StepAddModalRef.value?.onUpdate(record.id)
}

const StepDetailDrawerRef = ref<InstanceType<typeof StepDetailDrawer>>()
// 详情
const onDetail = (record: StepResp) => {
  StepDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
