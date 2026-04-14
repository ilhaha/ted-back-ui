<template>
  <a-drawer v-model:visible="visible" title="无损检测、检验人员考试通知详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="标题">{{ dataDetail?.title }}</a-descriptions-item>
      <a-descriptions-item label="报名截止时间">{{ dataDetail?.applyDeadline }}</a-descriptions-item>
      <a-descriptions-item label="所属类别">{{ dataDetail?.categoryId }}</a-descriptions-item>
      <a-descriptions-item label="考试等级  0-无 1一级 2 二级">{{ dataDetail?.examLevel }}</a-descriptions-item>
      <a-descriptions-item label="状态（0待审核、1审核通过、2审核未通过）">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="备注">{{ dataDetail?.remark }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间戳">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间戳">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="删除标记">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamNoticeDetailResp, getExamNotice as getDetail } from '@/apis/exam/examNotice'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamNoticeDetailResp>()
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
