<template>
  <div class="gi_table_page">
    <GiTable title="考试计划查询" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-range-picker v-model="examDateRange" format="YYYY-MM-DD" value-format="YYYY-MM-DD" class="search-input"
          style="width: 260px" @change="search" />
        <a-select v-model="queryForm.categoryId" placeholder="考核项目种类" allow-clear class="search-input ml-2"
          @change="search" :options="categoryOptions">
        </a-select>
        <a-input-search v-model="queryForm.planName" placeholder="请输入考试计划名称" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #totalClassCount="{ record }">
        <a-space>
          <a-tag color="orange">{{ record.totalClassCount }}</a-tag>
          <a-divider direction="vertical" />
          <a-tag color="blue">{{ record.confirmedClassCount }}</a-tag>
          <a-divider direction="vertical" />
          <a-tag color="red">{{ record.unconfirmedClassCount }}</a-tag>
        </a-space>
      </template>
      <template #totalCandidateCount="{ record }">
        <a-space>
          <a-tag color="blue">{{ record.totalCandidateCount }}</a-tag>
        </a-space>
      </template>
      <template #passCount="{ record }">
        <a-space>
          <a-tag color="green">{{ record.passCount }}</a-tag>
          <a-divider direction="vertical" />
          <a-tag color="red">{{ record.failCount }}</a-tag>
        </a-space>
      </template>

      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:planApplyClass:detail']" title="详情" @click="onDetail(record)">详情</a-link>
        </a-space>
      </template>
    </GiTable>

    <PlanApplyClassAddModal ref="PlanApplyClassAddModalRef" @save-success="search" />
    <PlanApplyClassDetailDrawer ref="PlanApplyClassDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import PlanApplyClassAddModal from './PlanApplyClassAddModal.vue'
import PlanApplyClassDetailDrawer from './PlanApplyClassDetailDrawer.vue'
import { type PlanApplyClassResp, type PlanApplyClassQuery, deletePlanApplyClass, exportPlanApplyClass, listPlanApplyClass } from '@/apis/exam/planApplyClass'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { selectOptions } from "@/apis/exam/category";

defineOptions({ name: 'PlanApplyClass' })


const queryForm = reactive<PlanApplyClassQuery>({
  planName: undefined,
  examStartDate: undefined,
  examEndDate: undefined,
  categoryId: undefined
})

const categoryOptions = ref<any[]>([]);


const examDateRange = ref<[string, string] | undefined>(undefined)

// 格式化查询参数
const formattedQueryParams = computed(() => {
  const params: PlanApplyClassQuery = { ...queryForm }
  if (examDateRange.value && examDateRange.value.length === 2) {
    params.examStartDate = examDateRange.value[0] + ' 00:00:00'
    params.examEndDate = examDateRange.value[1] + ' 23:59:59'
  } else {
    params.examStartDate = undefined
    params.examEndDate = undefined
  }
  return params
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listPlanApplyClass({ ...formattedQueryParams.value, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '考试计划名称', dataIndex: 'examPlanName', slotName: 'examPlanName' },
  { title: '项目名称', dataIndex: 'projectName', slotName: 'projectName' },
  { title: '考核项目种类名称', dataIndex: 'categoryName', slotName: 'categoryName' },
  { title: '班级数 (总 / 已 / 未)', dataIndex: 'totalClassCount', slotName: 'totalClassCount', align: "center", },
  { title: '已确认考生数', dataIndex: 'totalCandidateCount', slotName: 'totalCandidateCount', align: "center", },
  { title: '及格 / 不及格', dataIndex: 'passCount', slotName: 'passCount', align: "center", },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:planApplyClass:detail', 'exam:planApplyClass:update', 'exam:planApplyClass:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.planName = undefined
  queryForm.examStartDate = undefined
  queryForm.examEndDate = undefined
  queryForm.categoryId = undefined
  examDateRange.value = undefined
  search()
}

// 删除
const onDelete = (record: PlanApplyClassResp) => {
  return handleDelete(() => deletePlanApplyClass(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}


const PlanApplyClassDetailDrawerRef = ref<InstanceType<typeof PlanApplyClassDetailDrawer>>()
// 详情
const onDetail = (record: PlanApplyClassResp) => {
  PlanApplyClassDetailDrawerRef.value?.onOpen(record.planId, record.examPlanName)
}

const getcategoryOptions = async () => {
  const res = await selectOptions([1, 2]);
  categoryOptions.value = res.data || [];
};

onMounted(() => {
  getcategoryOptions();
});
</script>

<style scoped lang="scss"></style>
