<template>
  <div class="gi_table_page">
    <GiTable title="缴费审核管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search" :row-selection="rowSelection" @select="select"
      @select-all="selectAll">
      <template #toolbar-left>
        <a-cascader v-model="queryForm.classId" :options="orgCategoryClassOptions" placeholder="请选择班级" allow-clear
          @change="search" />
        <a-input-search v-model="queryForm.examPlanId" placeholder="请输入考试计划名称" allow-clear @search="search" />
        <a-input-search v-model="queryForm.examineeId" placeholder="请输入作业人员姓名" allow-clear @search="search" />
        <a-select v-model="queryForm.auditStatus" :options="audit_status_enum" placeholder="请选择审核状态" allow-clear
          style="width: 150px" @change="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #auditNoticeUrl="{ record }">
        <a-link @click="getPreviewUrl(record.auditNoticeUrl)" v-if="record.auditNoticeUrl">{{ record.noticeNo
        }}</a-link>
      </template>
      <template #paymentProofUrl="{ record }">
        <template v-if="record.paymentProofUrl">
          <div class="image-list">

            <template v-for="(url, idx) in record.paymentProofUrl.split(',')" :key="idx">

              <!-- 图片预览 -->
              <a-image v-if="isImage(url)" width="80" height="60" :src="url" fit="cover"
                :preview-props="{ zoomRate: 1.5 }" class="preview-image" @error="handleImageError" />

              <!-- PDF 预览 -->
              <div v-else>
                <a-link title="预览" @click="getPreviewUrl(url)">
                  PDF 预览
                </a-link>
              </div>
            </template>

          </div>
        </template>
        <span v-else>-</span>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['worker:examineePaymentAudit:review']" type="primary" @click="batchReview"
          :disabled="!selectedKeys.length">
          <template #icon><icon-check /></template>
          <template #default>批量审核</template>
        </a-button>
        <!-- <a-button v-permission="['worker:examineePaymentAudit:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
<template #default>新增</template>
</a-button>
<a-button v-permission="['worker:examineePaymentAudit:export']" @click="onExport">
  <template #icon><icon-download /></template>
  <template #default>导出</template>
</a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['worker:examineePaymentAudit:review']" title="审核" @click="sinReview(record)"
            v-if="record.auditStatus == 1 || record.auditStatus == 4">审核</a-link>
        </a-space>
      </template>
      <template #auditStatus="{ record }">
        <a-tag :color="getStatusColor(record.auditStatus)">{{
          getStatusText(record.auditStatus)
        }}</a-tag>
      </template>
    </GiTable>

    <ExamineePaymentAuditAddModal ref="ExamineePaymentAuditAddModalRef" @save-success="search" />
    <ExamineePaymentAuditDetailDrawer ref="ExamineePaymentAuditDetailDrawerRef" />
    <PaymentModal ref="PaymentModalRef" @save-success="search" />
  </div>
</template>


<script setup lang="ts">
import ExamineePaymentAuditAddModal from "./ExamineePaymentAuditAddModal.vue";
import PaymentModal from "./PanymentModal.vue";
import ExamineePaymentAuditDetailDrawer from "./ExamineePaymentAuditDetailDrawer.vue";
import { getSelectOrgProjectClass } from '@/apis/training/org'
import {
  type ExamineePaymentAuditResp,
  type ExamineePaymentAuditQuery,
  deleteExamineePaymentAudit,
  exportExamineePaymentAudit,
  listExamineePaymentAudit,
} from "@/apis/exam/examineePaymentAudit";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { isMobile } from "@/utils";
import { Message } from "@arco-design/web-vue";
import has from "@/utils/has";

defineOptions({ name: "ExamineePaymentAudit" });

const queryForm = reactive<ExamineePaymentAuditQuery>({
  examPlanId: undefined,
  examineeId: undefined,
  auditStatus: undefined,
  classId: undefined,
  isWorker: true,
  sort: ["paymentTime,desc"],
});

const orgCategoryClassOptions = ref<any[]>([])

const audit_status_enum = [
  { label: "待上传", value: 0 },
  { label: "待审核", value: 1 },
  { label: "审核通过", value: 2 },
  { label: "待补正", value: 3 },
  { label: "补正审核", value: 4 },
];

