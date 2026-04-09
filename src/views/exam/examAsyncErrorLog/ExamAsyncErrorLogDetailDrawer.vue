<template>
  <a-drawer v-model:visible="visible" title="考试异步任务错误日志详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考试计划ID">{{ dataDetail?.planId }}</a-descriptions-item>
      <a-descriptions-item label="报名ID">{{ dataDetail?.enrollId }}</a-descriptions-item>
      <a-descriptions-item label="失败步骤">{{ dataDetail?.step }}</a-descriptions-item>
      <a-descriptions-item label="错误简要信息">{{ dataDetail?.errorMsg }}</a-descriptions-item>
      <a-descriptions-item label="异常堆栈信息">{{ dataDetail?.stackTrace }}</a-descriptions-item>
      <a-descriptions-item label="处理状态：0-未处理，1-已处理">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="删除标记(0未删,1已删)">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamAsyncErrorLogDetailResp, getExamAsyncErrorLog as getDetail } from '@/apis/exam/examAsyncErrorLog'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamAsyncErrorLogDetailResp>()
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
