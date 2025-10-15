<template>
  <div class="gi_table_page">
    <GiTable
      title="特种设备人员资格申请管理"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      :row-selection="{ type: 'checkbox', showCheckedAll: true }"
      @select="select"
      @select-all="selectAll"
      @refresh="search"
    >
      <template #previewImage="{ record }">
        <a-image
            v-if="record.imageUrl"
            width="80"
            height="60"
            :src="record.imageUrl"
            :preview-props="{ zoomRate: 1.5 }"
            class="preview-image"
            fit="cover"
            @error="handleImageError"
        />
        <span v-else>-</span>
      </template>

      <template #candidateName="{ record }">
        <span>{{ record.createUserString }}</span>
      </template>

      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>

      <template #toolbar-left>
	    <a-input-search v-model="queryForm.candidatesName" placeholder="请输入考生名称" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.examPlanName" placeholder="请输入考试计划名称" allow-clear @search="search" />
      <a-button type="primary" class="ml-2" @click="search">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:specialCertificationApplicant:audit']" type="primary" :disabled="!selectedKeys.length" @click="onBatchAudit">
          <template #icon><icon-check /></template>
          <template #default>批量审核</template>
        </a-button>
        <!-- <a-button v-permission="['exam:specialCertificationApplicant:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:specialCertificationApplicant:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link
            v-permission="['exam:specialCertificationApplicant:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
          <a-link
            v-if="record.status === 0"
            v-permission="['exam:specialCertificationApplicant:audit']"
            status="success"
            title="审核"
            @click="onAudit(record)"
          >
            审核
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <SpecialCertificationApplicantAddModal ref="SpecialCertificationApplicantAddModalRef" @save-success="search" />
    <SpecialCertificationApplicantDetailDrawer ref="SpecialCertificationApplicantDetailDrawerRef" :candidate-name-map="{}" />

    <a-modal v-permission="['exam:specialCertificationApplicant:mutyaudit']"v-model:visible="batchAuditVisible" title="批量审核" :mask-closable="false" :closable="false" :footer="false">
      <a-form layout="vertical">
        <a-form-item label="审核结果">
          <a-radio-group v-model="batchAuditStatus">
            <a-radio :value="1">审核通过</a-radio>
            <a-radio :value="2">审核不通过</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="batchAuditStatus === 2" label="不通过原因">
          <a-input v-model="batchAuditReason" placeholder="请输入不通过原因" allow-clear />
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" :loading="batchAuditLoading" @click="handleBatchAudit">确定</a-button>
            <a-button @click="batchAuditVisible = false">取消</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import SpecialCertificationApplicantAddModal from './SpecialCertificationApplicantAddModal.vue'
import SpecialCertificationApplicantDetailDrawer from './SpecialCertificationApplicantDetailDrawer.vue'
import { type SpecialCertificationApplicantResp, type SpecialCertificationApplicantQuery, deleteSpecialCertificationApplicant, exportSpecialCertificationApplicant, listSpecialCertificationApplicant, updateSpecialCertificationApplicant, batchAuditSpecialCertificationApplicant } from '@/apis/exam/specialCertificationApplicant'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { ref, reactive, onMounted } from 'vue'
import { Message } from '@arco-design/web-vue'
// import { getSpecialCertificationApplicant,getCandidateNameById } from '@/apis/exam/specialCertificationApplicant'
import { getUser } from '@/apis/system/user'

defineOptions({ name: 'SpecialCertificationApplicant' })

const queryForm = reactive<SpecialCertificationApplicantQuery>({
  candidatesName: undefined,
  examPlanName: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
  selectedKeys,
  select,
  selectAll
} = useTable((page) => listSpecialCertificationApplicant({ ...queryForm, ...page }), { immediate: true })

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'orange'
    case 1:
      return 'green'
    case 2:
      return 'red'
    default:
      return 'default'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '未审核'
    case 1:
      return '审核通过'
    case 2:
      return '审核不通过'
    default:
      return '未知状态'
  }
}

