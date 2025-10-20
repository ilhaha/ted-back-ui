<template>
  <a-drawer v-model:visible="visible" title="培训机构班级详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="id">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="机构id">{{ dataDetail?.orgId }}</a-descriptions-item>
      <a-descriptions-item label="项目id">{{ dataDetail?.projectId }}</a-descriptions-item>
      <a-descriptions-item label="班级名称">{{ dataDetail?.className }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人id">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="是否删除 0-未删除 1-已删除">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type OrgClassDetailResp, getOrgClass as getDetail } from '@/apis/training/orgClass'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<OrgClassDetailResp>()
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
