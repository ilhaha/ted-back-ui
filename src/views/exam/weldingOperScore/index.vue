<template>
  <div class="gi_table_page">
    <GiTable
      title="焊接项目实操成绩管理"
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
	    <a-input-search v-model="queryForm.planId" placeholder="请输入考试计划ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.recordId" placeholder="请输入考试记录ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.candidateId" placeholder="请输入考生ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.projectCode" placeholder="请输入焊接项目代码" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:weldingOperScore:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:weldingOperScore:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:weldingOperScore:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:weldingOperScore:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:weldingOperScore:delete']"
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

    <WeldingOperScoreAddModal ref="WeldingOperScoreAddModalRef" @save-success="search" />
    <WeldingOperScoreDetailDrawer ref="WeldingOperScoreDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import WeldingOperScoreAddModal from './WeldingOperScoreAddModal.vue'
import WeldingOperScoreDetailDrawer from './WeldingOperScoreDetailDrawer.vue'
import { type WeldingOperScoreResp, type WeldingOperScoreQuery, deleteWeldingOperScore, exportWeldingOperScore, listWeldingOperScore } from '@/apis/exam/weldingOperScore'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'WeldingOperScore' })


const queryForm = reactive<WeldingOperScoreQuery>({
  planId: undefined,
  recordId: undefined,
  candidateId: undefined,
  projectCode: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listWeldingOperScore({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键', dataIndex: 'id', slotName: 'id' },
  { title: '考试计划ID', dataIndex: 'planId', slotName: 'planId' },
  { title: '考试记录ID', dataIndex: 'recordId', slotName: 'recordId' },
  { title: '考生ID', dataIndex: 'candidateId', slotName: 'candidateId' },
  { title: '焊接项目代码', dataIndex: 'projectCode', slotName: 'projectCode' },
  { title: '实操成绩', dataIndex: 'operScore', slotName: 'operScore' },
  { title: '删除标记', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间戳', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间戳', dataIndex: 'updateTime', slotName: 'updateTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:weldingOperScore:detail', 'exam:weldingOperScore:update', 'exam:weldingOperScore:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.planId = undefined
  queryForm.recordId = undefined
  queryForm.candidateId = undefined
  queryForm.projectCode = undefined
  search()
}

// 删除
const onDelete = (record: WeldingOperScoreResp) => {
  return handleDelete(() => deleteWeldingOperScore(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportWeldingOperScore(queryForm))
}

const WeldingOperScoreAddModalRef = ref<InstanceType<typeof WeldingOperScoreAddModal>>()
// 新增
const onAdd = () => {
  WeldingOperScoreAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: WeldingOperScoreResp) => {
  WeldingOperScoreAddModalRef.value?.onUpdate(record.id)
}

const WeldingOperScoreDetailDrawerRef = ref<InstanceType<typeof WeldingOperScoreDetailDrawer>>()
// 详情
const onDetail = (record: WeldingOperScoreResp) => {
  WeldingOperScoreDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
