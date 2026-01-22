<template>
  <div class="gi_table_page">
    <GiTable title="作业人员考试记录管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-space>
          <a-cascader v-model="queryForm.planId" :options="projectPlanList" placeholder="选择考试计划" allow-clear
            @change="search" class="search-input ml-2" />
          <a-input-search @search="search" v-model="queryForm.className" placeholder="搜索班级编号" allow-clear
            class="search-input ml-2" />
          <a-button @click="reset">
            <template #icon><icon-refresh /></template>
            <template #default>重置</template>
          </a-button>
        </a-space>
      </template>
      <!-- 报名 / 考试 / 缺考人数 -->
      <template #enrolledCount="{ record }">
        <a-space>
          <a-tag color="orange">{{ record.enrolledCount }}</a-tag>
          <a-divider direction="vertical" />
          <a-tag color="blue">{{ record.examCount - record.absentCount }}</a-tag>
          <a-divider direction="vertical" />
          <a-tag color="blue">{{ record.absentCount }}</a-tag>
        </a-space>
      </template>

      <!-- 总评（及格 / 不及格 / 待录入） -->
      <template #passedCount="{ record }">
        <a-space>
          <a-tag color="green">{{ record.passedCount }}</a-tag>
          <a-divider direction="vertical" />
          <a-tag color="red">{{ record.failedCount }}</a-tag>
          <a-divider direction="vertical" />
          <a-tag color="orange">{{ record.notEnteredCount }}</a-tag>
        </a-space>
      </template>

      <!-- 证书情况（已 / 未） -->
      <template #certificateGeneratedCount="{ record }">
        <a-space>
          <a-tag color="green">{{ record.certificateGeneratedCount }}</a-tag>
          <a-divider direction="vertical" />
          <a-tag color="red">{{ record.certificateNotGeneratedCount - record.failedCount - record.notEnteredCount
            }}</a-tag>
        </a-space>
      </template>


      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examRecords:detail']" title="详情" @click="onDetail(record)">详情</a-link>
        </a-space>
      </template>
    </GiTable>
    <a-modal v-model:visible="showRecordVisible" :title="title" :mask-closable="false" :esc-to-close="false" width="95%"
      draggable :footer="null" modal-class="no-padding-modal" @close="handleClose">
      <ExamRecordList ref="ExamRecordListRef" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getCascaderProjectPlan } from '@/apis/exam/examPlan'
import { getClassExamStatsPage } from '@/apis/exam/examPlan'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import ExamRecordList from './ExamRecordList.vue'
import {
  type ExamRecordsQuery
} from '@/apis/exam/examRecords'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamRecords' })

const queryForm = reactive<ExamRecordsQuery>({
  planId: '',
  className: ''
})

const projectPlanList = ref<any[]>([])
const showRecordVisible = ref(false)
const title = ref('')
const classId = ref('')

const ExamRecordListRef = ref<InstanceType<typeof ExamRecordList>>();

// 详情
const onDetail = (record: any) => {
  title.value = record.className + "班级考试记录"
  classId.value = record.classId
  showRecordVisible.value = true
  ExamRecordListRef.value?.onOpen(record.classId, record.id, record.hasOper, record.hasRoad);
}

const handleClose = () => {
  search()
  ExamRecordListRef.value?.afterClose();
}

// 初始化获取计划列表
onMounted(async () => {
  const res = await getCascaderProjectPlan(0);
  projectPlanList.value = res.data || [];
})


const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable(
  (page) => getClassExamStatsPage(
    { ...queryForm, ...page },
  ),
  { immediate: true },
)


const columns = ref<TableInstanceColumns[]>([
  { dataIndex: 'className', title: '班级编号' },
  { dataIndex: 'orgName', title: '机构名称' },
  { dataIndex: 'projectName', title: '考试项目' },
  { dataIndex: 'examPlanName', title: '考试计划' },
  { dataIndex: 'enrolledCount', slotName: 'enrolledCount', title: '报名 / 考试 / 缺考人数', align: 'center' },
  { dataIndex: 'passedCount', slotName: 'passedCount', title: '及格 / 不及格 / 待录入', align: 'center' },
  { dataIndex: 'certificateGeneratedCount', slotName: 'certificateGeneratedCount', title: '证书（已生成 / 待生成）', align: 'center' },
  {
    dataIndex: 'action',
    title: '操作',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examRecords:detail']),
  },
])


// 重置
const reset = () => {
  queryForm.planId = ''
  queryForm.className = ''
  search()
}


</script>

<style>
.no-padding-modal .arco-modal-body {
  padding: 0 !important;
}
</style>