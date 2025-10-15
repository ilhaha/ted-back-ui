<template>
  <a-drawer v-model:visible="visible" title="考生资料关系详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="关联ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考生ID">{{ dataDetail?.examineeId }}</a-descriptions-item>
      <a-descriptions-item label="资料ID">{{ dataDetail?.documentId }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人ID">{{ dataDetail?.updatedUser }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createdTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updatedTime }}</a-descriptions-item>
      <a-descriptions-item label="删除标记(0未删,1已删)">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamineeDocumentDetailResp, getExamineeDocument as getDetail } from '@/apis/document/examineeDocument'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamineeDocumentDetailResp>()
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
