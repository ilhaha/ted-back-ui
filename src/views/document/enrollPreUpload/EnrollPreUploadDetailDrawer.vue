<template>
  <a-drawer v-model:visible="visible" title="机构报考-考生扫码上传文件详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考生ID">{{ dataDetail?.candidatesId }}</a-descriptions-item>
      <a-descriptions-item label="考试计划ID">{{ dataDetail?.planId }}</a-descriptions-item>
      <a-descriptions-item label="班级批次ID（若个人报名则为空）">{{ dataDetail?.batchId }}</a-descriptions-item>
      <a-descriptions-item label="报名资格申请表URL">{{ dataDetail?.qualificationFileUrl }}</a-descriptions-item>
      <a-descriptions-item label="审核状态（0未审核，1审核通过，2退回补正，3虚假资料-禁止再次申报项目）">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="审核意见或退回原因">{{ dataDetail?.remark }}</a-descriptions-item>
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
import { type EnrollPreUploadDetailResp, getEnrollPreUpload as getDetail } from '@/apis/document/enrollPreUpload'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<EnrollPreUploadDetailResp>()
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
