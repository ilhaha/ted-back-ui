<template>
  <a-drawer v-model:visible="visible" title="作业人员报名详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="学历">{{ dataDetail?.education }}</a-descriptions-item>
      <a-descriptions-item label="工作单位">{{ dataDetail?.workUnit }}</a-descriptions-item>
      <a-descriptions-item label="通讯地址">{{ dataDetail?.address }}</a-descriptions-item>
      <a-descriptions-item label="政治面貌">{{ dataDetail?.politicalStatus }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type WorkerApplyDetailResp, getWorkerApply as getDetail } from '@/apis/worker/workerApply'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<WorkerApplyDetailResp>()
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
