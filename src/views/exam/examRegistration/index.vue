<template>
  <div class="gi_table_page">
    <GiTable
      title="检验、检测考试项目记录管理"
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
	    <a-input-search v-model="queryForm.candidateId" placeholder="请输入考生id" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.projectId" placeholder="请输入项目id" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.planId" placeholder="请输入考试计划id" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.examStatus" placeholder="请输入考试状态：0待考、1待发布、2及格、3不及格" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.scoreStatus" placeholder="请输入成绩状态：0有效、1作废" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.examAttemptType" placeholder="请输入考试场次类型：0免考，1初试，2补考" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examRegistration:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:examRegistration:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examRegistration:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:examRegistration:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:examRegistration:delete']"
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

    <ExamRegistrationAddModal ref="ExamRegistrationAddModalRef" @save-success="search" />
    <ExamRegistrationDetailDrawer ref="ExamRegistrationDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamRegistrationAddModal from './ExamRegistrationAddModal.vue'
import ExamRegistrationDetailDrawer from './ExamRegistrationDetailDrawer.vue'
import { type ExamRegistrationResp, type ExamRegistrationQuery, deleteExamRegistration, exportExamRegistration, listExamRegistration } from '@/apis/exam/examRegistration'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamRegistration' })


const queryForm = reactive<ExamRegistrationQuery>({
  candidateId: undefined,
  projectId: undefined,
  planId: undefined,
  examStatus: undefined,
  scoreStatus: undefined,
  examAttemptType: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamRegistration({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: 'ID', dataIndex: 'id', slotName: 'id' },
  { title: '考生id', dataIndex: 'candidateId', slotName: 'candidateId' },
  { title: '项目id', dataIndex: 'projectId', slotName: 'projectId' },
  { title: '考试计划id', dataIndex: 'planId', slotName: 'planId' },
  { title: '报考类型位标识:0免考,1实操,2拍片,4评片,8开卷,16闭卷', dataIndex: 'practicalType', slotName: 'practicalType' },
  { title: '考试日期', dataIndex: 'examDate', slotName: 'examDate' },
  { title: '考试状态：0待考、1待发布、2及格、3不及格', dataIndex: 'examStatus', slotName: 'examStatus' },
  { title: '成绩状态：0有效、1作废', dataIndex: 'scoreStatus', slotName: 'scoreStatus' },
  { title: '考试场次类型：0免考，1初试，2补考', dataIndex: 'examAttemptType', slotName: 'examAttemptType' },
  { title: '创建时间戳', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间戳', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '删除标记', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examRegistration:detail', 'exam:examRegistration:update', 'exam:examRegistration:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.candidateId = undefined
  queryForm.projectId = undefined
  queryForm.planId = undefined
  queryForm.examStatus = undefined
  queryForm.scoreStatus = undefined
  queryForm.examAttemptType = undefined
  search()
}

// 删除
const onDelete = (record: ExamRegistrationResp) => {
  return handleDelete(() => deleteExamRegistration(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamRegistration(queryForm))
}

const ExamRegistrationAddModalRef = ref<InstanceType<typeof ExamRegistrationAddModal>>()
// 新增
const onAdd = () => {
  ExamRegistrationAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamRegistrationResp) => {
  ExamRegistrationAddModalRef.value?.onUpdate(record.id)
}

const ExamRegistrationDetailDrawerRef = ref<InstanceType<typeof ExamRegistrationDetailDrawer>>()
// 详情
const onDetail = (record: ExamRegistrationResp) => {
  ExamRegistrationDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
