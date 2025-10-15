<template>
  <div class="gi_table_page">
    <GiTable
      title="考场地点和考场关联管理"
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
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:locationClassroom:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['exam:locationClassroom:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:locationClassroom:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:locationClassroom:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:locationClassroom:delete']"
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

    <LocationClassroomAddModal ref="LocationClassroomAddModalRef" @save-success="search" />
    <LocationClassroomDetailDrawer ref="LocationClassroomDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import LocationClassroomAddModal from './LocationClassroomAddModal.vue'
import LocationClassroomDetailDrawer from './LocationClassroomDetailDrawer.vue'
import { type LocationClassroomResp, type LocationClassroomQuery, deleteLocationClassroom, exportLocationClassroom, listLocationClassroom } from '@/apis/exam/locationClassroom'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'LocationClassroom' })


const queryForm = reactive<LocationClassroomQuery>({
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listLocationClassroom({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键id', dataIndex: 'id', slotName: 'id' },
  { title: '地点id', dataIndex: 'locationId', slotName: 'locationId' },
  { title: '考场id', dataIndex: 'classroomId', slotName: 'classroomId' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:locationClassroom:detail', 'exam:locationClassroom:update', 'exam:locationClassroom:delete'])
  }
]);

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: LocationClassroomResp) => {
  return handleDelete(() => deleteLocationClassroom(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportLocationClassroom(queryForm))
}

const LocationClassroomAddModalRef = ref<InstanceType<typeof LocationClassroomAddModal>>()
// 新增
const onAdd = () => {
  LocationClassroomAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: LocationClassroomResp) => {
  LocationClassroomAddModalRef.value?.onUpdate(record.id)
}

const LocationClassroomDetailDrawerRef = ref<InstanceType<typeof LocationClassroomDetailDrawer>>()
// 详情
const onDetail = (record: LocationClassroomResp) => {
  LocationClassroomDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
