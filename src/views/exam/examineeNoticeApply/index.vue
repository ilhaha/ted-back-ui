<template>
  <div class="gi_table_page">
    <GiTable
      title="考生资料关系管理"
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
	    <a-input-search v-model="queryForm.examineeId" placeholder="请输入考生ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.noticeId" placeholder="请输入通知ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.status" placeholder="请输入状态:0待报名,1报名待审核,2报名审核通过,3报名审核未通过,4完成部分项目考试,5已完成全部考试" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examineeNoticeApply:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:examineeNoticeApply:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examineeNoticeApply:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:examineeNoticeApply:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:examineeNoticeApply:delete']"
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

    <ExamineeNoticeApplyAddModal ref="ExamineeNoticeApplyAddModalRef" @save-success="search" />
    <ExamineeNoticeApplyDetailDrawer ref="ExamineeNoticeApplyDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamineeNoticeApplyAddModal from './ExamineeNoticeApplyAddModal.vue'
import ExamineeNoticeApplyDetailDrawer from './ExamineeNoticeApplyDetailDrawer.vue'
import { type ExamineeNoticeApplyResp, type ExamineeNoticeApplyQuery, deleteExamineeNoticeApply, exportExamineeNoticeApply, listExamineeNoticeApply } from '@/apis/exam/examineeNoticeApply'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamineeNoticeApply' })


const queryForm = reactive<ExamineeNoticeApplyQuery>({
  examineeId: undefined,
  noticeId: undefined,
  status: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamineeNoticeApply({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '关联ID', dataIndex: 'id', slotName: 'id' },
  { title: '考生ID', dataIndex: 'examineeId', slotName: 'examineeId' },
  { title: '通知ID', dataIndex: 'noticeId', slotName: 'noticeId' },
  { title: '状态:0待报名,1报名待审核,2报名审核通过,3报名审核未通过,4完成部分项目考试,5已完成全部考试', dataIndex: 'status', slotName: 'status' },
  { title: '审核意见或退回原因', dataIndex: 'remark', slotName: 'remark' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
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
  queryForm.examineeId = undefined
  queryForm.noticeId = undefined
  queryForm.status = undefined
  search()
}

// 删除
const onDelete = (record: ExamineeNoticeApplyResp) => {
  return handleDelete(() => deleteExamineeNoticeApply(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamineeNoticeApply(queryForm))
}

const ExamineeNoticeApplyAddModalRef = ref<InstanceType<typeof ExamineeNoticeApplyAddModal>>()
// 新增
const onAdd = () => {
  ExamineeNoticeApplyAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamineeNoticeApplyResp) => {
  ExamineeNoticeApplyAddModalRef.value?.onUpdate(record.id)
}

const ExamineeNoticeApplyDetailDrawerRef = ref<InstanceType<typeof ExamineeNoticeApplyDetailDrawer>>()
// 详情
const onDetail = (record: ExamineeNoticeApplyResp) => {
  ExamineeNoticeApplyDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
