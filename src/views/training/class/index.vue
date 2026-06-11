<template>
  <div class="gi_table_page">
    <GiTable title="班级管理" row-key="id" :data="dataList" :columns="tableColumns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">

      <template #toolbar-left>
        <!-- <a-select v-model="queryForm.classType" placeholder="班级类型" allow-clear class="search-input ml-2"
          @change="search">
          <a-option value="0">作业班</a-option>
          <a-option value="1">检验班</a-option>
        </a-select> -->
        <a-input-search v-model="queryForm.orgName" placeholder="请输入班级所属机构" allow-clear @search="search" />
        <a-cascader v-model="queryForm.projectId" :options="categoryOptions" placeholder="请选择考试项目" allow-clear
          @change="search" />
        <a-input-search v-model="queryForm.className" placeholder="请输入班级编号" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>

      <template #classType="{ record }">
        <a-tag :color="getClassTypeColor(record.classType)">
          {{ getClassTypeText(record.classType) }}
        </a-tag>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template #payStatus="{ record }">
        <a-tag :color="getPayStatusColor(record.payStatus)">
          {{ getPayStatusText(record.payStatus) }}
        </a-tag>
      </template>
      <template #workerStatusCount="{ record }">
        <a-tag color="blue">
          {{ record.workerCount }}
        </a-tag>
        <a-divider direction="vertical" />
        <a-tag color="orange">
          {{ record.waitUploadCount + record.rejectedCount + record.waitCompleteCount }}
        </a-tag>
        <a-divider direction="vertical" />
        <a-tag color="purple">
          {{ record.pendingReviewCount +
            record.uploadedCount }}
        </a-tag>
      </template>

      <template #action="{ record }">
        <div v-if="record.classType === 0">
          <a-space>
            <a-link v-permission="['worker:workerApply:personList']" title="班级人员"
              @click="openWorkerList(record.id, record.projectId)">班级人员</a-link>
          </a-space>
        </div>
      </template>

    </GiTable>
    <a-modal v-model:visible="showWokerListVisible" title="班级人员" :mask-closable="false" :esc-to-close="false"
      width="95%" draggable :footer="null" modal-class="no-padding-modal" @close="search">
      <WokerList ref="WokerListRef" />
    </a-modal>



  </div>
</template>

<script setup lang="ts">
import WokerList from '@/views/workerApply/index.vue'
import { type OrgClassResp, type OrgClassQuery, deleteOrgClass, exportOrgClass, listOrgClass } from '@/apis/training/orgClass'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { type ProjectCategoryVO, getSelectCategoryProject } from '@/apis/training/org'
import { useDownload, useTable } from '@/hooks'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { Message } from '@arco-design/web-vue'

defineOptions({ name: 'OrgClass' })

const emit = defineEmits<{
  (e: 'setImportLoading', payload: any): void
}>()


const queryForm = reactive<OrgClassQuery>({
  projectId: undefined,
  className: undefined,
  classType: "0",
  isOrgQuery: false,
  orgName: undefined,
  flag: 3
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listOrgClass({ ...queryForm, ...page }), { immediate: true })

const tableColumns = computed(() => {
  const cols: TableInstanceColumns[] = [
    { title: '所属机构', dataIndex: 'orgName', slotName: 'orgName' },
    { title: '考试项目', dataIndex: 'projectName', slotName: 'projectName' },
    { title: '班级编号', dataIndex: 'className', slotName: 'className' },
    // { title: '班级类型', dataIndex: 'classType', slotName: 'classType' },

  ];

  // 只在 classType 为 0 时显示
  if (queryForm.classType === "0") {
    cols.push(
      { title: '总人数 / 待上传 / 待审', dataIndex: 'workerStatusCount', slotName: 'workerStatusCount' },
    );
  }
  cols.push(
    { title: '报名状态', dataIndex: 'status', slotName: 'status' },
    { title: '缴费状态', dataIndex: 'payStatus', slotName: 'payStatus' },
    { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  );
  // 操作列
  if (has.hasPermOr(['worker:workerApply:personList', 'training:orgClass:improtWorker', 'training:orgClass:submitDoc'])) {
    cols.push({
      title: '操作',
      dataIndex: 'action',
      slotName: 'action',
      align: 'center',
      fixed: !isMobile() ? 'right' : undefined
    });
  }

  return cols;
});




const showWokerListVisible = ref(false)
// 查看作业人员名单
const WokerListRef = ref<InstanceType<typeof WokerList>>()
const openWorkerList = (classId: string, projectId: string) => {
  WokerListRef.value?.onOpen(classId, projectId)
  showWokerListVisible.value = true
}

const categoryOptions = ref<ProjectCategoryVO[]>([])


// 重置
const reset = () => {
  queryForm.projectId = undefined
  queryForm.className = undefined
  queryForm.classType = "0"
  queryForm.orgName = undefined
  search()
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'green'
    case 1:
      return 'red'
    default:
      return 'gray'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '可报名'
    case 1:
      return '暂停报名'
    default:
      return ''
  }
}

const getPayStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '待缴费'
    case 1:
      return '待审核'
    case 2:
      return '已缴费'
    case 3:
      return '免缴'
    case 4:
      return '待补正'
    default:
      return '未知'
  }
}


const getPayStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'red'      // 未缴费（异常/待处理）
    case 1:
      return 'blue'   // 待审核
    case 2:
      return 'green'    // 已缴费
    case 3:
      return 'green'     // 免缴
    case 4:
      return 'red'     // 审核未通过
    default:
      return 'gray'
  }
}



const getClassTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return 'blue'
    case 1:
      return 'orange'
    default:
      return 'gray'
  }
}

const getClassTypeText = (status: number) => {
  switch (status) {
    case 0:
      return '作业班'
    case 1:
      return '检验班'
    default:
      return ''
  }
}
onMounted(async () => {
  const res = await getSelectCategoryProject()
  categoryOptions.value = res.data
})

</script>

<style scoped lang="scss"></style>