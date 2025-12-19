<template>
  <a-drawer v-model:visible="visible" title="考试劳务费配置详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="计划ID">{{ dataDetail?.planId }}</a-descriptions-item>
      <a-descriptions-item label="考生ID">{{ dataDetail?.candidateId }}</a-descriptions-item>
      <a-descriptions-item label="违规描述">{{ dataDetail?.violationDesc }}</a-descriptions-item>
      <a-descriptions-item label="违规图片">{{ dataDetail?.illegalUrl }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="修改时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamViolationDetailResp, getExamViolation as getDetail } from '@/apis/exam/examViolation'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamViolationDetailResp>()
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
