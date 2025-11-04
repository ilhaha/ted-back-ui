<template>
  <div class="gi_table_page">
    <GiTable
      title="考生缴费审核管理"
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
	    <a-input-search v-model="queryForm.examPlanId" placeholder="请输入关联考试计划ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.examineeId" placeholder="请输入考生ID" allow-clear @search="search" />
        <a-select
          v-model="queryForm.auditStatus"
          :options="audit_status_enum"
          placeholder="请选择审核状态：0-待审核，1-审核通过，2-审核驳回"
          allow-clear
          style="width: 150px"
          @change="search"
        />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examineePaymentAudit:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:examineePaymentAudit:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examineePaymentAudit:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:examineePaymentAudit:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:examineePaymentAudit:delete']"
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

    <ExamineePaymentAuditAddModal ref="ExamineePaymentAuditAddModalRef" @save-success="search" />
    <ExamineePaymentAuditDetailDrawer ref="ExamineePaymentAuditDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamineePaymentAuditAddModal from './ExamineePaymentAuditAddModal.vue'
import ExamineePaymentAuditDetailDrawer from './ExamineePaymentAuditDetailDrawer.vue'
import { type ExamineePaymentAuditResp, type ExamineePaymentAuditQuery, deleteExamineePaymentAudit, exportExamineePaymentAudit, listExamineePaymentAudit } from '@/apis/exam/examineePaymentAudit'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamineePaymentAudit' })


const queryForm = reactive<ExamineePaymentAuditQuery>({
  examPlanId: undefined,
  examineeId: undefined,
  auditStatus: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamineePaymentAudit({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '关联考试计划ID', dataIndex: 'examPlanId', slotName: 'examPlanId' },
  { title: '考生ID', dataIndex: 'examineeId', slotName: 'examineeId' },
  { title: '关联报名记录ID', dataIndex: 'enrollId', slotName: 'enrollId' },
  { title: '缴费金额（元）', dataIndex: 'paymentAmount', slotName: 'paymentAmount' },
  { title: '缴费时间', dataIndex: 'paymentTime', slotName: 'paymentTime' },
  { title: '缴费凭证URL', dataIndex: 'paymentProofUrl', slotName: 'paymentProofUrl' },
  { title: '缴费通知单URL', dataIndex: 'auditNoticeUrl', slotName: 'auditNoticeUrl' },
  { title: '审核状态：0-待审核，1-审核通过，2-审核驳回', dataIndex: 'auditStatus', slotName: 'auditStatus' },
  { title: '驳回原因', dataIndex: 'rejectReason', slotName: 'rejectReason' },
  { title: '审核人ID', dataIndex: 'auditorId', slotName: 'auditorId' },
  { title: '审核时间', dataIndex: 'auditTime', slotName: 'auditTime' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '是否删除（0否，1是）', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examineePaymentAudit:detail', 'exam:examineePaymentAudit:update', 'exam:examineePaymentAudit:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.examPlanId = undefined
  queryForm.examineeId = undefined
  queryForm.auditStatus = undefined
  search()
}

// 删除
const onDelete = (record: ExamineePaymentAuditResp) => {
  return handleDelete(() => deleteExamineePaymentAudit(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamineePaymentAudit(queryForm))
}

const ExamineePaymentAuditAddModalRef = ref<InstanceType<typeof ExamineePaymentAuditAddModal>>()
// 新增
const onAdd = () => {
  ExamineePaymentAuditAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamineePaymentAuditResp) => {
  ExamineePaymentAuditAddModalRef.value?.onUpdate(record.id)
}

const ExamineePaymentAuditDetailDrawerRef = ref<InstanceType<typeof ExamineePaymentAuditDetailDrawer>>()
// 详情
const onDetail = (record: ExamineePaymentAuditResp) => {
  ExamineePaymentAuditDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
