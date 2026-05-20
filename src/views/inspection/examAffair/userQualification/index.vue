<template>
  <div class="gi_table_page">
    <GiTable
      title="监考员资质证明管理"
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
	    <a-input-search v-model="queryForm.userId" placeholder="请输入用户ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.categoryId" placeholder="请输入考核项目种类ID" allow-clear @search="search" />
	    <a-input-search v-model="queryForm.qualificationUrl" placeholder="请输入资质证明URL" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['invigilate:userQualification:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['invigilate:userQualification:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['invigilate:userQualification:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['invigilate:userQualification:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['invigilate:userQualification:delete']"
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

    <UserQualificationAddModal ref="UserQualificationAddModalRef" @save-success="search" />
    <UserQualificationDetailDrawer ref="UserQualificationDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import UserQualificationAddModal from './UserQualificationAddModal.vue'
import UserQualificationDetailDrawer from './UserQualificationDetailDrawer.vue'
import { type UserQualificationResp, type UserQualificationQuery, deleteUserQualification, exportUserQualification, listUserQualification } from '@/apis/invigilate/userQualification'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'UserQualification' })


const queryForm = reactive<UserQualificationQuery>({
  userId: undefined,
  categoryId: undefined,
  qualificationUrl: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listUserQualification({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '', dataIndex: 'id', slotName: 'id' },
  { title: '用户ID', dataIndex: 'userId', slotName: 'userId' },
  { title: '考核项目种类ID', dataIndex: 'categoryId', slotName: 'categoryId' },
  { title: '资质证明URL', dataIndex: 'qualificationUrl', slotName: 'qualificationUrl' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '修改人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '修改时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '删除标记(0未删,1已删)', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['invigilate:userQualification:detail', 'invigilate:userQualification:update', 'invigilate:userQualification:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.userId = undefined
  queryForm.categoryId = undefined
  queryForm.qualificationUrl = undefined
  search()
}

// 删除
const onDelete = (record: UserQualificationResp) => {
  return handleDelete(() => deleteUserQualification(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportUserQualification(queryForm))
}

const UserQualificationAddModalRef = ref<InstanceType<typeof UserQualificationAddModal>>()
// 新增
const onAdd = () => {
  UserQualificationAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: UserQualificationResp) => {
  UserQualificationAddModalRef.value?.onUpdate(record.id)
}

const UserQualificationDetailDrawerRef = ref<InstanceType<typeof UserQualificationDetailDrawer>>()
// 详情
const onDetail = (record: UserQualificationResp) => {
  UserQualificationDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
