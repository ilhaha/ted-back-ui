<template>
  <div class="gi_table_page">
    <GiTable
      title="考试地点管理"
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
      <template #operationalStatus="{ record }">
        <a-tag
            :color="getStatusColor(record.operationalStatus)" bordered
        >{{ getStatusText(record.operationalStatus) }}</a-tag>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:examLocation:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['exam:classroom:export']" @click="onExport"> -->
          <!-- <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #toolbar-left>
        <div class="search-container">
          <a-input v-model="queryForm.locationName" placeholder="搜索考试地点名称" allow-clear style="width: 100%" />
          <!-- <a-select 
            v-model="queryForm.operationalStatus" 
            placeholder="搜索运营状态" 
            allow-clear 
            style="width: 100%; margin-left: 8px;"
          >
            <a-option v-for="item in statusList" :key="item.value" :value="item.value">{{ item.label }}</a-option>
          </a-select> -->
          <a-button type="primary" class="ml-2" @click="search">
            <template #icon><icon-search /></template>
            搜索
          </a-button>
          <a-button class="ml-2" @click="reset">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
          <!-- <div class="operation-btns">
            <a-button v-permission="['exam:examLocation:add']" type="primary" @click="onAdd">
              <template #icon><icon-plus /></template>
              新增
            </a-button>
            <a-button v-permission="['exam:examLocation:export']" class="ml-2" @click="onExport">
              <template #icon><icon-download /></template>
              导出
            </a-button>
          </div> -->
        </div>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examLocation:update']" title="修改" @click="onUpdate(record)">修改</a-link>
 <!-- <a-link
            v-permission="['exam:examLocation:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record.id)"
          >
            删除
         </a-link> -->
        </a-space>
      </template>
    </GiTable>

    <ExamLocationAddModal ref="ExamLocationAddModalRef" @save-success="search" />
    <ExamLocationDetailDrawer ref="ExamLocationDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ExamLocationAddModal from './ExamLocationAddModal.vue'
import ExamLocationDetailDrawer from './ExamLocationDetailDrawer.vue'
import { type ExamLocationResp, type ExamLocationQuery, deleteExamLocation, exportExamLocation, listExamLocation } from '@/apis/exam/examLocation'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { useDept, useRole } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import type {ColumnItem} from "@/components/GiForm";
import {DisEnableStatusList} from "@/constant/common";

defineOptions({ name: 'ExamLocation' })

const queryForm = reactive<ExamLocationQuery>({
  locationName: undefined,
  operationalStatus: undefined,

  sort: ['id,desc'],
})
const statusList = ref([
  { label: '运营', value: 0 },
  { label: '休息', value: 1 },
  { label: '维护', value: 2 },
  { label: '关闭', value: 3 },
])

const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listExamLocation({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  // { title: '地点ID', dataIndex: 'id', slotName: 'id' },
  { title: '考试地点名称', dataIndex: 'locationName', slotName: 'locationName' },
  // { title: '所在省', dataIndex: 'provinceName', slotName: 'provinceName' },
  // { title: '所在市', dataIndex: 'cityName', slotName: 'cityName' },
  // { title: '所在区', dataIndex: 'streetName', slotName: 'streetName' },
  { title: '详细地址', dataIndex: 'detailedAddress', slotName: 'detailedAddress' },
  // 0:运营;1:休息;2:维护;3:关闭;
  //{ title: '运营状态', dataIndex: 'operationalStatus', slotName: 'operationalStatus' },
  // { title: '描述', dataIndex: 'redeme', slotName: 'redeme' },
  // { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  // { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  // { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  // { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  // { title: '删除标记', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 200,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:examLocation:update', 'exam:examLocation:delete'])
  }
])

// 搜索
const reset = () => {
  queryForm.locationName = undefined
  queryForm.operationalStatus = undefined

  search()
}

const searchForm: ColumnItem[] = reactive([
  {
    type: 'input',
    field: 'locationName',
    span: { xs: 12, sm: 8, xxl: 6 },
    formItemProps: {
      hideLabel: true,
    },
    props: {
      placeholder: '搜索考试地点名称',
      showWordLimit: false,
    },
  },
  {
    type: 'select',
    field: 'operationalStatus',
    span: { xs: 12, sm: 8, xxl: 6 },
    formItemProps: {
      hideLabel: true,
    },
    props: {
      options: statusList,
      placeholder: '搜索运营状态',
    },
  }
])

// 搜索
const searchProject = () => {
}

const checkboxIds = ref([])

// 删除
const onDelete = (ids) => {
  return handleDelete(() => deleteExamLocation(ids), {
    content: `是否确定删除`,
    showModal: true,
  })
}

const handleCheckbox = (record) => {
  checkboxIds.value = record
}

const handleCheckboxAll = (record) => {
  if (!record) {
    checkboxIds.value = []
    return
  }
  checkboxIds.value = dataList.value.map((item) => item.id)
}

// 导出
const onExport = () => {
  useDownload(() => exportExamLocation(queryForm))
}

const ExamLocationAddModalRef = ref<InstanceType<typeof ExamLocationAddModal>>()
// 新增
const onAdd = () => {
  ExamLocationAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: ExamLocationResp) => {
  ExamLocationAddModalRef.value?.onUpdate(record.id)
}

const ExamLocationDetailDrawerRef = ref<InstanceType<typeof ExamLocationDetailDrawer>>()
// 详情
const onDetail = (record: ExamLocationResp) => {
  ExamLocationDetailDrawerRef.value?.onOpen(record.id)
}

const getStatusColor = (status: string) => {
  switch (status) {
    case '运营': return 'blue';  // 运营
    case '休息': return 'orange'; // 休息
    case '维护': return 'green';  // 维护
    case '关闭': return 'red';    // 关闭
    default: return 'default'
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case '运营': return '运营'
    case '休息': return '休息'
    case '维护': return '维护'
    case '关闭': return '关闭'
    default: return '未知状态'
  }
}

</script>

<style scoped lang="scss">
.search-container {
  display: flex;
  align-items: center;
  width: 100%;
  
  > .arco-input-wrapper,
  > .arco-select {
    width: 200px;  // 两个搜索框统一宽度
  }

  .operation-btns {
    margin-left: auto;
    display: flex;
    align-items: center;
  }
}

.ml-2 {
  margin-left: 8px;
}
</style>
