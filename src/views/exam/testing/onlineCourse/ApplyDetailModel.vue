<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :width="width >= 900 ? 900 : '100%'"
    :footer="false"
    :mask-closable="false"
    @cancel="handleModalCancel"
  >
    <div class="section-title">审核信息</div>
    <table class="info-table" style="margin-bottom: 20px">
      <tbody>
        <tr>
          <td class="info-label" style="background-color: #fff1f0">驳回原因</td>
          <td class="info-value" style="padding: 5px 5px 0px 5px">
            <a-textarea
              :disabled="info.trainingApplyStatus != 1"
              v-model="remark"
              placeholder="请输入驳回原因"
              allow-clear
              :auto-size="{
                minRows: 3,
              }"
            />
          </td>
          <td class="info-value" style="text-align: center">
            <a-space v-if="info.trainingApplyStatus == 1">
              <a-link
                title="通过"
                @click="handleApprove"
                :loading="submitLoading"
                v-permission="['notice:applyTraining:audit']"
                >通过</a-link
              >

              <a-link
                status="danger"
                :loading="submitLoading"
                v-permission="['notice:applyTraining:audit']"
                @click="handleReject"
                >驳回</a-link
              >
            </a-space>
            <a-space v-else>
              <span>暂无操作</span>
            </a-space>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="section-title">个人信息</div>
    <a-scrollbar style="overflow: auto">
      <a-spin :loading="loading">
        <!-- 报考信息 -->

        <table class="info-table">
          <tbody>
            <tr>
              <td class="info-label">考生姓名</td>
              <td class="info-value" colspan="2">
                {{ info.realName || "-" }}
              </td>
              <td class="info-label">性别</td>
              <td class="info-value" colspan="2">
                {{ info.gender || "-" }}
              </td>
            </tr>
            <tr>
              <td class="info-label">身份证号</td>
              <td class="info-value" colspan="5">
                {{ info.idCardNumber || "-" }}
              </td>
            </tr>
            <tr>
              <td class="info-label">学历</td>
              <td class="info-value" colspan="2">
                {{ info.education || "-" }}
              </td>
              <td class="info-label">专业类型</td>
              <td class="info-value" colspan="2">
                {{ info.majorType || "-" }}
              </td>
            </tr>
            <tr>
              <td class="info-label">专业</td>
              <td class="info-value" colspan="5">
                {{ info.relatedMajor || "-" }}
              </td>
            </tr>
            <tr>
              <td class="info-label">技术职称</td>
              <td class="info-value" colspan="2">
                {{ info.qualification || "-" }}
              </td>
              <td class="info-label">工作年限</td>
              <td class="info-value" colspan="2">
                {{ info.workYears || "-" }}
              </td>
            </tr>
            <tr>
              <td class="info-label">移动电话</td>
              <td class="info-value" colspan="5">
                {{ info.phone || "-" }}
              </td>
            </tr>
            <tr>
              <td class="info-label">单位名称</td>
              <td class="info-value" colspan="5">
                {{ info.companyName || "-" }}
              </td>
            </tr>
            <tr>
              <td class="info-label">通信地址</td>
              <td class="info-value" colspan="5">
                {{ info.address || "-" }}
              </td>
            </tr>
            <tr>
              <td class="info-label">所在地</td>
              <td class="info-value" colspan="2">
                {{ info.region || "-" }}
              </td>
              <td class="info-label">邮政编码</td>
              <td class="info-value" colspan="2">
                {{ info.postalCode || "-" }}
              </td>
            </tr>

            <tr>
              <td class="info-label" colspan="6" style="text-align: center">
                交费单
              </td>
            </tr>
            <template v-if="info.trainingCertificate">
              <tr>
                <!-- 第一列 -->
                <td class="info-label">单据</td>

                <!-- 文件展示 -->
                <td class="info-value" colspan="5">
                  <div class="file-list">
                    <template
                      v-for="(file, index) in getFileList(
                        info.trainingCertificate
                      )"
                      :key="index"
                    >
                      <!-- 图片 -->
                      <a-image
                        v-if="isImage(file)"
                        :src="file"
                        width="90"
                        height="90"
                        fit="cover"
                      />

                      <!-- PDF -->
                      <div
                        v-else-if="isPdf(file)"
                        class="pdf-box"
                        style="margin-left: 10px"
                      >
                        <a-button
                          type="primary"
                          size="small"
                          @click="previewPdf(file)"
                        >
                          PDF在线预览
                        </a-button>
                      </div>

                      <!-- 其他文件 -->
                      <div v-else class="file-box">文件</div>
                    </template>

                    <!-- 空状态 -->
                    <a-empty
                      v-if="info.trainingCertificate.split(',').length === 0"
                    />
                  </div>
                </td>
              </tr>
            </template>
            <template v-else>
              <td style="border: 0; text-align: center" colspan="6">
                <div
                  style="
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                  "
                >
                  <a-empty />
                </div>
              </td>
            </template>
          </tbody>
        </table>
      </a-spin>
    </a-scrollbar>
  </a-modal>
