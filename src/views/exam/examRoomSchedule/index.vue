<template>
  <div class="gi_table_page">
    <GiTable
      title="检验检测人员考试考场安排管理"
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
	    <a-input-search v-model="queryForm.noticeId" placeholder="请输入通知ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.projectId" placeholder="请输入项目ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.practicalType" placeholder="请输入报考类型位标识:1实操,2拍片,4评片,8开卷,16闭卷" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createUser" placeholder="请输入创建人ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examRoomSchedule:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:examRoomSchedule:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examRoomSchedule:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:examRoomSchedule:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:examRoomSchedule:delete']"
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

    <ExamRoomScheduleAddModal ref="ExamRoomScheduleAddModalRef" @save-success="search" />
    <ExamRoomScheduleDetailDrawer ref="ExamRoomScheduleDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamRoomScheduleAddModal from './ExamRoomScheduleAddModal.vue'
import ExamRoomScheduleDetailDrawer from './ExamRoomScheduleDetailDrawer.vue'
import { type ExamRoomScheduleResp, type ExamRoomScheduleQuery, deleteExamRoomSchedule, exportExamRoomSchedule, listExamRoomSchedule } from '@/apis/exam/examRoomSchedule'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamRoomSchedule' })


const queryForm = reactive<ExamRoomScheduleQuery>({
  noticeId: undefined,
  projectId: undefined,
  practicalType: undefined,
  createUser: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamRoomSchedule({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '通知ID', dataIndex: 'noticeId', slotName: 'noticeId' },
  { title: '项目ID', dataIndex: 'projectId', slotName: 'projectId' },
  { title: '报考类型位标识:1实操,2拍片,4评片,8开卷,16闭卷', dataIndex: 'practicalType', slotName: 'practicalType' },
  { title: '考场ID', dataIndex: 'examRoomId', slotName: 'examRoomId' },
  { title: '考试时间', dataIndex: 'examTime', slotName: 'examTime' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '是否删除（0-未删除，1-已删除）', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examRoomSchedule:detail', 'exam:examRoomSchedule:update', 'exam:examRoomSchedule:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.noticeId = undefined
  queryForm.projectId = undefined
  queryForm.practicalType = undefined
  queryForm.createUser = undefined
  search()
}

// 删除
const onDelete = (record: ExamRoomScheduleResp) => {
  return handleDelete(() => deleteExamRoomSchedule(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamRoomSchedule(queryForm))
}

const ExamRoomScheduleAddModalRef = ref<InstanceType<typeof ExamRoomScheduleAddModal>>()
// 新增
const onAdd = () => {
  ExamRoomScheduleAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamRoomScheduleResp) => {
  ExamRoomScheduleAddModalRef.value?.onUpdate(record.id)
}

const ExamRoomScheduleDetailDrawerRef = ref<InstanceType<typeof ExamRoomScheduleDetailDrawer>>()
// 详情
const onDetail = (record: ExamRoomScheduleResp) => {
  ExamRoomScheduleDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
