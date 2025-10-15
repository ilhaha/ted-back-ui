<template>
  <div class="gi_table_page">
    <GiTable
      title="学习记录管理"
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
      <template #status="{ record }">
        {{ getStatusText(record.status) }}
      </template>
      <template #toolbar-left>
	    <a-input v-model="queryForm.studentName" placeholder="请输入学生名字" allow-clear />
	    <a-input v-model="queryForm.videoName" placeholder="请输入视频名称" allow-clear />
	    <a-select
          v-model="queryForm.status"
          placeholder="请选择观看状态"
          allow-clear
          style="width: 150px"
        >
          <a-option value="0">未观看</a-option>
          <a-option value="1">已观看</a-option>
          <a-option value="2">已完成</a-option>
        </a-select>
        <a-button type="primary" @click="search">
          <template #icon><icon-search /></template>
          <template #default>搜索</template>
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <!-- <a-button v-permission="['training:watchRecord:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button> -->
        <!-- <a-button v-permission="['training:watchRecord:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
<!--      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['training:watchRecord:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          &lt;!&ndash; <a-link v-permission="['training:watchRecord:update']" title="修改" @click="onUpdate(record)">修改</a-link> &ndash;&gt;
          &lt;!&ndash; <a-link
            v-permission="['training:watchRecord:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link> &ndash;&gt;
        </a-space>
      </template>-->
    </GiTable>

    <WatchRecordAddModal ref="WatchRecordAddModalRef" @save-success="search" />
    <WatchRecordDetailDrawer ref="WatchRecordDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import WatchRecordAddModal from './WatchRecordAddModal.vue'
import WatchRecordDetailDrawer from './WatchRecordDetailDrawer.vue'
import { type WatchRecordResp, type WatchRecordQuery, deleteWatchRecord, exportWatchRecord, listWatchRecord } from '@/apis/training/watchRecord'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'WatchRecord' })


const queryForm = reactive<WatchRecordQuery>({
  studentName: undefined,
  videoName: undefined,
  status: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listWatchRecord({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  // { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: '学生名称', dataIndex: 'studentName', slotName: 'studentName' },
  { title: '视频名称', dataIndex: 'videoName', slotName: 'videoName' },
  { title: '已观看时长（秒）', dataIndex: 'watchedDuration', slotName: 'watchedDuration' },
  { title: '观看状态', dataIndex: 'status', slotName: 'status' },
/*  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:watchRecord:detail', 'training:watchRecord:update', 'training:watchRecord:delete'])
  }*/
]);

// 重置
const reset = () => {
  queryForm.studentName = undefined
  queryForm.videoName = undefined
  queryForm.status = undefined
  search()
}

// 删除
const onDelete = (record: WatchRecordResp) => {
  return handleDelete(() => deleteWatchRecord(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportWatchRecord(queryForm))
}

const WatchRecordAddModalRef = ref<InstanceType<typeof WatchRecordAddModal>>()
// 新增
const onAdd = () => {
  WatchRecordAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: WatchRecordResp) => {
  WatchRecordAddModalRef.value?.onUpdate(record.id)
}

const WatchRecordDetailDrawerRef = ref<InstanceType<typeof WatchRecordDetailDrawer>>()
// 详情
const onDetail = (record: WatchRecordResp) => {
  WatchRecordDetailDrawerRef.value?.onOpen(record.id)
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '未观看';
    case 1: return '已观看';
    case 2: return '已完成';
    default: return '未知状态';
  }
}

</script>

<style scoped lang="scss"></style>
