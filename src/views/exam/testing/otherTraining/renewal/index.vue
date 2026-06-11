<template>
  <div class="gi_table_page">
    <GiTable title="换证培训管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search" :row-selection="rowSelection" @select="select"
      @select-all="selectAll">
      <template #toolbar-left>
        <a-input-search v-model="queryForm.title" placeholder="请输入通知内容" allow-clear @search="search" />
        <a-select v-model="queryForm.status" placeholder="通知状态" allow-clear class="search-input ml-2" @change="search"
          style="margin-left: 8px;">
          <a-option value="1">报名中</a-option>
          <a-option value="3">补报中</a-option>
          <a-option value="4">报名已结束</a-option>
        </a-select>
        <a-select v-model="queryForm.examLevel" placeholder="考试等级" allow-clear class="search-input ml-2"
          @change="search" style="margin-left: 8px;">
          <a-option value="1">Ⅰ级</a-option>
          <a-option value="2">Ⅱ级</a-option>
        </a-select>

        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
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
      <template #admissionTicketStatus="{ record }">
        <a-tag :color="getAdmissionTicketStatusColor(record.admissionTicketStatus)" bordered>
          {{ getAdmissionTicketStatusText(record.admissionTicketStatus) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['notice:otherTraining:detail']" title="详情" @click="onDetail(record)">详情</a-link>
        </a-space>
      </template>
    </GiTable>
    <OtherTrainingDetailModal ref="OtherTrainingDetailModalRef" />
  </div>
</template>

<script setup lang="ts">
import OtherTrainingDetailModal from '../OtherTrainingDetailModal.vue'
import { type ExamNoticeResp, type ExamNoticeQuery, deleteExamNotice, exportExamNotice, otherTrainingPage, auditExamNotice } from '@/apis/exam/examNotice'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamNotice' })

const OtherTrainingDetailModalRef = ref<InstanceType<typeof OtherTrainingDetailModal>>()

// 详情
const onDetail = (record: ExamNoticeResp) => {
  OtherTrainingDetailModalRef.value?.onOpen(record.id, record.title)
}

const queryForm = reactive<ExamNoticeQuery>({
  applyDeadline: undefined,
  examLevel: undefined,
  status: undefined,
  categoryId: 40,
  categoryType: 3,
})

const {
  tableData: dataList,
  search,
  handleDelete,
  selectedKeys,
  select,
  selectAll
} = useTable((page) => otherTrainingPage({ ...queryForm, ...page }), {
  immediate: true,
});
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
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['notice:otherTraining:detail'])
  }
]);

// 重置
const reset = () => {
  queryForm.title = undefined
  queryForm.applyDeadline = undefined
  queryForm.examLevel = undefined
  queryForm.status = undefined
  queryForm.categoryId = 39
  queryForm.categoryType = 3
  search()
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
    case 0: return 'blue'      // 待审核
    case 1: return 'green'      // 报名中
    case 2: return 'red'        // 审核未通过
    case 3: return 'blue'     // 补报中
    case 4: return 'red'       // 报名结束
    case 5: return 'orange'      // 已开考
    case 6: return 'default'    // 已结束
    default: return 'default'
  }
};

const getAdmissionTicketStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'red'
    case 1: return 'green'
    default: return 'default'
  }
};

const getAdmissionTicketStatusText = (status: number) => {
  switch (status) {
    case 0: return '未开启'
    case 1: return '已开启'
    default: return '未知状态'
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待审'
    case 1: return '报名中'
    case 2: return '已驳回'
    case 3: return '补报中'
    case 4: return '报名已结束'
    case 5: return '考试中'
    case 6: return '已结束'
    default: return '未知状态'
  }
};

</script>

<style scoped lang="scss"></style>