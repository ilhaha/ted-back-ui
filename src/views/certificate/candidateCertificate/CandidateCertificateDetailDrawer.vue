<template>
  <a-drawer v-model:visible="visible" title="考生证件详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
<!--      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>-->
      <a-descriptions-item label="考生名称">{{ dataDetail?.candidateId }}</a-descriptions-item>
      <a-descriptions-item label="证件名称">{{ dataDetail?.certificateId }}</a-descriptions-item>
      //，0:未持有;1:持有;2:到期;3:待换证
      <a-descriptions-item label="证件状态">{{ dataDetail?.certificateStatus }}</a-descriptions-item>
      <a-descriptions-item label="证件编号">{{ dataDetail?.certificateNumber }}</a-descriptions-item>
      <a-descriptions-item label="颁发人">{{ dataDetail?.issuerId }}</a-descriptions-item>
      <a-descriptions-item label="持有时间">{{ dataDetail?.holdingDate }}</a-descriptions-item>
      <a-descriptions-item label="到期时间">{{ dataDetail?.expiryDate }}</a-descriptions-item>
<!--      <a-descriptions-item label="是否删除，0:未删除，1:已删除">{{ dataDetail?.isDeleted }}</a-descriptions-item>-->
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type CandidateCertificateDetailResp, getCandidateCertificate as getDetail } from '@/apis/certificate/candidateCertificate'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<CandidateCertificateDetailResp>()
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
