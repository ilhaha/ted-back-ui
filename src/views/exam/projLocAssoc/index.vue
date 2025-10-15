<template>
  <div class="gi_table_page">
    <GiTable
      title="项目地点关联管理"
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
        <a-button v-permission="['exam:projLocAssoc:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['exam:projLocAssoc:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:projLocAssoc:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:projLocAssoc:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:projLocAssoc:delete']"
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

    <ProjLocAssocAddModal ref="ProjLocAssocAddModalRef" @save-success="search" />
    <ProjLocAssocDetailDrawer ref="ProjLocAssocDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ProjLocAssocAddModal from './ProjLocAssocAddModal.vue'
import ProjLocAssocDetailDrawer from './ProjLocAssocDetailDrawer.vue'
import { type ProjLocAssocResp, type ProjLocAssocQuery, deleteProjLocAssoc, exportProjLocAssoc, listProjLocAssoc } from '@/apis/exam/projLocAssoc'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ProjLocAssoc' })


const queryForm = reactive<ProjLocAssocQuery>({
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listProjLocAssoc({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '关联ID', dataIndex: 'id', slotName: 'id' },
  { title: '项目ID', dataIndex: 'projectId', slotName: 'projectId' },
  { title: '地点ID', dataIndex: 'locationId', slotName: 'locationId' },
  { title: '描述', dataIndex: 'redeme', slotName: 'redeme' },
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
    show: has.hasPermOr(['exam:projLocAssoc:detail', 'exam:projLocAssoc:update', 'exam:projLocAssoc:delete'])
  }
]);

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: ProjLocAssocResp) => {
  return handleDelete(() => deleteProjLocAssoc(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportProjLocAssoc(queryForm))
}

const ProjLocAssocAddModalRef = ref<InstanceType<typeof ProjLocAssocAddModal>>()
// 新增
const onAdd = () => {
  ProjLocAssocAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ProjLocAssocResp) => {
  ProjLocAssocAddModalRef.value?.onUpdate(record.id)
}

const ProjLocAssocDetailDrawerRef = ref<InstanceType<typeof ProjLocAssocDetailDrawer>>()
// 详情
const onDetail = (record: ProjLocAssocResp) => {
  ProjLocAssocDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
