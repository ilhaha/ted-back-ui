<template>
  <div class="gi_table_page">
    <GiTable
      title="考生-考试项目考试状态管理"
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
      <template #toolbar-left>
	    <a-input-search v-model="queryForm.candidateId" placeholder="请输入考生ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.projectId" placeholder="请输入考试项目ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.attemptNo" placeholder="请输入当前考试轮次（0表示未开始）" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.usedMakeup" placeholder="请输入当前轮次是否已补考：0-否 1-是" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.passed" placeholder="请输入是否通过：0-未通过 1-通过" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createTime" placeholder="请输入创建时间" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.updateTime" placeholder="请输入更新时间" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.isDeleted" placeholder="请输入删除标记(0未删,1已删)" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:candidateExamProject:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:candidateExamProject:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:candidateExamProject:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:candidateExamProject:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:candidateExamProject:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <CandidateExamProjectAddModal ref="CandidateExamProjectAddModalRef" @save-success="search" />
    <CandidateExamProjectDetailDrawer ref="CandidateExamProjectDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import CandidateExamProjectAddModal from './CandidateExamProjectAddModal.vue'
import CandidateExamProjectDetailDrawer from './CandidateExamProjectDetailDrawer.vue'
import { type CandidateExamProjectResp, type CandidateExamProjectQuery, deleteCandidateExamProject, exportCandidateExamProject, listCandidateExamProject } from '@/apis/exam/candidateExamProject'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'CandidateExamProject' })


const queryForm = reactive<CandidateExamProjectQuery>({
  candidateId: undefined,
  projectId: undefined,
  attemptNo: undefined,
  usedMakeup: undefined,
  passed: undefined,
  createTime: undefined,
  updateTime: undefined,
  isDeleted: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listCandidateExamProject({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '', dataIndex: 'id', slotName: 'id' },
  { title: '考生ID', dataIndex: 'candidateId', slotName: 'candidateId' },
  { title: '考试项目ID', dataIndex: 'projectId', slotName: 'projectId' },
  { title: '当前考试轮次（0表示未开始）', dataIndex: 'attemptNo', slotName: 'attemptNo' },
  { title: '当前轮次是否已补考：0-否 1-是', dataIndex: 'usedMakeup', slotName: 'usedMakeup' },
  { title: '是否通过：0-未通过 1-通过', dataIndex: 'passed', slotName: 'passed' },
  { title: '通过时间', dataIndex: 'passTime', slotName: 'passTime' },
  { title: '证书过期时间', dataIndex: 'certificateExpireTime', slotName: 'certificateExpireTime' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '删除标记(0未删,1已删)', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:candidateExamProject:detail', 'exam:candidateExamProject:update', 'exam:candidateExamProject:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.candidateId = undefined
  queryForm.projectId = undefined
  queryForm.attemptNo = undefined
  queryForm.usedMakeup = undefined
  queryForm.passed = undefined
  queryForm.createTime = undefined
  queryForm.updateTime = undefined
  queryForm.isDeleted = undefined
  search()
}

// 删除
const onDelete = (record: CandidateExamProjectResp) => {
  return handleDelete(() => deleteCandidateExamProject(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportCandidateExamProject(queryForm))
}

const CandidateExamProjectAddModalRef = ref<InstanceType<typeof CandidateExamProjectAddModal>>()
// 新增
const onAdd = () => {
  CandidateExamProjectAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CandidateExamProjectResp) => {
  CandidateExamProjectAddModalRef.value?.onUpdate(record.id)
}

const CandidateExamProjectDetailDrawerRef = ref<InstanceType<typeof CandidateExamProjectDetailDrawer>>()
// 详情
const onDetail = (record: CandidateExamProjectResp) => {
  CandidateExamProjectDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
