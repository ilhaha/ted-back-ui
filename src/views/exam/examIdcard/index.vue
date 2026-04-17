<template>
  <div class="gi_table_page">
    <GiTable title="学历认证管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search" :row-selection="rowSelection" @select="select"
      @select-all="selectAll">
      <template #toolbar-left>
        <a-input-search v-model="queryForm.realName" placeholder="请输入姓名" allow-clear @search="search" />
        <a-input-search v-model="queryForm.idCardNumber" placeholder="请输入身份证号码" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
<template #toolbar-right>
        <!-- <a-button v-permission="['exam:examIdcard:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button> -->
        <!-- <a-button v-permission="['exam:examIdcard:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
        <a-button v-permission="['exam:examIdcard:audit']" type="primary" @click="onBatchAudit"
          :disabled="selectedKeys.length === 0">
          <template #icon><icon-check /></template>
          <template #default>批量审核</template>
        </a-button>
      </template>
      <template #educationCertificate="{ record }">
        <a-image v-if="record.educationCertificate" width="80" height="80" :src="record.educationCertificate"
          :preview="true" :preview-props="{
            actions: ['rotateRight', 'zoomIn', 'zoomOut', 'originalSize'],
          }" />
        <span v-else>-</span>
      </template>
      <template #educationVerifyStatus="{ record }">
        <a-tag :color="getStatusColor(record.educationVerifyStatus)" bordered>
          {{ getStatusText(record.educationVerifyStatus) }}
        </a-tag>
      </template>

      <template #action="{ record }">
        <a-space>
          <!-- <a-link v-permission="['exam:examIdcard:detail']" title="详情" @click="onDetail(record)">详情</a-link> -->
          <!-- <a-link v-permission="['exam:examIdcard:update']" title="修改" @click="onUpdate(record)">修改</a-link> -->
          <a-link v-permission="['exam:examIdcard:audit']" title="审核" @click="onAudit(record)"
            v-if="record.educationVerifyStatus == '0'">审核</a-link>
          <!-- <a-link
            v-permission="['exam:examIdcard:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link> -->
        </a-space>
      </template>
    </GiTable>

    <a-modal v-model:visible="auditVisible" title="审核学历认证" :mask-closable="false" @before-ok="handleAudit"
      @cancel="auditVisible = false">
      <a-form :model="auditForm" auto-label-width>
        <a-form-item label="审核结果">
          <a-radio-group v-model="auditForm.status">
            <a-radio :value="1">通过</a-radio>
            <a-radio :value="2">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="驳回理由" v-if="auditForm.status === 2" :rules="[{ required: true, message: '请填写驳回理由' }]">
          <a-textarea v-model="auditForm.remark" placeholder="请输入驳回理由" :max-length="200" show-word-limit :rows="3" />
        </a-form-item>
      </a-form>
    </a-modal>

    <ExamIdcardAddModal ref="ExamIdcardAddModalRef" @save-success="search" />
    <ExamIdcardDetailDrawer ref="ExamIdcardDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamIdcardAddModal from './ExamIdcardAddModal.vue'
import ExamIdcardDetailDrawer from './ExamIdcardDetailDrawer.vue'
import { Message } from '@arco-design/web-vue'
import { type ExamIdcardResp, type ExamIdcardQuery, deleteExamIdcard, exportExamIdcard, listExamIdcard, auditExamIdcard } from '@/apis/exam/examIdcard'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamIdcard' })

const queryForm = reactive<ExamIdcardQuery>({
  realName: undefined,
  idCardNumber: undefined,
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
} = useTable((page) => listExamIdcard({ ...queryForm, ...page }), { immediate: true })

const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedKeys,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  }
})

const columns = ref<TableInstanceColumns[]>([
  { title: '姓名', dataIndex: 'realName', slotName: 'realName' },
  { title: '性别', dataIndex: 'gender', slotName: 'gender' },
  { title: '身份证号码', dataIndex: 'idCardNumber', slotName: 'idCardNumber' },
  { title: '学历', dataIndex: 'education', slotName: 'education' },
  { title: '学信网学历验证报告', dataIndex: 'educationCertificate', slotName: 'educationCertificate' },
  { title: '认证状态', dataIndex: 'educationVerifyStatus', slotName: 'educationVerifyStatus' },
  { title: '提交时间', dataIndex: 'educationVerifyTime', slotName: 'educationVerifyTime' },
  { title: '驳回备注', dataIndex: 'educationVerifyRemark', slotName: 'educationVerifyRemark' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examIdcard:detail', 'exam:examIdcard:update', 'exam:examIdcard:delete', 'exam:examIdcard:audit'])
  }
])

// 重置
const reset = () => {
  queryForm.realName = undefined
  queryForm.idCardNumber = undefined
  search()
}

// 删除
const onDelete = (record: ExamIdcardResp) => {
  return handleDelete(() => deleteExamIdcard(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamIdcard(queryForm))
}

const ExamIdcardAddModalRef = ref<InstanceType<typeof ExamIdcardAddModal>>()
// 新增
const onAdd = () => {
  ExamIdcardAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamIdcardResp) => {
  ExamIdcardAddModalRef.value?.onUpdate(record.id)
}

const ExamIdcardDetailDrawerRef = ref<InstanceType<typeof ExamIdcardDetailDrawer>>()
// 详情
const onDetail = (record: ExamIdcardResp) => {
  ExamIdcardDetailDrawerRef.value?.onOpen(record.id)
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue"; // 待审
    case 1:
      return "green"; // 已认证
    case 2:
      return "red"; // 已驳回
    case 3:
      return "blue"; // 待认证
    default:
      return "default";
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待审";
    case 1:
      return "已认证";
    case 2:
      return "已驳回";
    case 3:
      return "待认证";
    default:
      return "未知状态";
  }
}

// 审核
const auditVisible = ref(false)
const auditForm = reactive({
  status: 1,
  remark: '',
  ids: [] as string[]
})

const onAudit = (record: ExamIdcardResp) => {
  auditForm.ids = [record.id]
  auditForm.status = 1
  auditVisible.value = true
}

const onBatchAudit = () => {
  const pendingItems = dataList.value.filter((item: ExamIdcardResp) => selectedKeys.value.includes(item.id) && item.educationVerifyStatus == '0')
  if (pendingItems.length === 0) {
    Message.warning('请选择待审核的记录')
    return
  }
  if (pendingItems.length !== selectedKeys.value.length) {
    Message.warning('只能选择待审核的记录')
    return
  }
  auditForm.ids = selectedKeys.value
  auditForm.status = 1
  auditVisible.value = true
}

const handleAudit = async (done: (val: boolean) => void) => {
  try {
    await auditExamIdcard({ ids: auditForm.ids, status: auditForm.status, remark: auditForm.remark || undefined })
    Message.success(`已审核 ${auditForm.ids.length} 条`)
    auditVisible.value = false
    auditForm.remark = ''
    done(true)
    search()
  } catch (error) {
    done(false)
  }
}
</script>

<style scoped lang="scss"></style>
