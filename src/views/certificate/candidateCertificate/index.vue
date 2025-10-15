<template>
  <div class="gi_table_page">
    <GiTable
      title="考生持证列表"
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
        <GiForm :style="''" v-model="queryForm" search :columns="searchForm" size="medium" @search="search" @reset="reset">
        </GiForm>
      </template>
      <template #toolbar-right>
      </template>
      <template #action="{ record }">
        <a-space>
<!--          <a-link v-if="record.certificateStatus === (0) || record.certificateStatus === (2) " v-permission="['certificate:candidateCertificate:detail']" title="报名" @click="onDetail(record)">报名</a-link>-->
<!--          <a-link v-permission="['certificate:candidateCertificate:detail']" title="详情" @click="onDetail(record)">详情</a-link>-->
<!--          <a-link v-permission="['certificate:candidateCertificate:update']" title="修改" @click="onUpdate(record)">修改</a-link>-->
<!--          <a-link-->
<!--            v-permission="['certificate:candidateCertificate:delete']"-->
<!--            status="danger"-->
<!--            :disabled="record.disabled"-->
<!--            :title="record.disabled ? '不可删除' : '删除'"-->
<!--            @click="onDelete(record)"-->
<!--          >-->
<!--            删除-->
<!--          </a-link>-->
        </a-space>
      </template>
      <template #certificateStatus="{ record }">
        <a-tag :color="getStatusColor(record.certificateStatus)">
          {{ getStatusText(record.certificateStatus) }}
        </a-tag>
      </template>
    </GiTable>

    <CandidateCertificateAddModal ref="CandidateCertificateAddModalRef" @save-success="search" />
    <CandidateCertificateDetailDrawer ref="CandidateCertificateDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import CandidateCertificateAddModal from './CandidateCertificateAddModal.vue'
import CandidateCertificateDetailDrawer from './CandidateCertificateDetailDrawer.vue'
import { type CandidateCertificateResp, type CandidateCertificateQuery, deleteCandidateCertificate, exportCandidateCertificate, listCandidateCertificate } from '@/apis/certificate/candidateCertificate'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import data from "@/mock/_data/area";
import type {ColumnItem} from "@/components/GiForm";

defineOptions({ name: 'CandidateCertificate' })


const queryForm = reactive<CandidateCertificateQuery>({
  certificateName: undefined,
  certificateStatus: undefined,
  certificateNumber: undefined,
  issuerId: undefined,
  deptId: undefined,
  sort: ['id,desc'],
})

const statusList = ref([
  { label: '未持有', value: 0 },
  { label: '持有未到期', value: 1 },
  { label: '持有已到期', value: 2 },
])
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '未持有'
    case 1:
      return '持有未到期'
    case 2:
      return '持有已到期'
    default:
      return ''
  }
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'red'      // 未持有显示红色
    case 1:
      return 'green'    // 持有未到期显示绿色
    case 2:
      return 'orange'   // 持有已到期显示橙色
    default:
      return 'gray'
  }
}

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listCandidateCertificate({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  // { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '考生名称', dataIndex: 'candidateName', slotName: 'candidateName' },

  { title: '证件名称', dataIndex: 'certificateName', slotName: 'certificateName' },
  { title: '所属项目', dataIndex: 'projectName', slotName: 'projectName' },
  // 0:未持有;1:持有;2:到期;3:待换证'
  { title: '证件状态', dataIndex: 'certificateStatus', slotName: 'certificateStatus' },
  { title: '证件编号', dataIndex: 'certificateNumber', slotName: 'certificateNumber' },
  { title: '审批人', dataIndex: 'issuerName', slotName: 'issuerName' },
  { title: '持有时间', dataIndex: 'holdingDate', slotName: 'holdingDate' },
  { title: '到期时间', dataIndex: 'expiryDate', slotName: 'expiryDate' },
  // { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  // { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  // { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  // { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  // { title: '是否删除，0:未删除，1:已删除', dataIndex: 'isDeleted', slotName: 'isDeleted' },
/*  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 200,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['certificate:candidateCertificate:detail', 'certificate:candidateCertificate:update', 'certificate:candidateCertificate:delete'])
  }*/
])

const reset = () => {
  queryForm.certificateName = undefined
  queryForm.projectName = undefined
  queryForm.certificateStatus = undefined
  queryForm.certificateNumber = undefined
  search()
}

const searchForm: ColumnItem[] = reactive([
  {
    type: 'input',
    field: 'certificateName',
    formItemProps: {
      hideLabel: true,
    },
    props: {
      placeholder: '搜索证书名称',
      showWordLimit: false,
    },
  },
  {
    type: 'select',
    field: 'certificateStatus',
    formItemProps: {
      hideLabel: true,
    },
    props: {
      options: statusList,
      placeholder: '搜索证书状态',
    },
  },
])


// 删除
const onDelete = (record: CandidateCertificateResp) => {
  return handleDelete(() => deleteCandidateCertificate(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportCandidateCertificate(queryForm))
}

const CandidateCertificateAddModalRef = ref<InstanceType<typeof CandidateCertificateAddModal>>()
// 新增
const onAdd = () => {
  CandidateCertificateAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CandidateCertificateResp) => {
  CandidateCertificateAddModalRef.value?.onUpdate(record.id)
}

const CandidateCertificateDetailDrawerRef = ref<InstanceType<typeof CandidateCertificateDetailDrawer>>()
// 详情
const onDetail = (record: CandidateCertificateResp) => {
  CandidateCertificateDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