const columns = ref<TableInstanceColumns[]>([
  { title: '考生名称', dataIndex: 'candidateName', slotName: 'candidateName' },
  { title: '考试计划名称', dataIndex: 'planName', slotName: 'planName' },
  { title: '申请表', dataIndex: 'imageUrl', slotName: 'previewImage' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:specialCertificationApplicant:detail', 'exam:specialCertificationApplicant:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.candidatesName = undefined
  queryForm.examPlanName = undefined
  search()
}

// 删除
const onDelete = (record: SpecialCertificationApplicantResp) => {
  return handleDelete(() => deleteSpecialCertificationApplicant(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportSpecialCertificationApplicant(queryForm))
}

const SpecialCertificationApplicantAddModalRef = ref<InstanceType<typeof SpecialCertificationApplicantAddModal>>()
// 新增
const onAdd = () => {
  SpecialCertificationApplicantAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: SpecialCertificationApplicantResp) => {
  SpecialCertificationApplicantAddModalRef.value?.onUpdate(record.id)
}

const SpecialCertificationApplicantDetailDrawerRef = ref<InstanceType<typeof SpecialCertificationApplicantDetailDrawer>>()
// 详情
const onDetail = (record: SpecialCertificationApplicantResp) => {
  SpecialCertificationApplicantDetailDrawerRef.value?.onOpen(record.id)
}

// 审核
const onAudit = (record: SpecialCertificationApplicantResp) => {
  SpecialCertificationApplicantAddModalRef.value?.onAudit(record.id)
}

// 批量审核弹窗相关
const batchAuditVisible = ref(false)
const batchAuditStatus = ref(1) // 1=通过, 2=不通过
const batchAuditReason = ref('')
const batchAuditLoading = ref(false)

// 批量审核
const onBatchAudit = () => {
  if (selectedKeys.value.length === 0) {
    Message.warning('请选择需要审核的记录')
    return
  }
  const selectedRows = dataList.value.filter(row => selectedKeys.value.includes(row.id))
  const hasNonPending = selectedRows.some(row => row.status !== 0)
  if (hasNonPending) {
    Message.warning('选中的记录中包含非未审核状态的数据，请重新选择')
    return
  }
  batchAuditStatus.value = 1
  batchAuditReason.value = ''
  batchAuditVisible.value = true
}

const handleBatchAudit = async () => {
  const unAuditedRows = dataList.value.filter(row => selectedKeys.value.includes(row.id) && row.status === 0)
  if (unAuditedRows.length === 0) {
    Message.warning('选中的记录中没有待审核的记录')
    batchAuditVisible.value = false
    return
  }
  if (batchAuditStatus.value === 2 && !batchAuditReason.value.trim()) {
    Message.warning('请填写不通过原因')
    return
  }
  batchAuditLoading.value = true
  try {
    const res = await batchAuditSpecialCertificationApplicant({
      ids: unAuditedRows.map(row => row.id),
      status: batchAuditStatus.value,
      reason: batchAuditStatus.value === 2 ? batchAuditReason.value : undefined
    })
    if (res.data.success) {
      Message.success('批量审核成功')
    } else {
      Message.error(res.data.msg || '批量审核失败')
    }
    batchAuditVisible.value = false  // 无论成功失败都关闭表单
    selectedKeys.value = []  // 清除选中的记录
    search()
  } catch (e) {
    Message.error('批量审核失败')
    batchAuditVisible.value = false  // 发生错误时也关闭表单
    selectedKeys.value = []  // 清除选中的记录
    search()
  } finally {
    batchAuditLoading.value = false
  }
}

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/images/ce853a5576cd3913a87d709a354cdef.png' // Replace this with your default image URL
  img.onerror = null // Prevent the default image from also failing and causing an infinite loop
}

</script>

<style scoped lang="scss"></style>
