<template>
  <a-modal v-model:visible="visible" title="申请列表" :width="1100" :footer="null" :mask-closable="false"
    @cancel="handleClose">
    <a-spin :loading="loading">
      <GiTable title="" row-key="id" :data="dataList" :columns="columns" :scroll="{ x: '100%', y: 400, minWidth: 900 }"
        :pagination="pagination" :disabled-tools="['size']">
        <template #toolbar-left>
          <a-select v-model="queryForm.trainingApplyStatus" placeholder="申请状态" allow-clear class="search-input ml-2"
            @change="search" style="margin-left: 8px">
            <a-option value="1">待审核</a-option>
            <a-option value="2">驳回</a-option>
            <a-option value="3">通过</a-option>
          </a-select>
          <a-input-search v-model="queryForm.nickname" placeholder="请输入姓名" allow-clear @search="search" />
          <a-input-search v-model="queryForm.username" placeholder="请输入身份证" allow-clear @search="search"
            style="margin-left: 8px" />
          <a-button @click="reset">
            <template #icon><icon-refresh /></template>
            <template #default>重置</template>
          </a-button>
        </template>
        <template #trainingCertificate="{ record }">
          <a-space wrap>
            <template v-for="(url, idx) in (record.trainingCertificate || '').split(
              ','
            )" :key="idx">
              <a-image v-if="isImage(url)" :src="url" width="60" height="60" fit="cover"
                style="cursor: pointer; border-radius: 4px" />
              <a-link v-else-if="isPdf(url)" title="预览文件" @click="getPreviewUrl(url)" style="margin-right: 8px">
                PDF预览
              </a-link>
              <span v-else>-</span>
            </template>
          </a-space>
        </template>
        <template #trainingApplyStatus="{ record }">
          <a-tag :color="getTrainingApplyStatusColor(record.trainingApplyStatus)" bordered>
            {{ getTrainingApplyStatusText(record.trainingApplyStatus) }}
          </a-tag>
        </template>
        <template #action="{ record }">
          <a-space>
            <a-link v-permission="['notice:training:detail']" title="详情" @click="onDetail(record)">详情</a-link>
          </a-space>
        </template>
      </GiTable>
    </a-spin>
  </a-modal>
  <ApplyDetailModel ref="applyDetailModelRef" @refresh-list="refreshList" />
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { onlineCourseApplyPage } from "@/apis/exam/examineeNoticeApply";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import ApplyDetailModel from "./ApplyDetailModel.vue";

defineOptions({ name: "ApplyOnlineCourseList" });

const visible = ref(false);

const queryForm = reactive({
  trainingApplyStatus: "1",
  nickname: undefined as string | undefined,
  username: undefined as string | undefined,
  noticeId: undefined as string | undefined,
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  refresh,
} = useTable((page) => onlineCourseApplyPage({ ...queryForm, ...page }), {
  immediate: false,
});

const columns = ref<TableInstanceColumns[]>([
  {
    title: "身份证号",
    dataIndex: "username",
    slotName: "username",
    width: 200,
  },
  { title: "姓名", dataIndex: "nickname", slotName: "nickname", width: 100 },
  {
    title: "单据",
    dataIndex: "trainingCertificate",
    slotName: "trainingCertificate",
  },
  {
    title: "申请状态",
    dataIndex: "trainingApplyStatus",
    slotName: "trainingApplyStatus",
    width: 100,
  },
  {
    title: "驳回原因",
    dataIndex: "trainingDismissal",
    slotName: "trainingDismissal",
  },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 100,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr(["notice:training:detail"]),
  },
]);

const applyDetailModelRef = ref<InstanceType<typeof ApplyDetailModel>>();

const refreshList = () => {
  visible.value = true;
  refresh();
};
// 申请培训详情
const onDetail = (record: any) => {
  visible.value = false;
  applyDetailModelRef.value?.onOpen(record.id);
};
const handleClose = () => {
  visible.value = false;
  queryForm.trainingApplyStatus = "1";
  queryForm.nickname = undefined;
  queryForm.username = undefined;
};
const getTrainingApplyStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "orange";
    case 1:
      return "blue";
    case 2:
      return "red";
    case 3:
      return "green";
  }
};

const getTrainingApplyStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待申请";
    case 1:
      return "待审核";
    case 2:
      return "驳回";
    case 3:
      return "通过";
    default:
      return "未知状态";
  }
};

const getPracticalTypeText = (type: number | string) => {
  if (!type) return "-";
  const map: Record<string, string> = {
    "1": "笔试",
    "2": "实操",
    "3": "笔试+实操",
  };
  return map[String(type)] || String(type);
};

const isImage = (url: string) =>
  /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tif|tiff|jfif|avif|heic|heif)(\?.*)?$/i.test(url)

const isPdf = (url: string) => /\.pdf$/i.test(url);
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
const reset = () => {
  queryForm.nickname = undefined;
  queryForm.username = undefined;
  search();
};

const onOpen = (id: string) => {
  queryForm.noticeId = id;
  visible.value = true;
  search();
};
defineExpose({ onOpen });
</script>
