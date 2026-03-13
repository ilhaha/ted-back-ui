<template>
  <a-drawer v-model:visible="visible" title="考生类型详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考生id">{{ dataDetail?.candidateId }}</a-descriptions-item>
      <a-descriptions-item label="类型，0作业人员，1检验人员">{{ dataDetail?.type }}</a-descriptions-item>
      <a-descriptions-item label="是否黑名单 0-否 1-是">{{ dataDetail?.isBlacklist }}</a-descriptions-item>
      <a-descriptions-item label="加入黑名单原因">{{ dataDetail?.blacklistReason }}</a-descriptions-item>
      <a-descriptions-item label="黑名单时长类型 0-无 1-1天 2-1个月 3-3个月 4-6个月 5-1年">{{ dataDetail?.blacklistDurationType }}</a-descriptions-item>
      <a-descriptions-item label="加入黑名单时间">{{ dataDetail?.blacklistTime }}</a-descriptions-item>
      <a-descriptions-item label="黑名单结束时间">{{ dataDetail?.blacklistEndTime }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="修改时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="删除标记">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type CandidateTypeDetailResp, getCandidateType as getDetail } from '@/apis/training/candidateType'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<CandidateTypeDetailResp>()
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
