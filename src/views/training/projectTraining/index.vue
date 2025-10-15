<template>
  <div class="gi_table_page">
    <GiTable
      title="项目培训关联管理"
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
	    <a-input-search v-model="queryForm.projectId" placeholder="请输入项目ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.trainingId" placeholder="请输入培训ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['training:projectTraining:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['training:projectTraining:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:projectTraining:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['training:projectTraining:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['training:projectTraining:delete']"
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

    <ProjectTrainingAddModal ref="ProjectTrainingAddModalRef" @save-success="search" />
    <ProjectTrainingDetailDrawer ref="ProjectTrainingDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ProjectTrainingAddModal from './ProjectTrainingAddModal.vue'
import ProjectTrainingDetailDrawer from './ProjectTrainingDetailDrawer.vue'
import { type ProjectTrainingResp, type ProjectTrainingQuery, deleteProjectTraining, exportProjectTraining, listProjectTraining } from '@/apis/training/projectTraining'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ProjectTraining' })


const queryForm = reactive<ProjectTrainingQuery>({
  projectId: undefined,
  trainingId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listProjectTraining({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '项目ID', dataIndex: 'projectId', slotName: 'projectId' },
  { title: '培训ID', dataIndex: 'trainingId', slotName: 'trainingId' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '0-未删除 1-已删除', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:projectTraining:detail', 'training:projectTraining:update', 'training:projectTraining:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.projectId = undefined
  queryForm.trainingId = undefined
  search()
}

// 删除
const onDelete = (record: ProjectTrainingResp) => {
  return handleDelete(() => deleteProjectTraining(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportProjectTraining(queryForm))
}

const ProjectTrainingAddModalRef = ref<InstanceType<typeof ProjectTrainingAddModal>>()
// 新增
const onAdd = () => {
  ProjectTrainingAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ProjectTrainingResp) => {
  ProjectTrainingAddModalRef.value?.onUpdate(record.id)
}

const ProjectTrainingDetailDrawerRef = ref<InstanceType<typeof ProjectTrainingDetailDrawer>>()
// 详情
const onDetail = (record: ProjectTrainingResp) => {
  ProjectTrainingDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
