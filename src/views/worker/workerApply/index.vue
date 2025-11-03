<template>
  <div class="gi_table_page">
    <GiTable
      title="作业人员报名管理"
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
	    <a-input-search v-model="queryForm.classId" placeholder="请输入报考项目ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.candidateName" placeholder="请输入作业人员姓名" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.gender" placeholder="请输入作业人员性别" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.phone" placeholder="请输入作业人员手机号" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.qualificationName" placeholder="请输入报名资格申请表名称" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.idCardNumber" placeholder="请输入身份证号" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.idCardPhotoFront" placeholder="请输入身份证正面存储地址" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.idCardPhotoBack" placeholder="请输入身份证反面存储地址" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.facePhoto" placeholder="请输入一寸免冠照存储地址" allow-clear @search="search" />
        <a-select
          v-model="queryForm.status"
          :options="status_enum"
          placeholder="请选择审核状态:0待审核,1已生效,2未通过"
          allow-clear
          style="width: 150px"
          @change="search"
        />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['worker:workerApply:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['worker:workerApply:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['worker:workerApply:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['worker:workerApply:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['worker:workerApply:delete']"
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

    <WorkerApplyAddModal ref="WorkerApplyAddModalRef" @save-success="search" />
    <WorkerApplyDetailDrawer ref="WorkerApplyDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import WorkerApplyAddModal from './WorkerApplyAddModal.vue'
import WorkerApplyDetailDrawer from './WorkerApplyDetailDrawer.vue'
import { type WorkerApplyResp, type WorkerApplyQuery, deleteWorkerApply, exportWorkerApply, listWorkerApply } from '@/apis/worker/workerApply'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'WorkerApply' })


const queryForm = reactive<WorkerApplyQuery>({
  classId: undefined,
  candidateName: undefined,
  gender: undefined,
  phone: undefined,
  qualificationName: undefined,
  idCardNumber: undefined,
  idCardPhotoFront: undefined,
  idCardPhotoBack: undefined,
  facePhoto: undefined,
  status: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listWorkerApply({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '报考项目ID', dataIndex: 'classId', slotName: 'classId' },
  { title: '作业人员姓名', dataIndex: 'candidateName', slotName: 'candidateName' },
  { title: '作业人员性别', dataIndex: 'gender', slotName: 'gender' },
  { title: '作业人员手机号', dataIndex: 'phone', slotName: 'phone' },
  { title: '报名资格申请表路径', dataIndex: 'qualificationPath', slotName: 'qualificationPath' },
  { title: '报名资格申请表名称', dataIndex: 'qualificationName', slotName: 'qualificationName' },
  { title: '身份证号', dataIndex: 'idCardNumber', slotName: 'idCardNumber' },
  { title: '身份证正面存储地址', dataIndex: 'idCardPhotoFront', slotName: 'idCardPhotoFront' },
  { title: '身份证反面存储地址', dataIndex: 'idCardPhotoBack', slotName: 'idCardPhotoBack' },
  { title: '一寸免冠照存储地址', dataIndex: 'facePhoto', slotName: 'facePhoto' },
  { title: '审核状态:0待审核,1已生效,2未通过', dataIndex: 'status', slotName: 'status' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '删除标记(0未删,1已删)', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['worker:workerApply:detail', 'worker:workerApply:update', 'worker:workerApply:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.classId = undefined
  queryForm.candidateName = undefined
  queryForm.gender = undefined
  queryForm.phone = undefined
  queryForm.qualificationName = undefined
  queryForm.idCardNumber = undefined
  queryForm.idCardPhotoFront = undefined
  queryForm.idCardPhotoBack = undefined
  queryForm.facePhoto = undefined
  queryForm.status = undefined
  search()
}

// 删除
const onDelete = (record: WorkerApplyResp) => {
  return handleDelete(() => deleteWorkerApply(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportWorkerApply(queryForm))
}

const WorkerApplyAddModalRef = ref<InstanceType<typeof WorkerApplyAddModal>>()
// 新增
const onAdd = () => {
  WorkerApplyAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: WorkerApplyResp) => {
  WorkerApplyAddModalRef.value?.onUpdate(record.id)
}

const WorkerApplyDetailDrawerRef = ref<InstanceType<typeof WorkerApplyDetailDrawer>>()
// 详情
const onDetail = (record: WorkerApplyResp) => {
  WorkerApplyDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
