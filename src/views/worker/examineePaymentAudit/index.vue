<template>
  <div class="gi_table_page">
    <GiTable title="作业人员报名资料管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search" :row-selection="rowSelection" @select="select"
      @select-all="selectAll">
      <template #toolbar-left>
        <a-cascader v-model="queryForm.classId" :options="orgCategoryClassOptions" placeholder="请选择班级" allow-clear
          @change="search" />
        <a-input-search v-model="queryForm.className" placeholder="请输入班级编号" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['worker:examineePaymentAudit:review']" type="primary" @click="batchReview"
          :disabled="!selectedKeys.length">
          <template #icon><icon-check /></template>
          <template #default>批量审核</template>
        </a-button>
      </template>
      <template #payProofUrl="{ record }">
        <span v-if="record.payProofUrl" class="preview-image">
          <a-image v-for="(path, index) in record.payProofUrl.split(',')" :key="index" width="80" height="60"
            :src="path" :preview-props="{ zoomRate: 1.5 }" fit="cover" />
        </span>
        <span v-else>-</span>
      </template>
      <template #payStatus="{ record }">
        <a-tag :color="getPayStatusColor(record.payStatus)">
          {{ getPayStatusText(record.payStatus) }}
        </a-tag>
      </template>
      <template #payNoticeUrl="{ record }">
        <!-- 文件存在 -->
        <template v-if="record.payNoticeUrl">
          <a-link title="缴费通知单" @click="getPreviewUrl(record.payNoticeUrl)">
            预览
          </a-link>
        </template>
        <!-- 文件不存在 -->
        <span v-else>-</span>
      </template>
      <template #approvedCount="{ record }">
        <a-tag color="blue">
          {{ record.candidateCount }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['worker:examineePaymentAudit:review']" title="审核" v-if="record.payStatus == 1"
            @click="sinReview(record)">审核</a-link>
        </a-space>
      </template>
    </GiTable>
    <PaymentModal ref="PaymentModalRef" @save-success="search" />
  </div>
</template>

<script setup lang="ts">
import { type OrgClassResp, type OrgClassQuery, listOrgClassPayAudit } from '@/apis/training/orgClass'
import { getSelectOrgProjectClass } from '@/apis/training/org'
import PaymentModal from "./PanymentModal.vue";
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { useDownload, useTable } from '@/hooks'
import { Message } from '@arco-design/web-vue'

defineOptions({ name: 'ClassApplyMaterials' })

const queryForm = reactive<OrgClassQuery>({
  className: undefined,
  classId: undefined,
  isOrgQuery: false,
  flag: 2
})
const {
  tableData: dataList,
  loading,
  pagination,
  search,
  selectedKeys,
  select,
  selectAll
} = useTable((page) => listOrgClassPayAudit({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '机构代号', dataIndex: 'orgCode', slotName: 'orgCode' },
  { title: '机构名称', dataIndex: 'orgName', slotName: 'orgName' },
  { title: '班级编号', dataIndex: 'className', slotName: 'className', },
  { title: '报考项目', dataIndex: 'projectName', slotName: 'projectName' },
  { title: '报名总人数', dataIndex: 'approvedCount', slotName: 'approvedCount', align: 'center' },
  { title: '考试单价/元', dataIndex: 'examFee', slotName: 'examFee', align: 'center' },
  { title: '缴费总金额/元', dataIndex: 'totalPayAmount', slotName: 'totalPayAmount', align: 'center' },
  { title: '缴费通知单', dataIndex: 'payNoticeUrl', slotName: 'payNoticeUrl', align: 'center' },
  { title: '缴费凭证', dataIndex: 'payProofUrl', slotName: 'payProofUrl', align: 'center' },
  { title: '审核状态', dataIndex: 'payStatus', slotName: 'payStatus', align: 'center' },
  { title: '驳回原因', dataIndex: 'rejectReason', slotName: 'rejectReason' },
  { title: '提交时间', dataIndex: 'paySubmitTime', slotName: 'paySubmitTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['worker:examineePaymentAudit:review'])
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

const orgCategoryClassOptions = ref<any[]>([])
const PaymentModalRef = ref<InstanceType<typeof PaymentModal>>();

const reviewIds = ref<any[]>([]);
// 批量审核
const batchReview = () => {
  if (selectedKeys.value.length === 0) {
    Message.warning("请选择需要审核的记录");
    return;
  }
  // 先清空
  reviewIds.value = [];
  for (const row of dataList.value) {
    if (selectedKeys.value.includes(row.id)) {
      if (row.payStatus !== 1) {
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

// 打开审核的弹窗
const onExamine = async (reviewIds: any[]) => {
  PaymentModalRef.value?.onExamine(
    reviewIds
  );
};


// 重置
const reset = () => {
  queryForm.classId = undefined
  queryForm.className = undefined
  search()
}

const getPreviewUrl = (url: string) => {
  if (!url) {
    Message.warning('暂无文件可预览');
    return;
  }

  // 提取文件扩展名
  const ext = url.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    //  PDF 直接在浏览器中预览
    window.open(url, '_blank');
  } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
    //  Office 文件使用微软在线预览
    const previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
    window.open(previewUrl, '_blank');
  } else {
    Message.warning('暂不支持此文件类型预览');
  }
};

const getPayStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '待缴费'
    case 1:
      return '待审核'
    case 2:
      return '通过'
    case 3:
      return '免缴'
    case 4:
      return '待补正'
    default:
      return '未知'
  }
}


const getPayStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'red'      // 未缴费（异常/待处理）
    case 1:
      return 'blue'   // 待审核
    case 2:
      return 'green'    // 已缴费
    case 3:
      return 'green'     // 免缴
    case 4:
      return 'red'     // 审核未通过
    default:
      return 'gray'
  }
}
onMounted(async () => {
  const res = await getSelectOrgProjectClass(0)
  orgCategoryClassOptions.value = res.data
})
</script>

<style>
.no-padding-modal .arco-modal-body {
  padding: 0 !important;
}

.preview-image {
  display: flex;
  /* 横向排列 */
  flex-wrap: wrap;
  /* 空间不足自动换行 */
  gap: 8px;
  /* 图片间距，可调 */
}
</style>
