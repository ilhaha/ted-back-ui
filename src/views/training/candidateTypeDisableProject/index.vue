<template>
  <div class="gi_table_page">
    <GiTable
      title="考生类型与禁考项目关联管理"
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
	    <a-input-search v-model="queryForm.candidateTypeId" placeholder="请输入考生类型ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.disableProjectId" placeholder="请输入禁考项目ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['training:candidateTypeDisableProject:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['training:candidateTypeDisableProject:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:candidateTypeDisableProject:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['training:candidateTypeDisableProject:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['training:candidateTypeDisableProject:delete']"
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

    <CandidateTypeDisableProjectAddModal ref="CandidateTypeDisableProjectAddModalRef" @save-success="search" />
    <CandidateTypeDisableProjectDetailDrawer ref="CandidateTypeDisableProjectDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import CandidateTypeDisableProjectAddModal from './CandidateTypeDisableProjectAddModal.vue'
import CandidateTypeDisableProjectDetailDrawer from './CandidateTypeDisableProjectDetailDrawer.vue'
import { type CandidateTypeDisableProjectResp, type CandidateTypeDisableProjectQuery, deleteCandidateTypeDisableProject, exportCandidateTypeDisableProject, listCandidateTypeDisableProject } from '@/apis/training/candidateTypeDisableProject'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'CandidateTypeDisableProject' })


const queryForm = reactive<CandidateTypeDisableProjectQuery>({
  candidateTypeId: undefined,
  disableProjectId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listCandidateTypeDisableProject({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键', dataIndex: 'id', slotName: 'id' },
  { title: '考生类型ID', dataIndex: 'candidateTypeId', slotName: 'candidateTypeId' },
  { title: '禁考项目ID', dataIndex: 'disableProjectId', slotName: 'disableProjectId' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '修改人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '修改时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '删除标记', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:candidateTypeDisableProject:detail', 'training:candidateTypeDisableProject:update', 'training:candidateTypeDisableProject:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.candidateTypeId = undefined
  queryForm.disableProjectId = undefined
  search()
}

// 删除
const onDelete = (record: CandidateTypeDisableProjectResp) => {
  return handleDelete(() => deleteCandidateTypeDisableProject(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportCandidateTypeDisableProject(queryForm))
}

const CandidateTypeDisableProjectAddModalRef = ref<InstanceType<typeof CandidateTypeDisableProjectAddModal>>()
// 新增
const onAdd = () => {
  CandidateTypeDisableProjectAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CandidateTypeDisableProjectResp) => {
  CandidateTypeDisableProjectAddModalRef.value?.onUpdate(record.id)
}

const CandidateTypeDisableProjectDetailDrawerRef = ref<InstanceType<typeof CandidateTypeDisableProjectDetailDrawer>>()
// 详情
const onDetail = (record: CandidateTypeDisableProjectResp) => {
  CandidateTypeDisableProjectDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