const getStatusText = (auditStatus: number) => {
  switch (auditStatus) {
    case 0:
      return "待上传";
    case 1:
      return "待审核";
    case 2:
      return "审核通过";
    case 3:
      return "待补正";
    case 4:
      return "补正审核";
    case 5:
      return "退款审核";
    case 6:
      return "已退款";
    case 7:
      return "退款驳回";
    default:
      return "";
  }
};
const getStatusColor = (auditStatus: number) => {
  switch (auditStatus) {
    case 0:
      return "red";
    case 1:
      return "red";
    case 2:
      return "green";
    case 3:
      return "orange";
    case 4:
      return "red";
    case 5:
      return "red";
    case 6:
      return "orange";
    case 7:
      return "green";
    default:
      return "default";
  }
};
const reviewIds = ref<any[]>([]);
const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
  selectedKeys,
  select,
  selectAll
} = useTable((page) => listExamineePaymentAudit({ ...queryForm, ...page }), {
  immediate: true,
});

const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedKeys,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  }
})

const columns = ref<TableInstanceColumns[]>([
  {
    title: "作业人员姓名",
    dataIndex: "examineeName",
    slotName: "examineeName",
  }, {
    title: "班级",
    dataIndex: "className",
    slotName: "className",
  },
  { title: "考试计划名称", dataIndex: "planName", slotName: "planName" },
  {
    title: "应缴费金额（元）",
    dataIndex: "paymentAmount",
    slotName: "paymentAmount",
  },
  {
    title: "缴费通知单",
    dataIndex: "auditNoticeUrl",
    slotName: "auditNoticeUrl",
  },
  {
    title: "缴费凭证",
    dataIndex: "paymentProofUrl",
    slotName: "paymentProofUrl",
  },
  { title: "提交时间", dataIndex: "paymentTime", slotName: "paymentTime" },
  {
    title: "审核状态",
    dataIndex: "auditStatus",
    slotName: "auditStatus",
  },
  { title: "审核备注", dataIndex: "rejectReason", slotName: "rejectReason" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "worker:examineePaymentAudit:detail",
      "worker:examineePaymentAudit:update",
      "worker:examineePaymentAudit:delete",
    ]),
  },
]);

// 重置
const reset = () => {
  queryForm.examPlanId = undefined;
  queryForm.examineeId = undefined;
  queryForm.auditStatus = undefined;
  queryForm.classId = undefined
  search();
};

const isImage = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
}


const PaymentModalRef = ref<InstanceType<typeof PaymentModal>>();

const sinReview = (record: any) => {
  reviewIds.value = [];
  reviewIds.value.push(record.id);
  onExamine(reviewIds.value)
}

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
      if (row.auditStatus !== 1 && row.auditStatus !== 4) {
        Message.warning("选中的记录中包含非未审核状态的数据，请重新选择");
        return;
      }
      reviewIds.value.push(row.id);
    }
  }
  onExamine(reviewIds.value)
};

//审核
const onExamine = async (reviewIds: any[]) => {
  PaymentModalRef.value?.onExamine(
    reviewIds
  );
};

const ExamineePaymentAuditDetailDrawerRef =
  ref<InstanceType<typeof ExamineePaymentAuditDetailDrawer>>();
// 详情
const onDetail = (record: ExamineePaymentAuditResp) => {
  ExamineePaymentAuditDetailDrawerRef.value?.onOpen(record.id);
};

const getPreviewUrl = (url: string) => {
  if (!url) {
    Message.warning("暂无文件可预览");
    return;
  }
  // 提取文件扩展名
  const ext = url.split(".").pop()?.toLowerCase();
  if (ext === "pdf") {
    //  PDF 直接在浏览器中预览
    window.open(url, "_blank");
  } else if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
    //  Office 文件使用微软在线预览
    const previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
      url
    )}`;
    window.open(previewUrl, "_blank");
  } else {
    Message.warning("暂不支持此文件类型预览");
  }
};

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement;
  img.src = "/images/ce853a5576cd3913a87d709a354cdef.png"; // 你的默认图片路径
  img.onerror = null; // 防止默认图片也加载失败时无限循环
};

onMounted(async () => {
  const res = await getSelectOrgProjectClass(0)
  orgCategoryClassOptions.value = res.data
})
</script>

<style scoped lang="scss">
.image-list {
  display: flex;
  /* 横向排列 */
  flex-wrap: wrap;
  /* 空间不足自动换行 */
  gap: 8px;
  /* 图片间距，可调 */
}
</style>
