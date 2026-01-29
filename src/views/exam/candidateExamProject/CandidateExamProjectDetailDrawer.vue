<template>
  <a-drawer v-model:visible="visible" title="考生-考试项目考试状态详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考生ID">{{ dataDetail?.candidateId }}</a-descriptions-item>
      <a-descriptions-item label="考试项目ID">{{ dataDetail?.projectId }}</a-descriptions-item>
      <a-descriptions-item label="当前考试轮次（0表示未开始）">{{ dataDetail?.attemptNo }}</a-descriptions-item>
      <a-descriptions-item label="当前轮次是否已补考：0-否 1-是">{{ dataDetail?.usedMakeup }}</a-descriptions-item>
      <a-descriptions-item label="是否通过：0-未通过 1-通过">{{ dataDetail?.passed }}</a-descriptions-item>
      <a-descriptions-item label="通过时间">{{ dataDetail?.passTime }}</a-descriptions-item>
      <a-descriptions-item label="证书过期时间">{{ dataDetail?.certificateExpireTime }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="删除标记(0未删,1已删)">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type CandidateExamProjectDetailResp, getCandidateExamProject as getDetail } from '@/apis/exam/candidateExamProject'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<CandidateExamProjectDetailResp>()
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
