<template>
  <div class="gi_table_page">
    <GiTable
      title="持证信息管理"
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
	    <a-input-search v-model="queryForm.examineeId" placeholder="请输入考生ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.projectCode" placeholder="请输入持证项目编码" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.projectLevel" placeholder="请输入项目等级  0-无 1一级 2 二级" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:licenseHolderInfo:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:licenseHolderInfo:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:licenseHolderInfo:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:licenseHolderInfo:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:licenseHolderInfo:delete']"
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

    <LicenseHolderInfoAddModal ref="LicenseHolderInfoAddModalRef" @save-success="search" />
    <LicenseHolderInfoDetailDrawer ref="LicenseHolderInfoDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import LicenseHolderInfoAddModal from './LicenseHolderInfoAddModal.vue'
import LicenseHolderInfoDetailDrawer from './LicenseHolderInfoDetailDrawer.vue'
import { type LicenseHolderInfoResp, type LicenseHolderInfoQuery, deleteLicenseHolderInfo, exportLicenseHolderInfo, listLicenseHolderInfo } from '@/apis/exam/licenseHolderInfo'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'LicenseHolderInfo' })


const queryForm = reactive<LicenseHolderInfoQuery>({
  examineeId: undefined,
  projectCode: undefined,
  projectLevel: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listLicenseHolderInfo({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '考生ID', dataIndex: 'examineeId', slotName: 'examineeId' },
  { title: '持证项目编码', dataIndex: 'projectCode', slotName: 'projectCode' },
  { title: '项目等级  0-无 1一级 2 二级', dataIndex: 'projectLevel', slotName: 'projectLevel' },
  { title: '有效开始日期', dataIndex: 'validStartDate', slotName: 'validStartDate' },
  { title: '有效结束日期', dataIndex: 'validEndDate', slotName: 'validEndDate' },
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
    show: has.hasPermOr(['exam:licenseHolderInfo:detail', 'exam:licenseHolderInfo:update', 'exam:licenseHolderInfo:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.examineeId = undefined
  queryForm.projectCode = undefined
  queryForm.projectLevel = undefined
  search()
}

// 删除
const onDelete = (record: LicenseHolderInfoResp) => {
  return handleDelete(() => deleteLicenseHolderInfo(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportLicenseHolderInfo(queryForm))
}

const LicenseHolderInfoAddModalRef = ref<InstanceType<typeof LicenseHolderInfoAddModal>>()
// 新增
const onAdd = () => {
  LicenseHolderInfoAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: LicenseHolderInfoResp) => {
  LicenseHolderInfoAddModalRef.value?.onUpdate(record.id)
}

const LicenseHolderInfoDetailDrawerRef = ref<InstanceType<typeof LicenseHolderInfoDetailDrawer>>()
// 详情
const onDetail = (record: LicenseHolderInfoResp) => {
  LicenseHolderInfoDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
