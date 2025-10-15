<template>
  <a-drawer v-model:visible="visible" title="专家信息详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="专家名字">{{ dataDetail?.name }}</a-descriptions-item>
      <a-descriptions-item label="身份证号">{{ dataDetail?.idCard }}</a-descriptions-item>
      <a-descriptions-item label="学历">{{ dataDetail?.education }}</a-descriptions-item>
      <a-descriptions-item label="专家称号">{{ dataDetail?.title }}</a-descriptions-item>
      <a-descriptions-item label="头像路径">{{ dataDetail?.avatar }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExpertDetailResp, getExpert as getDetail } from '@/apis/training/expert'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExpertDetailResp>()
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
