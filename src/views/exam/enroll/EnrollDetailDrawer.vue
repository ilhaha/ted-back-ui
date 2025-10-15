<template>
  <a-drawer v-model:visible="visible" title="考生报名表详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
<!--      <a-descriptions-item label="考生计划关联表id">{{ dataDetail?.id }}</a-descriptions-item>-->
      <a-descriptions-item label="考生id">{{ dataDetail?.userId }}</a-descriptions-item>
      <a-descriptions-item label="考试计划id">{{ dataDetail?.examPlanId }}</a-descriptions-item>
<!--      <a-descriptions-item label="考试状态（0：未报名，1：已报名：2：已完成，3：已过期）">{{ dataDetail?.enrollStatus }}</a-descriptions-item>-->
<!--      <a-descriptions-item label="创建时间戳">{{ dataDetail?.createTime }}</a-descriptions-item>-->
<!--      <a-descriptions-item label="更新时间戳">{{ dataDetail?.updateTime }}</a-descriptions-item>-->
<!--      <a-descriptions-item label="删除标记">{{ dataDetail?.isDeleted }}</a-descriptions-item>-->
<!--      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>-->
<!--      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>-->
<!--      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>-->
<!--      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>-->
      <a-descriptions-item label="准考证号">{{ dataDetail?.examNumber }}</a-descriptions-item>
      <a-descriptions-item label="考场">{{ dataDetail?.classroomId }}</a-descriptions-item>
      <a-descriptions-item label="座位号">{{ dataDetail?.seatId }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type EnrollDetailResp, getEnroll as getDetail } from '@/apis/exam/enroll'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<EnrollDetailResp>()
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
