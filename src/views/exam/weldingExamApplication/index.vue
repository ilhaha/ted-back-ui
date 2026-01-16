<template>
  <div class="gi_table_page">
    <GiTable title="机构申请焊接考试项目管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search" :row-selection="rowSelection" @select="select"
      @select-all="selectAll">
      <template #toolbar-left>
        <a-input-search v-model="queryForm.orgName" placeholder="请输入申请机构名称" allow-clear @search="search" />
        <a-input-search v-model="queryForm.projectCode" placeholder="请输入焊接考试代码" allow-clear @search="search" />
        <a-select v-model="queryForm.weldingType" placeholder="焊接类型" allow-clear class="search-input ml-2"
          @change="search" style="margin-left: 8px;">
          <a-option value="0">金属焊接</a-option>
          <a-option value="1">非金属焊接</a-option>
        </a-select>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:weldingExamApplication:review']" type="primary" @click="batchReview"
          :disabled="!selectedKeys.length">
          <template #icon><icon-check /></template>
          <template #default>批量审核</template>
        </a-button>
      </template>
      <template #weldingType="{ record }">
        <a-tag :color="getWeldingTypeColor(record.weldingType)" bordered>{{
          getWeldingTypeText(record.weldingType)
        }}</a-tag>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)" bordered>{{
          getStatusText(record.status)
        }}</a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:weldingExamApplication:review']" v-if="record.status == 0"
            @click="sinReview(record)">
            审核
          </a-link>
        </a-space>
      </template>
    </GiTable>
    <WeldingExamApplicationAddModal ref="WeldingExamApplicationAddModalRef" @save-success="search" />
    <WeldingExamApplicationDetailDrawer ref="WeldingExamApplicationDetailDrawerRef" />
    <ReviewModal ref="ReviewModalRef" @save-success="search" />
  </div>
</template>

<script setup lang="ts">
import WeldingExamApplicationAddModal from './WeldingExamApplicationAddModal.vue'
import WeldingExamApplicationDetailDrawer from './WeldingExamApplicationDetailDrawer.vue'
import { type WeldingExamApplicationResp, type WeldingExamApplicationQuery, deleteWeldingExamApplication, exportWeldingExamApplication, listWeldingExamApplication } from '@/apis/exam/weldingExamApplication'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { Message } from '@arco-design/web-vue'
import ReviewModal from './ReviewModal.vue'

defineOptions({ name: 'WeldingExamApplication' })


const queryForm = reactive<WeldingExamApplicationQuery>({
  orgName: undefined,
  weldingType: undefined,
  projectCode: undefined,
  isOrgQuery: false,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
  selectedKeys,
  select,
  selectAll
} = useTable((page) => listWeldingExamApplication({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '申请机构', dataIndex: 'orgName', slotName: 'orgName' },
  { title: '焊接类型', dataIndex: 'weldingType', slotName: 'weldingType' },
  { title: '焊接项目代码', dataIndex: 'projectCode', slotName: 'projectCode' },
  { title: '申请原因', dataIndex: 'applicationReason', slotName: 'applicationReason' },
  { title: '提交时间', dataIndex: 'submittedAt', slotName: 'submittedAt' },
  { title: '审核状态', dataIndex: 'status', slotName: 'status' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:weldingExamApplication:review'])
  }
]);

const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedKeys,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  }
})

const reviewIds = ref<any[]>([]);

const batchReview = () => {
  if (selectedKeys.value.length === 0) {
    Message.warning("请选择需要审核的记录");
    return;
  }
  // 先清空
  reviewIds.value = [];
  for (const row of dataList.value) {
    if (selectedKeys.value.includes(row.id)) {
      if (row.status !== 0) {
        Message.warning("选中的记录中包含非未审核状态的数据，请重新选择");
        return;
      }
      reviewIds.value.push(row.id);
    }
  }
  onExamine(reviewIds.value)
};

// 审核
const sinReview = (record: any) => {
  reviewIds.value = [];
  reviewIds.value.push(record.id);
  onExamine(reviewIds.value)
}

const ReviewModalRef = ref<InstanceType<typeof ReviewModal>>();

// 打开审核的弹窗
const onExamine = async (reviewIds: any[]) => {
  ReviewModalRef.value?.onExamine(
    reviewIds
  );
};


// 重置
const reset = () => {
  queryForm.orgName = undefined
  queryForm.projectCode = undefined
  queryForm.weldingType = undefined
  search()
}

// 删除
const onDelete = (record: WeldingExamApplicationResp) => {
  return handleDelete(() => deleteWeldingExamApplication(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}


const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待审核";
    case 1:
      return "通过";
    case 2:
      return "驳回";
    default:
      return "未知";
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue";
    case 1:
      return "green";
    case 2:
      return "red";
    default:
      return "default";
  }
};

const getWeldingTypeText = (status: number) => {
  switch (status) {
    case 0:
      return "金属焊接";
    case 1:
      return "非金属焊接";
    default:
      return "未知";
  }
};

const getWeldingTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return "orange";
    case 1:
      return "blue";
    default:
      return "default";
  }
};

// 导出
const onExport = () => {
  useDownload(() => exportWeldingExamApplication(queryForm))
}

const WeldingExamApplicationAddModalRef = ref<InstanceType<typeof WeldingExamApplicationAddModal>>()
// 新增
const onAdd = () => {
  WeldingExamApplicationAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: WeldingExamApplicationResp) => {
  WeldingExamApplicationAddModalRef.value?.onUpdate(record.id)
}

const WeldingExamApplicationDetailDrawerRef = ref<InstanceType<typeof WeldingExamApplicationDetailDrawer>>()
// 详情
const onDetail = (record: WeldingExamApplicationResp) => {
  WeldingExamApplicationDetailDrawerRef.value?.onOpen(record.id)
}
</script>

<style scoped lang="scss"></style>
