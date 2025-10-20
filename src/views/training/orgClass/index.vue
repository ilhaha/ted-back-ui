<template>
  <div class="gi_table_page">
    <GiTable
      title="培训机构班级管理"
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
        <a-select
          v-model="queryForm.projectId"
          :options="project_id_enum"
          placeholder="请选择项目id"
          allow-clear
          style="width: 150px"
          @change="search"
        />
	    <a-input-search v-model="queryForm.className" placeholder="请输入班级名称" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['training:orgClass:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['training:orgClass:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:orgClass:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['training:orgClass:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['training:orgClass:delete']"
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

    <OrgClassAddModal ref="OrgClassAddModalRef" @save-success="search" />
    <OrgClassDetailDrawer ref="OrgClassDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import OrgClassAddModal from './OrgClassAddModal.vue'
import OrgClassDetailDrawer from './OrgClassDetailDrawer.vue'
import { type OrgClassResp, type OrgClassQuery, deleteOrgClass, exportOrgClass, listOrgClass } from '@/apis/training/orgClass'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'OrgClass' })


const queryForm = reactive<OrgClassQuery>({
  projectId: undefined,
  className: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listOrgClass({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: 'id', dataIndex: 'id', slotName: 'id' },
  { title: '机构id', dataIndex: 'orgId', slotName: 'orgId' },
  { title: '项目id', dataIndex: 'projectId', slotName: 'projectId' },
  { title: '班级名称', dataIndex: 'className', slotName: 'className' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人id', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '是否删除 0-未删除 1-已删除', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:orgClass:detail', 'training:orgClass:update', 'training:orgClass:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.projectId = undefined
  queryForm.className = undefined
  search()
}

// 删除
const onDelete = (record: OrgClassResp) => {
  return handleDelete(() => deleteOrgClass(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportOrgClass(queryForm))
}

const OrgClassAddModalRef = ref<InstanceType<typeof OrgClassAddModal>>()
// 新增
const onAdd = () => {
  OrgClassAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: OrgClassResp) => {
  OrgClassAddModalRef.value?.onUpdate(record.id)
}

const OrgClassDetailDrawerRef = ref<InstanceType<typeof OrgClassDetailDrawer>>()
// 详情
const onDetail = (record: OrgClassResp) => {
  OrgClassDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
