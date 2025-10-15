<template>
  <div class="gi_table_page">
    <GiTable
      title="学生培训管理"
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
	    <a-input-search v-model="queryForm.studentId" placeholder="请输入学生ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.trainingId" placeholder="请输入培训ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['training:studentTraining:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['training:studentTraining:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:studentTraining:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['training:studentTraining:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['training:studentTraining:delete']"
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

    <StudentTrainingAddModal ref="StudentTrainingAddModalRef" @save-success="search" />
    <StudentTrainingDetailDrawer ref="StudentTrainingDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import StudentTrainingAddModal from './StudentTrainingAddModal.vue'
import StudentTrainingDetailDrawer from './StudentTrainingDetailDrawer.vue'
import { type StudentTrainingResp, type StudentTrainingQuery, deleteStudentTraining, exportStudentTraining, listStudentTraining } from '@/apis/training/studentTraining'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'StudentTraining' })


const queryForm = reactive<StudentTrainingQuery>({
  studentId: undefined,
  trainingId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listStudentTraining({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '学生ID', dataIndex: 'studentId', slotName: 'studentId' },
  { title: '培训ID', dataIndex: 'trainingId', slotName: 'trainingId' },
  { title: '已学时长（秒）', dataIndex: 'totalDuration', slotName: 'totalDuration' },
  { title: '0-学习中 1-已完成 2-未开始', dataIndex: 'status', slotName: 'status' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '0-未删除 1-已删除', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:studentTraining:detail', 'training:studentTraining:update', 'training:studentTraining:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.studentId = undefined
  queryForm.trainingId = undefined
  search()
}

// 删除
const onDelete = (record: StudentTrainingResp) => {
  return handleDelete(() => deleteStudentTraining(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportStudentTraining(queryForm))
}

const StudentTrainingAddModalRef = ref<InstanceType<typeof StudentTrainingAddModal>>()
// 新增
const onAdd = () => {
  StudentTrainingAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: StudentTrainingResp) => {
  StudentTrainingAddModalRef.value?.onUpdate(record.id)
}

const StudentTrainingDetailDrawerRef = ref<InstanceType<typeof StudentTrainingDetailDrawer>>()
// 详情
const onDetail = (record: StudentTrainingResp) => {
  StudentTrainingDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
