<template>
  <a-drawer v-model:visible="visible" title="机构申请焊接考试项目详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="申请机构ID">{{ dataDetail?.orgId }}</a-descriptions-item>
      <a-descriptions-item label="焊接类型：0-金属焊接，1-非金属焊接">{{ dataDetail?.weldingType }}</a-descriptions-item>
      <a-descriptions-item label="焊接考试项目名称">{{ dataDetail?.projectName }}</a-descriptions-item>
      <a-descriptions-item label="考试项目代码">{{ dataDetail?.projectCode }}</a-descriptions-item>
      <a-descriptions-item label="申请原因或说明">{{ dataDetail?.applicationReason }}</a-descriptions-item>
      <a-descriptions-item label="审核状态：0-待审核，1-审核通过，2-审核拒绝">{{ dataDetail?.status }}</a-descriptions-item>
      <a-descriptions-item label="审核意见/备注">{{ dataDetail?.reviewComment }}</a-descriptions-item>
      <a-descriptions-item label="提交时间">{{ dataDetail?.submittedAt }}</a-descriptions-item>
      <a-descriptions-item label="审核时间">{{ dataDetail?.reviewedAt }}</a-descriptions-item>
      <a-descriptions-item label="删除标记">{{ dataDetail?.isDeleted }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间戳">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间戳">{{ dataDetail?.updateTime }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type WeldingExamApplicationDetailResp, getWeldingExamApplication as getDetail } from '@/apis/exam/weldingExamApplication'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<WeldingExamApplicationDetailResp>()
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
