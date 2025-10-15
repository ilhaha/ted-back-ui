<template>
  <div class="gi_table_page">
    <GiTable
      title="复审管理"
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
      <template #toolbar-right>
  <!--        <a-button v-permission="['certificate:reexamine:add']" type="primary" @click="onAdd">-->
  <!--          <template #icon><icon-plus /></template>-->
  <!--          <template #default>新增</template>-->
  <!--        </a-button>-->
        <!-- <a-button v-permission="['certificate:reexamine:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link
        title="审核"
        @click="onExamine(record)"
          >
            {{ statusText }}
          </a-link>
        </a-space>
  </template>
      <template #certificateUrl="{ record }">
        <a-image
          :src="record.certificateUrl"
          :width="100"
          :height="100"
          fit="contain"
          style="object-fit: cover;"
        />
      </template>
      <template #applicantFormUrl="{ record }">
        <a-image
          :src="record.applicantFormUrl"
          :width="100"
          :height="100"
          fit="contain"
          style="object-fit: cover;"
        />
      </template>
      <template #reexaminStatus="{ record }">
        <a-tag :color="getStatusColor(record.reexaminStatus)">
          {{ getStatusText(record.reexaminStatus) }}
        </a-tag>
      </template>
    </GiTable>

    <ReexamineAddModal ref="ReexamineAddModalRef" @save-success="search" />
    <ReexamineDetailDrawer ref="ReexamineDetailDrawerRef" />
    <ReexamineAuditModal ref="auditModalRef" @save-success="search" />

    <a-modal
      v-model:visible="confirmVisible"
      :title="confirmTitle"
      @ok="handleConfirm"
      @cancel="handleCancel"
    >
      <p>{{ confirmContent }}</p>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import ReexamineAddModal from './ReexamineAddModal.vue'
import ReexamineDetailDrawer from './ReexamineDetailDrawer.vue'
import ReexamineAuditModal from './ReexamineAuditModal.vue'
import { type ReexamineResp, type ReexamineQuery, deleteReexamine, exportReexamine, listReexamine } from '@/apis/certificate/reexamine'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { Message } from '@arco-design/web-vue'

defineOptions({ name: 'Reexamine' })


const queryForm = reactive<ReexamineQuery>({
  sort: ['id,desc']
})

const reexaminStatus = ref('')

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listReexamine({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { 
    title: '复审人员', 
    dataIndex: 'applicantName', 
    slotName: 'applicantName' 
  },
  { 
    title: '证件名称', 
    dataIndex: 'certificateName', 
    slotName: 'certificateName' 
  },
  { 
    title: '作业人员资格证', 
    dataIndex: 'certificateUrl', 
    slotName: 'certificateUrl'
  },
  { 
    title: '复审资格申请表', 
    dataIndex: 'applicantFormUrl', 
    slotName: 'applicantFormUrl'
  },
  { 
    title: '审核状态', 
    dataIndex: 'reexaminStatus', 
    slotName: 'reexaminStatus'
  },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 100,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined
  }
]);

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: ReexamineResp) => {
  return handleDelete(() => deleteReexamine(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportReexamine(queryForm))
}

const ReexamineAddModalRef = ref<InstanceType<typeof ReexamineAddModal>>()
// 新增
const onAdd = () => {
  ReexamineAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ReexamineResp) => {
  ReexamineAddModalRef.value?.onUpdate(record.id)
}

const ReexamineDetailDrawerRef = ref<InstanceType<typeof ReexamineDetailDrawer>>()
// 详情
const onDetail = (record: ReexamineResp) => {
  ReexamineDetailDrawerRef.value?.onOpen(record.id)
}

const getStatusText = (status: number) => {
  reexaminStatus.value = status
  getStatus(status)
  switch (status) {
    case 0:
      return '待审核'
    case 1:
      return '已通过'
    case 2:
      return '未通过'
    default:
      return '未知状态'
  }
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'blue'    // 待审核用蓝色
    case 1:
      return 'green'   // 已通过用绿色
    case 2:
      return 'red'     // 未通过用红色
    default:
      return 'gray'
  }
}

// 确认弹窗相关的响应式变量
const confirmVisible = ref(false)
const confirmTitle = ref('')
const confirmContent = ref('')
const currentRecord = ref<any>(null)
const currentAction = ref('')

// 审核处理函数
const handleAudit = (record: ReexamineResp, status: string) => {
  currentRecord.value = record
  currentAction.value = status
  confirmTitle.value = status === '1' ? '审核通过确认' : '审核驳回确认'
  confirmContent.value = status === '1' 
    ? `是否确认通过 ${record.applicantName} 的复审申请？`
    : `是否确认驳回 ${record.applicantName} 的复审申请？`
  confirmVisible.value = true
}

// 审核模态框引用
const auditModalRef = ref<InstanceType<typeof ReexamineAuditModal>>()

const statusBool = ref(false)
const statusText = ref('')

const getStatus = async (status: string) => {
  if (status === '0') {
    statusBool.value = false
    statusText.value = '审核'
  }
  statusBool.value = true
  statusText.value = '已审核'
}

// 打开审核模态框
const onExamine = (record: ReexamineResp) => {
  if (statusBool.value) return
  auditModalRef.value?.onExamine(record.id)
}
</script>

<style scoped lang="scss">
.a-button {
  padding: 0 12px;
}

.arco-dropdown-option {
  padding: 8px 12px;
  cursor: pointer;
  
  &:hover {
    background-color: var(--color-fill-2);
  }

  .arco-icon {
    margin-right: 8px;
  }
}

.audit-content {
  padding: 16px;

  .audit-info {
    margin-bottom: 12px;
    font-size: 14px;
  }

  .audit-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 24px;

    .arco-btn {
      min-width: 100px;
    }
  }
}
</style>
