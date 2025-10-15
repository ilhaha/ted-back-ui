<template>
  <a-drawer v-model:visible="visible" title="学习记录详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="学生名称">{{ dataDetail?.studentName }}</a-descriptions-item>
      <a-descriptions-item label="视频名称">{{ dataDetail?.videoName }}</a-descriptions-item>
      <a-descriptions-item label="已观看时长（秒）">{{ dataDetail?.watchedDuration }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type WatchRecordDetailResp, getWatchRecord as getDetail } from '@/apis/training/watchRecord'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<WatchRecordDetailResp>()
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
