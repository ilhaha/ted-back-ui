<template>
  <a-modal v-model:visible="visible" title="考生报考详情" :width="width >= 900 ? 900 : '100%'" :footer="false"
    :mask-closable="false" @cancel="handleModalCancel">
    <div class="section-title">审核信息</div>
    <table class="info-table" style="margin-bottom: 20px;">
      <tbody>
        <tr>
          <td class="info-label" style="background-color: #fff1f0;">上次原因</td>
          <td class="info-value">{{ examineeNoticeApplyInfo.remark || '-' }}
          </td>
          <td class="info-label" style="background-color: #fff1f0;">驳回原因</td>
          <td class="info-value" style="padding: 5px 5px 0px 5px">
            <a-textarea v-model="remark" placeholder="请输入驳回原因" allow-clear :auto-size="{
              minRows: 3
            }" />

          </td>
          <td class="info-value" style=" text-align: center;">
            <!-- <a-button type="outline" @click="handleApprove" :loading="submitLoading"
              v-permission="['exam:examineeNoticeApply:audit']" v-if="examineeNoticeApplyInfo.status == 1">通过</a-button>
            <a-button type="outline" status="danger" @click="handleReject" :loading="submitLoading"
              style="margin-left: 8px;" v-permission="['exam:examineeNoticeApply:audit']"
              v-if="examineeNoticeApplyInfo.status == 1 || examineeNoticeApplyInfo.status == 2">驳回</a-button> -->

            <a-space>
              <a-link title="通过" @click="handleApprove" :loading="submitLoading"
                v-permission="['exam:examineeNoticeApply:audit']" v-if="examineeNoticeApplyInfo.status == 1">通过</a-link>

              <a-link status="danger" :loading="submitLoading" v-permission="['exam:examineeNoticeApply:audit']"
                v-if="examineeNoticeApplyInfo.status == 1 || examineeNoticeApplyInfo.status == 2"
                @click="handleReject">驳回</a-link>
            </a-space>
          </td>
        </tr>
      </tbody>
    </table>
    <div class="section-title">报考信息</div>
    <a-scrollbar style="height:600px;overflow: auto;">
      <a-spin :loading="loading">
        <!-- 报考信息 -->

        <table class="info-table">
          <tbody>
            <tr>
              <td class="info-label">考生姓名</td>
              <td class="info-value" colspan="2">{{ idCardInfo.realName || '-' }}</td>
              <td class="info-label">性别</td>
              <td class="info-value" colspan="2">{{ idCardInfo.gender || '-' }}</td>
            </tr>
            <tr>
              <td class="info-label">身份证号</td>
              <td class="info-value" colspan="5">{{ idCardInfo.idCardNumber || '-' }}</td>

            </tr>
            <tr>
              <td class="info-label">学历</td>
              <td class="info-value" colspan="2">{{ idCardInfo.education || '-' }}</td>
              <td class="info-label">专业类型</td>
              <td class="info-value" colspan="2">{{ idCardInfo.majorType || '-' }}</td>

            </tr>
            <tr>
              <td class="info-label">专业</td>
              <td class="info-value" colspan="5">{{ idCardInfo.relatedMajor || '-' }}</td>
            </tr>
            <tr>
              <td class="info-label">技术职称</td>
              <td class="info-value" colspan="2">{{ idCardInfo.qualification || '-' }}</td>
              <td class="info-label">工作年限</td>
              <td class="info-value" colspan="2">{{ idCardInfo.workYears || '-' }}</td>
            </tr>
            <tr>
              <td class="info-label">移动电话</td>
              <td class="info-value" colspan="5">{{ idCardInfo.phone || '-' }}</td>
            </tr>
            <tr>
              <td class="info-label">单位名称</td>
              <td class="info-value" colspan="5">{{ idCardInfo.companyName || '-' }}</td>
            </tr>
            <tr>
              <td class="info-label">通信地址</td>
              <td class="info-value" colspan="5">{{ idCardInfo.address || '-' }}</td>
            </tr>
            <tr>
              <td class="info-label">所在地</td>
              <td class="info-value" colspan="2">{{ idCardInfo.region || '-' }}</td>
              <td class="info-label">邮政编码</td>
              <td class="info-value" colspan="2">{{ idCardInfo.postalCode || '-' }}</td>
            </tr>
            <tr>
              <td class="info-label" colspan="6" style="text-align: center;">申请种类与项目级别</td>
            </tr>
            <tr>
              <td class="form-wrapper" colspan="6" v-if="applyProjectList && applyProjectList.length > 0">
                <a-row v-for="item in applyProjectList" :key="item.projectCode" :gutter="[0, 8]"
                  style="text-align: center;">
                  <a-col :span="8">
                    <div class="form-item " style="border-right: 0;background-color: #f5f5f5;">
                      <span class="form-value ">{{ item.projectCode || '-' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="form-item" style="border-right: 0;">
                      <span class="form-value "> {{ item.examAttemptType === 1 ? '初试' : item.examAttemptType === 2 ?
                        '补考'
                        : '-' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="8">
                    <div class="form-item">
                      <span class="form-value">{{ getPracticalTypes(item.practicalType) }}</span>
                    </div>
                  </a-col>
                </a-row>
              </td>
            </tr>
            <tr>
              <td class="info-label" colspan="6" style="text-align: center;">已持证项目</td>
            </tr>
            <tr>
              <td class="form-wrapper" colspan="6" style="padding: 8px 50px;"
                v-if="licenseHolderList && licenseHolderList.length > 0">
                <a-row v-for="item in licenseHolderList" :key="item.id" :gutter="[0, 8]" style="text-align: center;">
                  <a-col :span="4">
                    <div class="form-item " style="border-right: 0;background-color: #f5f5f5;">
                      <span class="form-value ">{{ item.projectCode || '-' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="4">
                    <div class="form-item" style="border-right: 0;">
                      <span class="form-value "> {{ item.projectLevel === 1 ? 'Ⅰ级' : item.projectLevel === 2 ? 'Ⅱ级'
                        : '-' }}</span>
                    </div>
                  </a-col>
                  <a-col :span="4">
                    <div class="form-item" style="border-right: 0;background-color: #f5f5f5;">
                      <span class=" form-value">取证日期</span>
                    </div>
                  </a-col>
                  <a-col :span="4">
                    <div class="form-item" style="border-right: 0;">
                      <span class="form-value "> {{ item.validStartDate }}</span>
                    </div>
                  </a-col>
                  <a-col :span="4">
                    <div class="form-item" style="border-right: 0;background-color: #f5f5f5;">
                      <span class=" form-value">有效期</span>
                    </div>
                  </a-col>
                  <a-col :span="4">
                    <div class="form-item">
                      <span class="form-value "> {{ item.validEndDate }}</span>
                    </div>
                  </a-col>
                </a-row>
              </td>
              <td v-else style="border: 0; text-align: center;" colspan="6">
                <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
                  <a-empty />
                </div>
              </td>
            </tr>
            <tr>
              <td class="info-label" colspan="6" style="text-align: center;">上传资料</td>
            </tr>
            <template v-if="alreadyUploadDocList && alreadyUploadDocList.length > 0">
              <tr v-for="item in alreadyUploadDocList" :key="item.id">

                <!-- 第一列 -->
                <td class="info-label">
                  {{ item.typeName }}
                </td>

                <!-- 文件展示 -->
                <td class="info-value" colspan="5">
                  <div class="file-list">

                    <template v-for="(file, index) in getFileList(item.docPath)" :key="index">

                      <!-- 图片 -->
                      <a-image v-if="isImage(file)" :src="file" width="90" height="90" fit="cover" />

                      <!-- PDF -->
                      <div v-else-if="isPdf(file)" class="pdf-box" style="margin-left: 10px;">
                        <a-button type="primary" size="small" @click="previewPdf(file)">
                          PDF在线预览
                        </a-button>
                      </div>

                      <!-- 其他文件 -->
                      <div v-else class="file-box">
                        文件
                      </div>

                    </template>

                    <!-- 空状态 -->
                    <a-empty v-if="getFileList(item.docPath).length === 0" />

                  </div>
                </td>

              </tr>
            </template>
            <template v-else>
              <td style="border: 0; text-align: center;" colspan="6">
                <div style="display: flex; justify-content: center; align-items: center; width: 100%;">
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
import { useWindowSize } from '@vueuse/core'
import { getCandidateApplyDetail, auditExamineeNoticeApply } from '@/apis/exam/examineeNoticeApply'
import { Message } from '@arco-design/web-vue'

const emit = defineEmits<{
  'refresh-list': []
}>()

const { width } = useWindowSize()
const dataDetail = ref<any>()
const visible = ref(false)
const loading = ref(false)
const submitLoading = ref(false)
const remark = ref('')

const applyId = ref('')
const idCardInfo = computed(() => dataDetail.value?.examIdcardResp || {})
const applyProjectList = computed(() => dataDetail.value?.applyProjectList || [])
const licenseHolderList = computed(() => dataDetail.value?.licenseHolderList || [])
const alreadyUploadDocList = computed(() => dataDetail.value?.alreadyUploadDocList || [])
const examineeNoticeApplyInfo = computed(() => dataDetail.value?.examineeNoticeApplyResp || {})

const getFileList = (docPath?: string) => {
  if (!docPath) return []

  return docPath
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
}

const isImage = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
}

const isPdf = (url: string) => {
  return /\.pdf$/i.test(url)
}

const previewPdf = (url: string) => {
  window.open(url, '_blank')
}

const getStatusText = (status: string | number | undefined) => {
  if (status === undefined || status === null) return '-'
  const num = Number(status)
  switch (num) {
    case 0: return '待报名'
    case 1: return '报名待审核'
    case 2: return '报名审核通过'
    case 3: return '报名审核未通过'
    case 4: return '完成部分项目考试'
    case 5: return '已完成全部考试'
    default: return String(status)
  }
}

// 获取实操类型文本（位运算）
const getPracticalTypes = (value: number) => {
  if (!value) return '-'
  const types = []
  if (value & 1) types.push('实操')
  if (value & 2) types.push('拍片')
  if (value & 4) types.push('评片')
  if (value & 8) types.push('开卷')
  if (value & 16) types.push('闭卷')
  return types.length > 0 ? types.join('、') : '-'
}

const reset = () => {
  remark.value = ''
}

// 弹窗关闭时重置并通知父组件刷新
const handleModalCancel = () => {
  reset()
  emit('refresh-list')
}

// 打开弹窗
const onOpen = async (id: string) => {
  try {
    loading.value = true
    applyId.value = id
    await init(applyId.value)
    visible.value = true
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const init = async (applyId: string) => {
  const res = await getCandidateApplyDetail(applyId)
  dataDetail.value = res.data
}

// 通过审核
const handleApprove = async () => {
  if (!examineeNoticeApplyInfo.value?.id) return
  try {
    submitLoading.value = true
    await auditExamineeNoticeApply({ id: examineeNoticeApplyInfo.value.id, remark: remark.value, status: 2 })
    Message.success('审核通过')
    remark.value = ''
    init(applyId.value)
  } catch (error) {
  } finally {
    submitLoading.value = false
  }
}

// 驳回审核
const handleReject = async () => {
  if (!examineeNoticeApplyInfo.value?.id) return
  if (!remark.value.trim()) {
    Message.error("请输入驳回原因")
    return
  }
  try {
    submitLoading.value = true
    await auditExamineeNoticeApply({ id: examineeNoticeApplyInfo.value.id, remark: remark.value, status: 3 })
    Message.success('已驳回')
    remark.value = ''
    init(applyId.value)
  } catch (error) {
  } finally {
    submitLoading.value = false
  }
}

// 关闭弹窗
const handleClose = () => {
  emit('refresh-list')
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
.file-list {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 50px;
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
    font-family: 'Courier New', monospace;
  }
}
</style>
