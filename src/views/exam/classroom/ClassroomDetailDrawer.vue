<template>
  <a-drawer v-model:visible="visible" title="考场详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="考场名称">{{ dataDetail?.classroomName }}</a-descriptions-item>
      <a-descriptions-item label="最大容纳人数">{{ dataDetail?.maxCandidates }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ClassroomDetailResp, getClassroom as getDetail } from '@/apis/exam/classroom'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ClassroomDetailResp>()
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
