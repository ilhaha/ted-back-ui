<template>
  <a-drawer v-model:visible="visible" title="持证信息详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考生ID">{{ dataDetail?.examineeId }}</a-descriptions-item>
      <a-descriptions-item label="持证项目编码">{{ dataDetail?.projectCode }}</a-descriptions-item>
      <a-descriptions-item label="项目等级  0-无 1一级 2 二级">{{ dataDetail?.projectLevel }}</a-descriptions-item>
      <a-descriptions-item label="有效开始日期">{{ dataDetail?.validStartDate }}</a-descriptions-item>
      <a-descriptions-item label="有效结束日期">{{ dataDetail?.validEndDate }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间戳">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间戳">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="删除标记">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type LicenseHolderInfoDetailResp, getLicenseHolderInfo as getDetail } from '@/apis/exam/licenseHolderInfo'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<LicenseHolderInfoDetailResp>()
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
