<template>
  <div class="gi_table_page">
    <GiTable title="" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-select v-model="queryForm.status" placeholder="报考状态" allow-clear class="search-input ml-2" @change="search">
          <a-option :value="1">待审核</a-option>
          <a-option :value="2">已通过</a-option>
          <a-option :value="3">已驳回</a-option>
        </a-select>
        <a-input-search v-model="queryForm.nickname" placeholder="请输入考生姓名" allow-clear @search="search" />
        <a-input-search v-model="queryForm.username" placeholder="请输入身份证" allow-clear @search="search" />

        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #noticeExamProjectList="{ record }">
        <a-tag v-if="!record.noticeExamProjectList || record.noticeExamProjectList.length === 0">-</a-tag>
        <div v-else class="project-tags-wrap">
          <a-tag v-for="item in record.noticeExamProjectList" :key="item.projectId"
            class="project-tag"
            :color="getProjectColor(item.isApply, item.examAttemptType)">
            {{ item.projectCode }}
          </a-tag>
        </div>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">{{ getStatusText(record.status) }}</a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examineeNoticeApply:detail']" title="查看" @click="onDetail(record)"
            :loading="detailLoading">查看</a-link>
        </a-space>
      </template>
    </GiTable>
    <ExamineeNoticeApplyDetailModal ref="ExamineeNoticeApplyDetailModalRef" @refresh-list="refresh" />
  </div>
</template>

<script setup lang="ts">
import { type ExamineeNoticeApplyResp, type ExamineeNoticeApplyQuery, getNoticeApplyCandidatePage } from '@/apis/exam/examineeNoticeApply'
import ExamineeNoticeApplyDetailModal from './ExamineeNoticeApplyDetailModal.vue'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamineeNoticeApply' })

const props = defineProps<{
  noticeId?: string
}>()

const queryForm = reactive<ExamineeNoticeApplyQuery>({
  noticeId: undefined,
  status: 1,
  username: undefined,
  nickname: undefined
})

watch(() => props.noticeId, (val) => {
  if (val) {
    queryForm.noticeId = val
    search()
  }
}, { immediate: true })

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  refresh,
} = useTable((page) => getNoticeApplyCandidatePage({ ...queryForm, ...page }), { immediate: false })
const columns = ref<TableInstanceColumns[]>([
  { title: '序号', dataIndex: 'sort', slotName: 'sort', width: 80 },
  { title: '身份证号', dataIndex: 'username', slotName: 'username' },
  { title: '姓名', dataIndex: 'nickname', slotName: 'nickname', width: 150 },
  { title: '报考项目', dataIndex: 'noticeExamProjectList', slotName: 'noticeExamProjectList', width: 200 },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '驳回原因', dataIndex: 'remark', slotName: 'remark' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examineeNoticeApply:detail', 'exam:examineeNoticeApply:update', 'exam:examineeNoticeApply:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.status = 1
  queryForm.nickname = undefined
  queryForm.username = undefined
  search()
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'default'     // 待报名
    case 1: return 'arcoblue'    // 报名待审核
    case 2: return 'green'       // 报名审核通过
    case 3: return 'red'         // 报名审核未通过
    case 4: return 'orange'      // 完成部分项目考试
    case 5: return 'green'       // 已完成全部考试
    default: return 'default'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待报名'
    case 1: return '待审核'
    case 2: return '已通过'
    case 3: return '驳回'
    case 4: return '完成部分项目考试'
    case 5: return '已完成全部考试'
    default: return '未知状态'
  }
}

const getProjectColor = (isApply: boolean, examAttemptType: number | null) => {
  if (!isApply) return 'gray'
  if (examAttemptType === 1) return 'green'
  if (examAttemptType === 2) return 'gold'
  return 'green'
}

const ExamineeNoticeApplyDetailModalRef = ref<InstanceType<typeof ExamineeNoticeApplyDetailModal>>()

// 详情
const onDetail = (record: ExamineeNoticeApplyResp) => {
  ExamineeNoticeApplyDetailModalRef.value?.onOpen(record.id)
}
const onDrawerClose = () => {
  reset()
}
defineExpose({
  onDrawerClose
})
</script>

<style scoped lang="scss">
.project-tags-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 4px;
}
.project-tag {
  margin: 0 !important;
}
</style>
