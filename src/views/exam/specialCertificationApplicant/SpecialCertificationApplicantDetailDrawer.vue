<template>
  <a-drawer
    v-model:visible="visible"
    title="检验人员报名审核详情"
    :width="width >= 600 ? 600 : '100%'"
    :footer="false"
  >
    <a-descriptions
      :column="1"
      size="large"
      class="general-description"
      bordered
    >
      <!-- <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item> -->

      <a-descriptions-item label="考生名称" :span="1">
        {{ dataDetail?.candidatesName }}
      </a-descriptions-item>

      <a-descriptions-item label="考生机构班级ID" :span="1">
        {{ dataDetail?.batchId ?? "个人申请" }}
      </a-descriptions-item>

      <a-descriptions-item label="申请表" :span="1">
        <!-- 如果有文件 URL，就显示可点击的在线预览链接 -->
        <template v-if="dataDetail?.imageUrl">
          <a
            :href="getPreviewUrl(dataDetail.imageUrl)"
            target="_blank"
            rel="noopener noreferrer"
          >
            查看申请表
          </a>
        </template>
        <span v-else>-</span>
      </a-descriptions-item>

      <a-descriptions-item label="状态" :span="1">
        <a-tag :color="getStatusColor(dataDetail?.status)">
          {{ getStatusText(dataDetail?.status) }}
        </a-tag>
      </a-descriptions-item>

      <a-descriptions-item label="审核意见" :span="1">
        {{ dataDetail?.remark || "-" }}
      </a-descriptions-item>

      <a-descriptions-item label="创建人" :span="1">
        {{ dataDetail?.createUserString }}
      </a-descriptions-item>

      <a-descriptions-item label="创建时间" :span="1">
        {{ dataDetail?.createTime }}
      </a-descriptions-item>

      <a-descriptions-item label="更新时间" :span="1">
        {{ dataDetail?.updateTime }}
      </a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import {
  type SpecialCertificationApplicantDetailResp,
  getSpecialCertificationApplicant as getDetail,
} from "@/apis/exam/specialCertificationApplicant";
import { ref } from "vue";

const props = defineProps<{}>();

const { width } = useWindowSize();

const dataId = ref("");
const dataDetail = ref<SpecialCertificationApplicantDetailResp>();
const visible = ref(false);



const getStatusColor = (status?: number) => {
  switch (status) {
    case 0:
      return "orange";
    case 1:
      return "green";
    case 2:
      return "red";
    case 3:
      return "red";
    case 4:
      return "orange";
    default:
      return "default";
  }
};

const getStatusText = (status?: number) => {
  switch (status) {
    case 0:
      return "未审核";
    case 1:
      return "审核通过";
    case 2:
      return "待补正";
    case 3:
      return "虚假信息";
    case 4:
      return "补正审核";
    default:
      return "未知状态";
  }
};

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value);
  dataDetail.value = data;
};

// 打开
const onOpen = async (id: string) => {
  dataId.value = id;
  await getDataDetail();
  visible.value = true;
};

const getPreviewUrl = (url: string) => {
  if (!url) return "#";
  const lower = url.toLowerCase();
  if (lower.endsWith(".pdf")) {
    return url; // PDF 直接浏览器打开
  } else if (
    lower.endsWith(".doc") ||
    lower.endsWith(".docx") ||
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".ppt") ||
    lower.endsWith(".pptx")
  ) {
    // Office 文件用微软在线预览
    return `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
      url
    )}`;
  } else {
    return url; // 其他文件直接下载
  }
};

defineExpose({ onOpen });
</script>

<style scoped lang="scss">
.general-description {
  :deep(.arco-descriptions-item-label) {
    width: 100px;
    font-weight: 500;
  }

  :deep(.arco-descriptions-item-value) {
    padding: 12px 16px;
  }
}

.preview-image {
  border-radius: 4px;
}
</style>
