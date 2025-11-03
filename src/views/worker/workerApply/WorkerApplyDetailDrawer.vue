<template>
  <a-drawer v-model:visible="visible" title="作业人员报名详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="报考项目ID">{{ dataDetail?.categoryId }}</a-descriptions-item>
      <a-descriptions-item label="作业人员姓名">{{ dataDetail?.candidateName }}</a-descriptions-item>
      <a-descriptions-item label="作业人员性别">{{ dataDetail?.gender }}</a-descriptions-item>
      <a-descriptions-item label="作业人员手机号">{{ dataDetail?.phone }}</a-descriptions-item>
      <a-descriptions-item label="报名资格申请表路径">{{ dataDetail?.qualificationPath }}</a-descriptions-item>
      <a-descriptions-item label="报名资格申请表名称">{{ dataDetail?.qualificationName }}</a-descriptions-item>
      <a-descriptions-item label="身份证号">{{ dataDetail?.idCardNumber }}</a-descriptions-item>
      <a-descriptions-item label="身份证正面存储地址">{{ dataDetail?.idCardPhotoFront }}</a-descriptions-item>
      <a-descriptions-item label="身份证反面存储地址">{{ dataDetail?.idCardPhotoBack }}</a-descriptions-item>
      <a-descriptions-item label="一寸免冠照存储地址">{{ dataDetail?.facePhoto }}</a-descriptions-item>
      <a-descriptions-item label="审核状态:0待审核,1已生效,2未通过">{{ dataDetail?.status }}</a-descriptions-item>
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
