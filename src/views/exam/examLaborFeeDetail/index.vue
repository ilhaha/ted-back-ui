<template>
  <div class="gi_table_page">
    <GiTable
      title="考试考评人员劳务费计算明细管理"
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
	    <a-input-search v-model="queryForm.nickname" placeholder="请输入考评人员姓名" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.categoryName" placeholder="请输入监考种类" allow-clear @search="search" />
        <a-date-picker
          v-model="queryForm.invigilateDate"
          placeholder="请选择监考日期"
          format="YYYY-MM-DD"
          style="height: 32px"
          @change="search"
        />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examLaborFeeDetail:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['exam:examLaborFeeDetail:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #isTeamLeader="{ record }">
        <a-tag :color="record.isTeamLeader == 1 ? 'green' : 'red'">{{ record.isTeamLeader == 1 ? '是' : '否' }}</a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <!-- <a-link v-permission="['exam:examLaborFeeDetail:detail']" title="详情" @click="onDetail(record)">详情</a-link> -->
          <a-link v-permission="['exam:examLaborFeeDetail:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:examLaborFeeDetail:delete']"
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

    <ExamLaborFeeDetailAddModal ref="ExamLaborFeeDetailAddModalRef" @save-success="search" />
    <ExamLaborFeeDetailDetailDrawer ref="ExamLaborFeeDetailDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamLaborFeeDetailAddModal from './ExamLaborFeeDetailAddModal.vue'
import ExamLaborFeeDetailDetailDrawer from './ExamLaborFeeDetailDetailDrawer.vue'
import { type ExamLaborFeeDetailResp, type ExamLaborFeeDetailQuery, deleteExamLaborFeeDetail, exportExamLaborFeeDetail, listExamLaborFeeDetail } from '@/apis/exam/examLaborFeeDetail'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'ExamLaborFeeDetail' })


const queryForm = reactive<ExamLaborFeeDetailQuery>({
  nickname: undefined,
  categoryName: undefined,
  invigilateDate: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamLaborFeeDetail({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '考评人员', dataIndex: 'nickname', slotName: 'nickname' },
  { title: '监考种类', dataIndex: 'categoryName', slotName: 'categoryName' },
  { title: '监考信息', dataIndex: 'invigilateInfo', slotName: 'invigilateInfo' },
  { title: '监考班级', dataIndex: 'invigilateClassName', slotName: 'invigilateClassName' },
  { title: '监考日期', dataIndex: 'invigilateDate', slotName: 'invigilateDate' },
  { title: '监考时长（天）', dataIndex: 'invigilateDurationDays', slotName: 'invigilateDurationDays' },
  { title: '是否担任组长', dataIndex: 'isTeamLeader', slotName: 'isTeamLeader' },
  { title: '实发劳务费金额（税后）', dataIndex: 'actualLaborFeeAmount', slotName: 'actualLaborFeeAmount' },
  { title: '备注', dataIndex: 'remark', slotName: 'remark' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examLaborFeeDetail:detail', 'exam:examLaborFeeDetail:update', 'exam:examLaborFeeDetail:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.nickname = undefined
  queryForm.categoryName = undefined
  queryForm.invigilateDate = undefined
  search()
}

// 删除
const onDelete = (record: ExamLaborFeeDetailResp) => {
  return handleDelete(() => deleteExamLaborFeeDetail(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportExamLaborFeeDetail(queryForm))
}

const ExamLaborFeeDetailAddModalRef = ref<InstanceType<typeof ExamLaborFeeDetailAddModal>>()
// 新增
const onAdd = () => {
  ExamLaborFeeDetailAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamLaborFeeDetailResp) => {
  ExamLaborFeeDetailAddModalRef.value?.onUpdate(record.id)
}

const ExamLaborFeeDetailDetailDrawerRef = ref<InstanceType<typeof ExamLaborFeeDetailDetailDrawer>>()
// 详情
const onDetail = (record: ExamLaborFeeDetailResp) => {
  ExamLaborFeeDetailDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
