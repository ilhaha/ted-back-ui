<template>
  <a-drawer v-model:visible="visible" :title="title" :width="width >= 1300 ? 1300 : '100%'" :footer="false">
    <ExamNoticeApplyTable :notice-id="dataId" />
  </a-drawer>
</template>

<script setup lang="ts">
import ExamNoticeApplyTable from '@/views/exam/examineeNoticeApply/index.vue'
import { useWindowSize } from '@vueuse/core'
import { type ExamNoticeDetailResp, getExamNotice as getDetail } from '@/apis/exam/examNotice'

const { width } = useWindowSize()

const dataId = ref('')
const title = ref('')
const dataDetail = ref<ExamNoticeDetailResp>()
const visible = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
  title.value = dataDetail.value.title + " - 报名学员详情"
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
