<template>
  <div class="gi_table_page">
    <GiTable
      title="机构培训关联管理"
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
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['training:orgTraining:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['training:orgTraining:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:orgTraining:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['training:orgTraining:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['training:orgTraining:delete']"
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

    <OrgTrainingAddModal ref="OrgTrainingAddModalRef" @save-success="search" />
    <OrgTrainingDetailDrawer ref="OrgTrainingDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import OrgTrainingAddModal from './OrgTrainingAddModal.vue'
import OrgTrainingDetailDrawer from './OrgTrainingDetailDrawer.vue'
import { type OrgTrainingResp, type OrgTrainingQuery, deleteOrgTraining, exportOrgTraining, listOrgTraining } from '@/apis/training/orgTraining'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'OrgTraining' })


const queryForm = reactive<OrgTrainingQuery>({
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listOrgTraining({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键id', dataIndex: 'id', slotName: 'id' },
  { title: '机构id', dataIndex: 'orgId', slotName: 'orgId' },
  { title: '培训id', dataIndex: 'trainingId', slotName: 'trainingId' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:orgTraining:detail', 'training:orgTraining:update', 'training:orgTraining:delete'])
  }
]);

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: OrgTrainingResp) => {
  return handleDelete(() => deleteOrgTraining(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportOrgTraining(queryForm))
}

const OrgTrainingAddModalRef = ref<InstanceType<typeof OrgTrainingAddModal>>()
// 新增
const onAdd = () => {
  OrgTrainingAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: OrgTrainingResp) => {
  OrgTrainingAddModalRef.value?.onUpdate(record.id)
}

const OrgTrainingDetailDrawerRef = ref<InstanceType<typeof OrgTrainingDetailDrawer>>()
// 详情
const onDetail = (record: OrgTrainingResp) => {
  OrgTrainingDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
