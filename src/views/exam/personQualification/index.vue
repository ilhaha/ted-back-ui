<template>
  <div class="gi_table_page">
    <GiTable
      title="人员复审信息表管理"
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
	    <a-input-search v-model="queryForm.name" placeholder="请输入姓名" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.idCard" placeholder="请输入身份证号" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.createUser" placeholder="请输入创建人ID" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:personQualification:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['exam:personQualification:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:personQualification:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:personQualification:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:personQualification:delete']"
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

    <PersonQualificationAddModal ref="PersonQualificationAddModalRef" @save-success="search" />
    <PersonQualificationDetailDrawer ref="PersonQualificationDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import PersonQualificationAddModal from './PersonQualificationAddModal.vue'
import PersonQualificationDetailDrawer from './PersonQualificationDetailDrawer.vue'
import { type PersonQualificationResp, type PersonQualificationQuery, deletePersonQualification, exportPersonQualification, listPersonQualification } from '@/apis/exam/personQualification'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'PersonQualification' })


const queryForm = reactive<PersonQualificationQuery>({
  name: undefined,
  idCard: undefined,
  createUser: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listPersonQualification({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '姓名', dataIndex: 'name', slotName: 'name' },
  { title: '身份证号', dataIndex: 'idCard', slotName: 'idCard' },
  { title: '文化程度', dataIndex: 'education', slotName: 'education' },
  { title: '联系电话', dataIndex: 'phone', slotName: 'phone' },
  { title: '聘用单位', dataIndex: 'employer', slotName: 'employer' },
  { title: '资格项目代码', dataIndex: 'qualificationCategoryCode', slotName: 'qualificationCategoryCode' },
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
    show: has.hasPermOr(['exam:personQualification:detail', 'exam:personQualification:update', 'exam:personQualification:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.name = undefined
  queryForm.idCard = undefined
  queryForm.createUser = undefined
  search()
}

// 删除
const onDelete = (record: PersonQualificationResp) => {
  return handleDelete(() => deletePersonQualification(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportPersonQualification(queryForm))
}

const PersonQualificationAddModalRef = ref<InstanceType<typeof PersonQualificationAddModal>>()
// 新增
const onAdd = () => {
  PersonQualificationAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: PersonQualificationResp) => {
  PersonQualificationAddModalRef.value?.onUpdate(record.id)
}

const PersonQualificationDetailDrawerRef = ref<InstanceType<typeof PersonQualificationDetailDrawer>>()
// 详情
const onDetail = (record: PersonQualificationResp) => {
  PersonQualificationDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
