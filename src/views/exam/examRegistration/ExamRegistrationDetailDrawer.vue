<template>
  <a-drawer v-model:visible="visible" title="检验、检测考试项目记录详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考生id">{{ dataDetail?.candidateId }}</a-descriptions-item>
      <a-descriptions-item label="项目id">{{ dataDetail?.projectId }}</a-descriptions-item>
      <a-descriptions-item label="考试计划id">{{ dataDetail?.planId }}</a-descriptions-item>
      <a-descriptions-item label="报考类型位标识:0免考,1实操,2拍片,4评片,8开卷,16闭卷">{{ dataDetail?.practicalType }}</a-descriptions-item>
      <a-descriptions-item label="考试日期">{{ dataDetail?.examDate }}</a-descriptions-item>
      <a-descriptions-item label="考试状态：0待考、1待发布、2及格、3不及格">{{ dataDetail?.examStatus }}</a-descriptions-item>
      <a-descriptions-item label="成绩状态：0有效、1作废">{{ dataDetail?.scoreStatus }}</a-descriptions-item>
      <a-descriptions-item label="考试场次类型：0免考，1初试，2补考">{{ dataDetail?.examAttemptType }}</a-descriptions-item>
      <a-descriptions-item label="创建时间戳">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间戳">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="删除标记">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamRegistrationDetailResp, getExamRegistration as getDetail } from '@/apis/exam/examRegistration'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamRegistrationDetailResp>()
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