</template>

<script setup lang="ts">
import { useWindowSize } from "@vueuse/core";
import {
  getCandidateApplyTrainingDetail,
  auditTrainingApply,
} from "@/apis/exam/examineeNoticeApply";
import { Message } from "@arco-design/web-vue";

const emit = defineEmits<{
  "refresh-list": [];
}>();

const { width } = useWindowSize();
const dataDetail = ref<any>();
const visible = ref(false);
const loading = ref(false);
const submitLoading = ref(false);
const remark = ref("");
const title = ref("");
const applyId = ref("");
const info = computed(() => dataDetail.value || {});

const getFileList = (docPath?: string) => {
  if (!docPath) return [];

  return docPath
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const isImage = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tif|tiff|jfif|avif|heic|heif)(\?.*)?$/i.test(url)
}


const isPdf = (url: string) => {
  return /\.pdf$/i.test(url);
};

const previewPdf = (url: string) => {
  window.open(url, "_blank");
};

const reset = () => {
  remark.value = "";
};

// 弹窗关闭时重置并通知父组件刷新
const handleModalCancel = () => {
  reset();
  emit("refresh-list");
};

// 打开弹窗
const onOpen = async (id: string) => {
  try {
    loading.value = true;
    applyId.value = id;
    await init(applyId.value);
    visible.value = true;
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

const init = async (applyId: string) => {
  const res = await getCandidateApplyTrainingDetail(applyId);
  dataDetail.value = res.data;
  title.value = dataDetail.value.realName + " - 培训申请详情";
  remark.value = dataDetail.value.trainingDismissal || "";
};

// 通过审核
const handleApprove = async () => {
  if (!applyId.value) return;
  try {
    submitLoading.value = true;
    await auditTrainingApply({
      id: applyId.value,
      remark: remark.value,
      trainingApplyStatus: 3,
    });
    Message.success("审核通过");
    remark.value = "";
    init(applyId.value);
  } catch (error) {
  } finally {
    submitLoading.value = false;
  }
};

// 驳回审核
const handleReject = async () => {
  if (!applyId.value) return;
  if (!remark.value.trim()) {
    Message.error("请输入驳回原因");
    return;
  }
  try {
    submitLoading.value = true;
    await auditTrainingApply({
      id: applyId.value,
      remark: remark.value,
      trainingApplyStatus: 2,
    });
    Message.success("已驳回");
    remark.value = "";
    init(applyId.value);
  } catch (error) {
  } finally {
    submitLoading.value = false;
  }
};

// 关闭弹窗
const handleClose = () => {
  emit("refresh-list");
};

defineExpose({ onOpen });
</script>

<style scoped lang="scss">
.file-list {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 45px;
  flex-wrap: wrap;
  min-height: 100px;
}

.pdf-box {
  width: 90px;
  height: 90px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-box {
  width: 90px;
  height: 90px;
  border: 1px solid var(--color-border-2);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: var(--color-fill-2);
}

.section-title {
  font-weight: 600;
  color: var(--color-text-1);
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid rgb(var(--primary-6));
}

.info-table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  border: 1px solid var(--color-border);
  table-layout: fixed;

  td {
    padding: 0;
    border: 1px solid var(--color-border);
    border-collapse: collapse;
  }

  .info-label {
    min-width: 80px;
    max-width: 140px;
    width: 15%;
    padding: 0 12px;
    font-weight: 500;
    color: var(--color-text-1);
    background: rgb(var(--primary-1));
    text-align: left;
    height: 36px;
  }

  .info-value {
    padding: 0 12px;
    color: var(--color-text-1);
    word-break: break-all;
    background: #fff;
    height: 36px;
  }

  .form-wrapper {
    padding: 8px 100px;
    background: #fff;
  }
}

.form-item {
  border: 1px solid var(--color-border);
  padding: 8px 12px;
  background: #fff;
  height: 100%;

  .form-label {
    display: block;
    font-size: 13px;
    color: var(--color-text-3);
    margin-bottom: 4px;
  }

  .form-value {
    display: block;
    font-size: 13px;
    color: var(--color-text-1);
  }

  .code-value {
    display: inline-block;
    padding: 2px 8px;
    background: rgb(var(--primary-1));
    border-radius: 4px;
    font-family: "Courier New", monospace;
  }
}
</style>
