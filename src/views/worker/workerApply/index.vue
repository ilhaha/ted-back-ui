<template>
  <div class="gi_table_page">
    <GiTable title="作业人员报名资料管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-cascader v-model="queryForm.classId" :options="orgCategoryClassOptions" placeholder="请选择班级" allow-clear
          @change="search" />
        <a-input-search v-model="queryForm.className" placeholder="请输入班级编号" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #pendingReviewCount="{ record }">
        <a-tag color="blue">
          {{ record.pendingReviewCount }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['worker:workerApply:review']" title="审核" @click="openDocList(record)">{{
            record.pendingReviewCount > 0 ?
              '审核' : '详情' }}</a-link>
        </a-space>
      </template>
    </GiTable>

    <a-modal v-model:visible="showDocListVisible" :title="title" :mask-closable="false" :esc-to-close="false"
      width="95%" draggable :footer="null" modal-class="no-padding-modal" @close="search">
      <SubmitDocList ref="submitDocListRef" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { type OrgClassResp, type OrgClassQuery, listOrgClassWorker } from '@/apis/training/orgClass'
import { getSelectOrgProjectClass } from '@/apis/training/org'
import SubmitDocList from './SubmitDocList.vue'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { useDownload, useTable } from '@/hooks'

defineOptions({ name: 'ClassApplyMaterials' })

const queryForm = reactive<OrgClassQuery>({
  className: undefined,
  classId: undefined,
  isOrgQuery: false,
  flag: 1
})
const title = ref("")
const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable((page) => listOrgClassWorker({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '班级编号', dataIndex: 'className', slotName: 'className', },
  { title: '机构代号', dataIndex: 'orgCode', slotName: 'orgCode' },
  { title: '机构名称', dataIndex: 'orgName', slotName: 'orgName' },
  { title: '报考项目', dataIndex: 'projectName', slotName: 'projectName' },
  { title: '待审核数', dataIndex: 'pendingReviewCount', slotName: 'pendingReviewCount' },
  { title: '提交时间', dataIndex: 'docSubmitTime', slotName: 'docSubmitTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['worker:workerApply:review'])
  }
]);


const orgCategoryClassOptions = ref<any[]>([])
const showDocListVisible = ref(false);
// 查看作业人员名单
const submitDocListRef = ref<InstanceType<typeof SubmitDocList>>()

const openDocList = (record: any) => {
  submitDocListRef.value?.onOpen(record.id,record.projectId)
  title.value = record.className + "考生报考资料"
  showDocListVisible.value = true

}



// 重置
const reset = () => {
  queryForm.classId = undefined
  queryForm.className = undefined
  search()
}

onMounted(async () => {
  const res = await getSelectOrgProjectClass(0)
  orgCategoryClassOptions.value = res.data
})
</script>

<style>
.no-padding-modal .arco-modal-body {
  padding: 0 !important;
}
</style>
