<template>
  <a-drawer v-model:visible="visible" title="证件种类详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
<!--      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>-->
      <a-descriptions-item label="证件名称">{{ dataDetail?.certificateName }}</a-descriptions-item>
<!--      <a-descriptions-item label="是否删除，0:未删除，1:已删除">{{ dataDetail?.isDeleted }}</a-descriptions-item>-->
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type CertificateTypeDetailResp, getCertificateType as getDetail } from '@/apis/certificate/certificateType'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<CertificateTypeDetailResp>()
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
