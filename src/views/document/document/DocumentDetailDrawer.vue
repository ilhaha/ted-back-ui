<template>
  <a-drawer v-model:visible="visible" title="资料核心存储详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="存储路径">{{ dataDetail?.docPath }}</a-descriptions-item>
      <a-descriptions-item label="关联资料类型">{{ dataDetail?.typeName }}</a-descriptions-item>
      <a-descriptions-item label="审核状态">{{ statusText }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type DocumentDetailResp, getDocument as getDetail } from '@/apis/document/document'
import { computed } from 'vue'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<DocumentDetailResp>()
const visible = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 审核状态对应中文
const statusText = computed(() => {
  if (dataDetail.value?.status === 0) return '待审核'
  if (dataDetail.value?.status === 1) return '已生效'
  if (dataDetail.value?.status === 2) return '未通过'
  return '未知状态'  // 如果状态不在0, 1, 2范围内
})

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
