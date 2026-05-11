<template>
  <div class="gi_table_page">
    <GiTable title="无损检测、检验人员考试通知管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search" :row-selection="rowSelection" @select="select"
      @select-all="selectAll">
      <template #toolbar-left>
        <a-input-search v-model="queryForm.title" placeholder="请输入通知内容" allow-clear @search="search" />
        <a-select v-model="queryForm.status" placeholder="通知状态" allow-clear class="search-input ml-2" @change="search"
          style="margin-left: 8px;">
          <a-option value="0">待审</a-option>
          <a-option value="1">已发布</a-option>
          <a-option value="2">已驳回</a-option>
        </a-select>
        <a-select v-model="queryForm.examLevel" placeholder="考试等级" allow-clear class="search-input ml-2"
          @change="search" style="margin-left: 8px;">
          <a-option value="0">无</a-option>
          <a-option value="1">Ⅰ级</a-option>
          <a-option value="2">Ⅱ级</a-option>
        </a-select>

        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examNotice:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:examNotice:audit']" type="primary"  @click="onBatchAudit"
          :disabled="selectedKeys.length === 0">
          <template #icon><icon-check /></template>
          <template #default>批量审核</template>
        </a-button>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)" bordered>
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template #examLevel="{ record }">
        <a-tag :color="getExamLevelColor(record.examLevel)" bordered>
          {{ getExamLevelText(record.examLevel) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examNotice:update']" title="修改" @click="onUpdate(record)"
            v-if="record.status != 1">修改</a-link>
          <a-link v-permission="['exam:examNotice:audit']" title="审核" @click="onAudit(record)"
            v-if="record.status == 0">审核</a-link>
          <a-link v-permission="['exam:examNotice:delete']" status="danger" :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'" @click="onDelete(record)" v-if="record.status != 1">
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <a-modal v-model:visible="auditVisible" title="审核考试通知" :mask-closable="false" @before-ok="handleAudit"
      @cancel="auditVisible = false">
      <a-form :model="auditForm" auto-label-width>
        <a-form-item label="审核结果">
          <a-radio-group v-model="auditForm.status">
            <a-radio :value="1">通过</a-radio>
            <a-radio :value="2">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <ExamNoticeAddModal ref="ExamNoticeAddModalRef" @save-success="search" />
    <ExamNoticeDetailDrawer ref="ExamNoticeDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamNoticeAddModal from './ExamNoticeAddModal.vue'
import ExamNoticeDetailDrawer from './ExamNoticeDetailDrawer.vue'
import { Message } from '@arco-design/web-vue'
import { type ExamNoticeResp, type ExamNoticeQuery, deleteExamNotice, exportExamNotice, listExamNotice, auditExamNotice } from '@/apis/exam/examNotice'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamNotice' })


const queryForm = reactive<ExamNoticeQuery>({
  title: undefined,
  applyDeadline: undefined,
  examLevel: undefined,
  status: undefined,
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
} = useTable((page) => listExamNotice({ ...queryForm, ...page }), { immediate: true })

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
  // { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '通知内容', dataIndex: 'title', slotName: 'title' },
  { title: '报名截止时间', dataIndex: 'applyDeadline', slotName: 'applyDeadline' },
  { title: '所属类别', dataIndex: 'categoryName', slotName: 'categoryName' },
  { title: '考试项目', dataIndex: 'projectCodes', slotName: 'projectCodes' },
  { title: '考试等级', dataIndex: 'examLevel', slotName: 'examLevel' },
  { title: '说明', dataIndex: 'remark', slotName: 'remark' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160  ,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examNotice:detail', 'exam:examNotice:update', 'exam:examNotice:delete', 'exam:examNotice:audit'])
  }
]);

// 重置
const reset = () => {
  queryForm.title = undefined
  queryForm.applyDeadline = undefined
  queryForm.examLevel = undefined
  queryForm.status = undefined
  search()
}

// 删除
const onDelete = (record: ExamNoticeResp) => {
  return handleDelete(() => deleteExamNotice(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

const getExamLevelColor = (status: number) => {
  switch (status) {
    case 0:
      return "green"; // 无
    case 1:
      return "blue"; // I级
    case 2:
      return "orange"; // II级
    default:
      return "default";
  }
};

const getExamLevelText = (status: number) => {
  switch (status) {
    case 0:
      return "无";
    case 1:
      return "I级";
    case 2:
      return "Ⅱ级";
    default:
      return "未知等级";
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue"; // 待审
    case 1:
      return "green"; // 通过
    case 2:
      return "red"; // 驳回
    default:
      return "default";
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待审";
    case 1:
      return "已发布";
    case 2:
      return "已驳回";
    default:
      return "未知状态";
  }
};

// 导出
const onExport = () => {
  useDownload(() => exportExamNotice(queryForm))
}

const ExamNoticeAddModalRef = ref<InstanceType<typeof ExamNoticeAddModal>>()
// 新增
const onAdd = () => {
  ExamNoticeAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamNoticeResp) => {
  ExamNoticeAddModalRef.value?.onUpdate(record.id)
}

// 审核
const auditVisible = ref(false)
const auditForm = reactive({
  status: 1,
  ids: [] as string[]
})

const onAudit = (record: ExamNoticeResp) => {
  auditForm.ids = [record.id]
  auditForm.status = 1
  auditVisible.value = true
}

const onBatchAudit = () => {
  const pendingItems = dataList.value.filter((item: ExamNoticeResp) => selectedKeys.value.includes(item.id) && item.status === 0)
  if (pendingItems.length === 0) {
    Message.warning('请选择待审核的通知')
    return
  }
  if (pendingItems.length !== selectedKeys.value.length) {
    Message.warning('只能选择待审核的通知')
    return
  }
  auditForm.ids = selectedKeys.value
  auditForm.status = 1
  auditVisible.value = true
}

const handleAudit = async (done: (val: boolean) => void) => {
  await auditExamNotice({ ids: auditForm.ids, status: auditForm.status })
  Message.success(`已审核 ${auditForm.ids.length} 条`)
  auditVisible.value = false
  done(true)
  search()
}

const ExamNoticeDetailDrawerRef = ref<InstanceType<typeof ExamNoticeDetailDrawer>>()
// 详情
const onDetail = (record: ExamNoticeResp) => {
  ExamNoticeDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
