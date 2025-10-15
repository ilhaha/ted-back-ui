<template>
  <div class="gi_table_page">
    <GiTable
      title="座位表管理"
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
        <a-button v-permission="['exam:seat:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['exam:seat:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:seat:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['exam:seat:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['exam:seat:delete']"
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

    <SeatAddModal ref="SeatAddModalRef" @save-success="search" />
    <SeatDetailDrawer ref="SeatDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import SeatAddModal from './SeatAddModal.vue'
import SeatDetailDrawer from './SeatDetailDrawer.vue'
import { type SeatResp, type SeatQuery, deleteSeat, exportSeat, listSeat } from '@/apis/exam/seat'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'Seat' })


const queryForm = reactive<SeatQuery>({
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listSeat({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '主键id', dataIndex: 'id', slotName: 'id' },
  { title: '静态ip', dataIndex: 'computerIp', slotName: 'computerIp' },
  { title: '考场id', dataIndex: 'classroomId', slotName: 'classroomId' },
  { title: '座位号', dataIndex: 'seatId', slotName: 'seatId' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '逻辑删除', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:seat:detail', 'exam:seat:update', 'exam:seat:delete'])
  }
]);

// 重置
const reset = () => {
  search()
}

// 删除
const onDelete = (record: SeatResp) => {
  return handleDelete(() => deleteSeat(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportSeat(queryForm))
}

const SeatAddModalRef = ref<InstanceType<typeof SeatAddModal>>()
// 新增
const onAdd = () => {
  SeatAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: SeatResp) => {
  SeatAddModalRef.value?.onUpdate(record.id)
}

const SeatDetailDrawerRef = ref<InstanceType<typeof SeatDetailDrawer>>()
// 详情
const onDetail = (record: SeatResp) => {
  SeatDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
