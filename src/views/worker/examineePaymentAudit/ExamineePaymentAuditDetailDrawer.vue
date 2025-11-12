<template>
  <a-drawer v-model:visible="visible" title="考生缴费审核详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="关联考试计划ID">{{ dataDetail?.examPlanId }}</a-descriptions-item>
      <a-descriptions-item label="考生ID">{{ dataDetail?.examineeId }}</a-descriptions-item>
      <a-descriptions-item label="关联报名记录ID">{{ dataDetail?.enrollId }}</a-descriptions-item>
      <a-descriptions-item label="缴费金额（元）">{{ dataDetail?.paymentAmount }}</a-descriptions-item>
      <a-descriptions-item label="缴费时间">{{ dataDetail?.paymentTime }}</a-descriptions-item>
      <a-descriptions-item label="缴费凭证URL">{{ dataDetail?.paymentProofUrl }}</a-descriptions-item>
      <a-descriptions-item label="缴费通知单URL">{{ dataDetail?.auditNoticeUrl }}</a-descriptions-item>
      <a-descriptions-item label="审核状态：0-待审核，1-审核通过，2-审核驳回">{{ dataDetail?.auditStatus }}</a-descriptions-item>
      <a-descriptions-item label="驳回原因">{{ dataDetail?.rejectReason }}</a-descriptions-item>
      <a-descriptions-item label="审核人ID">{{ dataDetail?.auditorId }}</a-descriptions-item>
      <a-descriptions-item label="审核时间">{{ dataDetail?.auditTime }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="是否删除（0否，1是）">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamineePaymentAuditDetailResp, getExamineePaymentAudit as getDetail } from '@/apis/exam/examineePaymentAudit'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamineePaymentAuditDetailResp>()
const visible = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
