<template>
  <div class="gi_table_page">
    <GiTable
      title="证件项目关联管理"
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
        <a-button v-permission="['certificate:certificateProject:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['certificate:certificateProject:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['certificate:certificateProject:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['certificate:certificateProject:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['certificate:certificateProject:delete']"
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

    <CertificateProjectAddModal ref="CertificateProjectAddModalRef" @save-success="search" />
    <CertificateProjectDetailDrawer ref="CertificateProjectDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import CertificateProjectAddModal from './CertificateProjectAddModal.vue'
import CertificateProjectDetailDrawer from './CertificateProjectDetailDrawer.vue'
import { type CertificateProjectResp, type CertificateProjectQuery, deleteCertificateProject, exportCertificateProject, listCertificateProject } from '@/apis/certificate/certificateProject'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'CertificateProject' })


const queryForm = reactive<CertificateProjectQuery>({
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listCertificateProject({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '证件ID', dataIndex: 'certificateTypeId', slotName: 'certificateTypeId' },
  { title: '项目ID', dataIndex: 'projectId', slotName: 'projectId' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '是否删除，0:未删除，1:已删除', dataIndex: 'isDeleted', slotName: 'isDeleted' },

  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['certificate:certificateProject:detail', 'certificate:certificateProject:update', 'certificate:certificateProject:delete'])
  }
]);

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: CertificateProjectResp) => {
  return handleDelete(() => deleteCertificateProject(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportCertificateProject(queryForm))
}

const CertificateProjectAddModalRef = ref<InstanceType<typeof CertificateProjectAddModal>>()
// 新增
const onAdd = () => {
  CertificateProjectAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CertificateProjectResp) => {
  CertificateProjectAddModalRef.value?.onUpdate(record.id)
}

const CertificateProjectDetailDrawerRef = ref<InstanceType<typeof CertificateProjectDetailDrawer>>()
// 详情
const onDetail = (record: CertificateProjectResp) => {
  CertificateProjectDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
