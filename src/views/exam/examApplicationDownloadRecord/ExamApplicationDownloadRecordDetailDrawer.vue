<template>
  <a-drawer v-model:visible="visible" title="考生申请下载记录详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考试通知ID">{{ dataDetail?.noticeId }}</a-descriptions-item>
      <a-descriptions-item label="考试项目ID">{{ dataDetail?.projectId }}</a-descriptions-item>
      <a-descriptions-item label="考生ID">{{ dataDetail?.candidateId }}</a-descriptions-item>
      <a-descriptions-item label="申请编号">{{ dataDetail?.applyNo }}</a-descriptions-item>
      <a-descriptions-item label="删除标记">{{ dataDetail?.isDeleted }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamApplicationDownloadRecordDetailResp, getExamApplicationDownloadRecord as getDetail } from '@/apis/exam/examApplicationDownloadRecord'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamApplicationDownloadRecordDetailResp>()
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
