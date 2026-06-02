<template>
  <div class="gi_table_page">
    <GiTable
      title="考生试卷管理"
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
	    <a-input-search v-model="queryForm.planId" placeholder="请输入计划id" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.candidateId" placeholder="请输入考生id" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.paperJson" placeholder="请输入试卷 JSON 内容" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createTime" placeholder="请输入创建时间" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.updateTime" placeholder="请输入更新时间" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.isDeleted" placeholder="请输入删除标记(0未删,1已删)" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['examconnect:candidatePlanPaper:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['examconnect:candidatePlanPaper:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['examconnect:candidatePlanPaper:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['examconnect:candidatePlanPaper:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['examconnect:candidatePlanPaper:delete']"
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

    <CandidatePlanPaperAddModal ref="CandidatePlanPaperAddModalRef" @save-success="search" />
    <CandidatePlanPaperDetailDrawer ref="CandidatePlanPaperDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import CandidatePlanPaperAddModal from './CandidatePlanPaperAddModal.vue'
import CandidatePlanPaperDetailDrawer from './CandidatePlanPaperDetailDrawer.vue'
import { type CandidatePlanPaperResp, type CandidatePlanPaperQuery, deleteCandidatePlanPaper, exportCandidatePlanPaper, listCandidatePlanPaper } from '@/apis/examconnect/candidatePlanPaper'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'CandidatePlanPaper' })


const queryForm = reactive<CandidatePlanPaperQuery>({
  planId: undefined,
  candidateId: undefined,
  paperJson: undefined,
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
} = useTable((page) => listCandidatePlanPaper({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '计划id', dataIndex: 'planId', slotName: 'planId' },
  { title: '考生id', dataIndex: 'candidateId', slotName: 'candidateId' },
  { title: '试卷 JSON 内容', dataIndex: 'paperJson', slotName: 'paperJson' },
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
    show: has.hasPermOr(['examconnect:candidatePlanPaper:detail', 'examconnect:candidatePlanPaper:update', 'examconnect:candidatePlanPaper:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.planId = undefined
  queryForm.candidateId = undefined
  queryForm.paperJson = undefined
  queryForm.createTime = undefined
  queryForm.updateTime = undefined
  queryForm.isDeleted = undefined
  search()
}

// 删除
const onDelete = (record: CandidatePlanPaperResp) => {
  return handleDelete(() => deleteCandidatePlanPaper(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportCandidatePlanPaper(queryForm))
}

const CandidatePlanPaperAddModalRef = ref<InstanceType<typeof CandidatePlanPaperAddModal>>()
// 新增
const onAdd = () => {
  CandidatePlanPaperAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CandidatePlanPaperResp) => {
  CandidatePlanPaperAddModalRef.value?.onUpdate(record.id)
}

const CandidatePlanPaperDetailDrawerRef = ref<InstanceType<typeof CandidatePlanPaperDetailDrawer>>()
// 详情
const onDetail = (record: CandidatePlanPaperResp) => {
  CandidatePlanPaperDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
