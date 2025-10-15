<template>
  <a-drawer v-model:visible="visible" title="知识类型，存储不同类型的知识占比详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <!-- <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item> -->
      <a-descriptions-item label="项目名称">{{ projectName }}</a-descriptions-item>
      <a-descriptions-item label="知识类型名称">{{ dataDetail?.name }}</a-descriptions-item>
      <a-descriptions-item label="占比（百分比）">{{ dataDetail?.proportion }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="是否删除（0-未删除，1-已删除）">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type KnowledgeTypeDetailResp, getKnowledgeType as getDetail } from '@/apis/examconnect/knowledgeType'

const props = defineProps<{
  projectName?: string
}>()

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<KnowledgeTypeDetailResp>()
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
