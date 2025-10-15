<template>
  <a-drawer v-model:visible="visible" title="考试记录详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="1" size="large" class="general-description" bordered>
      <a-descriptions-item label="项目名称" :span="1">
        {{ dataDetail?.planName }}
      </a-descriptions-item>

      <a-descriptions-item label="考生名称" :span="1">
        {{ dataDetail?.candidateName }}
      </a-descriptions-item>

      <a-descriptions-item label="报名进度" :span="1">
        <a-tag :color="getProgressColor(Number(dataDetail?.registrationProgress))">
          {{ getProgressText(Number(dataDetail?.registrationProgress)) }}
        </a-tag>
      </a-descriptions-item>

      <a-descriptions-item label="考试得分" :span="1">
        {{ dataDetail?.examScores }}
      </a-descriptions-item>

<!--      <a-descriptions-item label="创建人" :span="1">-->
<!--        {{ dataDetail?.createUserString }}-->
<!--      </a-descriptions-item>-->

<!--      <a-descriptions-item label="创建时间" :span="1">-->
<!--        {{ dataDetail?.createTime }}-->
<!--      </a-descriptions-item>-->

<!--      <a-descriptions-item label="更新时间" :span="1">-->
<!--        {{ dataDetail?.updateTime }}-->
<!--      </a-descriptions-item>-->
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamRecordsDetailResp, getExamRecords as getDetail } from '@/apis/exam/examRecords'

const props = defineProps<{
  getProgressColor: (progress: number) => string
  getProgressText: (progress: number) => string
}>()

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamRecordsDetailResp>()
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

<style scoped lang="scss">
.general-description {
  :deep(.arco-descriptions-item-label) {
    width: 100px;
    font-weight: 500;
  }

  :deep(.arco-descriptions-item-value) {
    padding: 12px 16px;
  }
}
</style>
