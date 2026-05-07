<template>
  <a-drawer v-model:visible="visible" title="考生资料关系详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="关联ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考生ID">{{ dataDetail?.examineeId }}</a-descriptions-item>
      <a-descriptions-item label="通知ID">{{ dataDetail?.noticeId }}</a-descriptions-item>
      <a-descriptions-item label="状态:0待报名,1报名待审核,2报名审核通过,3报名审核未通过,4完成部分项目考试,5已完成全部考试">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="审核意见或退回原因">{{ dataDetail?.remark }}</a-descriptions-item>
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
import { type ExamineeNoticeApplyDetailResp, getExamineeNoticeApply as getDetail } from '@/apis/exam/examineeNoticeApply'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamineeNoticeApplyDetailResp>()
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
