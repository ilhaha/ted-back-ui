<template>
  <a-drawer v-model:visible="visible" :title="title" :width="width >= 1300 ? 1300 : '100%'" :footer="false"
    @close="handleCancel">
    <ExamNoticeApplyTable :notice-id="dataId" ref="examNoticeApplyTableRef"/>
  </a-drawer>
</template>

<script setup lang="ts">
import ExamNoticeApplyTable from '@/views/exam/examineeNoticeApply/index.vue'
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()

const dataId = ref('')
const title = ref('')
const visible = ref(false)

const examNoticeApplyTableRef = ref<InstanceType<typeof ExamNoticeApplyTable>>()

// 关闭
const handleCancel = () => {
  visible.value = false
  examNoticeApplyTableRef.value?.onDrawerClose()
}


// 打开
const onOpen = async (id: string, parTitle: string) => {
  dataId.value = id
  title.value = parTitle + " - 报名学员详情"
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
