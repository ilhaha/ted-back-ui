<template>
  <div class="gi_table_page">
    <GiTable
      title="考生试卷管理"
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
	    <a-input-search v-model="queryForm.enrollId" placeholder="请输入报名id" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.paperJson" placeholder="请输入试卷 JSON 内容" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createTime" placeholder="请输入创建时间" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.updateTime" placeholder="请输入更新时间" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.isDeleted" placeholder="请输入删除标记(0未删,1已删)" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:candidateExamPaper:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:candidateExamPaper:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:candidateExamPaper:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:candidateExamPaper:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:candidateExamPaper:delete']"
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

    <CandidateExamPaperAddModal ref="CandidateExamPaperAddModalRef" @save-success="search" />
    <CandidateExamPaperDetailDrawer ref="CandidateExamPaperDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import CandidateExamPaperAddModal from './CandidateExamPaperAddModal.vue'
import CandidateExamPaperDetailDrawer from './CandidateExamPaperDetailDrawer.vue'
import { type CandidateExamPaperResp, type CandidateExamPaperQuery, deleteCandidateExamPaper, exportCandidateExamPaper, listCandidateExamPaper } from '@/apis/exam/candidateExamPaper'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'CandidateExamPaper' })


const queryForm = reactive<CandidateExamPaperQuery>({
  enrollId: undefined,
  paperJson: undefined,
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
} = useTable((page) => listCandidateExamPaper({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '报名id', dataIndex: 'enrollId', slotName: 'enrollId' },
  { title: '试卷 JSON 内容', dataIndex: 'paperJson', slotName: 'paperJson' },
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
    show: has.hasPermOr(['exam:candidateExamPaper:detail', 'exam:candidateExamPaper:update', 'exam:candidateExamPaper:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.enrollId = undefined
  queryForm.paperJson = undefined
  queryForm.createTime = undefined
  queryForm.updateTime = undefined
  queryForm.isDeleted = undefined
  search()
}

// 删除
const onDelete = (record: CandidateExamPaperResp) => {
  return handleDelete(() => deleteCandidateExamPaper(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportCandidateExamPaper(queryForm))
}

const CandidateExamPaperAddModalRef = ref<InstanceType<typeof CandidateExamPaperAddModal>>()
// 新增
const onAdd = () => {
  CandidateExamPaperAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CandidateExamPaperResp) => {
  CandidateExamPaperAddModalRef.value?.onUpdate(record.id)
}

const CandidateExamPaperDetailDrawerRef = ref<InstanceType<typeof CandidateExamPaperDetailDrawer>>()
// 详情
const onDetail = (record: CandidateExamPaperResp) => {
  CandidateExamPaperDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
