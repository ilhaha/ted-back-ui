<template>
  <div class="gi_table_page">
    <GiTable title="在线补报 - 取证管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-input-search v-model="queryForm.title" placeholder="请输入通知内容" allow-clear @search="search" />
        <a-select v-model="queryForm.status" placeholder="通知状态" allow-clear class="search-input ml-2" @change="search"
          style="margin-left: 8px;">
          <a-option value="3">补报中</a-option>
          <a-option value="4">报名已结束</a-option>
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
          <a-link v-permission="['noticeApply:supplementaryReport:open']" title="开启补报" :loading="actionLoading"
            @click="onOpenSupplementary(record)" v-if="record.status == 4">开启补报</a-link>
          <a-link v-permission="['noticeApply:supplementaryReport:close']" title="关闭补报" :loading="actionLoading"
            @click="onCloseSupplementary(record)" v-if="record.status == 3" status="danger">关闭补报</a-link>
        </a-space>
      </template>
    </GiTable>
  </div>
</template>

<script setup lang="ts">
import { type ExamNoticeResp, type ExamNoticeQuery, deleteExamNotice, exportExamNotice, supplementaryReportPage, openOrCloseSupplementaryReport } from '@/apis/exam/examNotice'
import { Message } from '@arco-design/web-vue'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamNotice' })

const actionLoading = ref(false)

const queryForm = reactive<ExamNoticeQuery>({
  title: undefined,
  applyDeadline: undefined,
  examLevel: undefined,
  status: undefined,
  examType: 1
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  refresh,
  handleDelete
} = useTable((page) => supplementaryReportPage({ ...queryForm, ...page }), { immediate: true })

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
    width: 200,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['noticeApply:supplementaryReport:detail', 'noticeApply:supplementaryReport:open', 'noticeApply:supplementaryReport:close'])
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
    case 1:
      return "green";
    case 3:
      return "blue";
    case 4:
      return "red";

    default:
      return "default";
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return "报名中";
    case 3:
      return "补报中";
    case 4:
      return "报名已结束";
    default:
      return "未知状态";
  }
};


// 开启补报
const onOpenSupplementary = async (record: ExamNoticeResp) => {
  actionLoading.value = true
  try {
    const res = await openOrCloseSupplementaryReport(record.id, 3)
    if (res.code === '0') {
      Message.success('已开启')
      search()
    }
  } finally {
    actionLoading.value = false
  }
}

// 关闭补报
const onCloseSupplementary = async (record: ExamNoticeResp) => {
  actionLoading.value = true
  try {
    const res = await openOrCloseSupplementaryReport(record.id, 4)
    if (res.code === '0') {
      Message.success('已关闭')
      search()
    }
  } finally {
    actionLoading.value = false
  }
}

</script>

<style scoped lang="scss"></style>