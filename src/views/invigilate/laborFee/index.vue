<template>
  <div class="gi_table_page">
    <GiTable
      title="考试劳务费配置管理"
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
        <a-select
          v-model="queryForm.isEnabled"
          :options="is_enabled_enum"
          placeholder="请选择是否启用：1启用 0禁用"
          allow-clear
          style="width: 150px"
          @change="search"
        />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['invigilate:laborFee:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button v-permission="['invigilate:laborFee:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['invigilate:laborFee:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          <a-link v-permission="['invigilate:laborFee:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link
            v-permission="['invigilate:laborFee:delete']"
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

    <LaborFeeAddModal ref="LaborFeeAddModalRef" @save-success="search" />
    <LaborFeeDetailDrawer ref="LaborFeeDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import LaborFeeAddModal from './LaborFeeAddModal.vue'
import LaborFeeDetailDrawer from './LaborFeeDetailDrawer.vue'
import { type LaborFeeResp, type LaborFeeQuery, deleteLaborFee, exportLaborFee, listLaborFee } from '@/apis/invigilate/laborFee'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'LaborFee' })


const queryForm = reactive<LaborFeeQuery>({
  isEnabled: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listLaborFee({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '', dataIndex: 'id', slotName: 'id' },
  { title: '实操考试劳务费单价（元）', dataIndex: 'practicalFee', slotName: 'practicalFee' },
  { title: '理论考试劳务费单价（元）', dataIndex: 'theoryFee', slotName: 'theoryFee' },
  { title: '备注', dataIndex: 'remark', slotName: 'remark' },
  { title: '是否启用：1启用 0禁用', dataIndex: 'isEnabled', slotName: 'isEnabled' },
  { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  { title: '修改人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  { title: '修改时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['invigilate:laborFee:detail', 'invigilate:laborFee:update', 'invigilate:laborFee:delete'])
  }
]);

// 重置
const reset = () => {
  queryForm.isEnabled = undefined
  search()
}

// 删除
const onDelete = (record: LaborFeeResp) => {
  return handleDelete(() => deleteLaborFee(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportLaborFee(queryForm))
}

const LaborFeeAddModalRef = ref<InstanceType<typeof LaborFeeAddModal>>()
// 新增
const onAdd = () => {
  LaborFeeAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: LaborFeeResp) => {
  LaborFeeAddModalRef.value?.onUpdate(record.id)
}

const LaborFeeDetailDrawerRef = ref<InstanceType<typeof LaborFeeDetailDrawer>>()
// 详情
const onDetail = (record: LaborFeeResp) => {
  LaborFeeDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
