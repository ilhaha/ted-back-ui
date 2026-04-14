<template>
  <div class="gi_table_page">
    <GiTable
      title="无损检测、检验人员考试通知管理"
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
	    <a-input-search v-model="queryForm.title" placeholder="请输入标题" allow-clear @search="search" />
        <a-date-picker
          v-model="queryForm.applyDeadline"
          placeholder="请选择报名截止时间"
          format="YYYY-MM-DD"
          style="height: 32px"
        />
	    <a-input-search v-model="queryForm.examLevel" placeholder="请输入考试等级  0-无 1一级 2 二级" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.status" placeholder="请输入状态（0待审核、1审核通过、2审核未通过）" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examNotice:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:examNotice:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examNotice:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:examNotice:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:examNotice:delete']"
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

    <ExamNoticeAddModal ref="ExamNoticeAddModalRef" @save-success="search" />
    <ExamNoticeDetailDrawer ref="ExamNoticeDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamNoticeAddModal from './ExamNoticeAddModal.vue'
import ExamNoticeDetailDrawer from './ExamNoticeDetailDrawer.vue'
import { type ExamNoticeResp, type ExamNoticeQuery, deleteExamNotice, exportExamNotice, listExamNotice } from '@/apis/exam/examNotice'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamNotice' })


const queryForm = reactive<ExamNoticeQuery>({
  title: undefined,
  applyDeadline: undefined,
  examLevel: undefined,
  status: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamNotice({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  // { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '标题', dataIndex: 'title', slotName: 'title' },
  { title: '报名截止时间', dataIndex: 'applyDeadline', slotName: 'applyDeadline' },
  { title: '所属类别', dataIndex: 'categoryId', slotName: 'categoryId' },
  { title: '考试等级', dataIndex: 'examLevel', slotName: 'examLevel' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '说明', dataIndex: 'remark', slotName: 'remark' },
  { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '创建时间戳', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间戳', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '删除标记', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examNotice:detail', 'exam:examNotice:update', 'exam:examNotice:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.title = undefined
  queryForm.applyDeadline = undefined
  queryForm.examLevel = undefined
  queryForm.status = undefined
  search()
}

// 删除
const onDelete = (record: ExamNoticeResp) => {
  return handleDelete(() => deleteExamNotice(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamNotice(queryForm))
}

const ExamNoticeAddModalRef = ref<InstanceType<typeof ExamNoticeAddModal>>()
// 新增
const onAdd = () => {
  ExamNoticeAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamNoticeResp) => {
  ExamNoticeAddModalRef.value?.onUpdate(record.id)
}

const ExamNoticeDetailDrawerRef = ref<InstanceType<typeof ExamNoticeDetailDrawer>>()
// 详情
const onDetail = (record: ExamNoticeResp) => {
  ExamNoticeDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
