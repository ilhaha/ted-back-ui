<template>
  <a-drawer v-model:visible="visible" title="复审详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键id">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="申请复审人员id">{{ dataDetail?.applicantId }}</a-descriptions-item>
      <a-descriptions-item label="申请复审证件id">{{ dataDetail?.certificateId }}</a-descriptions-item>
      <a-descriptions-item label="作业人员资格证url">{{ dataDetail?.certificateUrl }}</a-descriptions-item>
      <a-descriptions-item label="复审资格申请表url">{{ dataDetail?.applicantFormUrl }}</a-descriptions-item>
      <a-descriptions-item label="审核状态（0：未审核，1：已通过，2：未通过）">{{ dataDetail?.reexaminStatus }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="逻辑删除">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ReexamineDetailResp, getReexamine as getDetail } from '@/apis/certificate/reexamine'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ReexamineDetailResp>()
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
