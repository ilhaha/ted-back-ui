<template>
  <a-drawer v-model:visible="visible" title="焊接项目实操成绩详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考试计划ID">{{ dataDetail?.planId }}</a-descriptions-item>
      <a-descriptions-item label="考试记录ID">{{ dataDetail?.recordId }}</a-descriptions-item>
      <a-descriptions-item label="考生ID">{{ dataDetail?.candidateId }}</a-descriptions-item>
      <a-descriptions-item label="焊接项目代码">{{ dataDetail?.projectCode }}</a-descriptions-item>
      <a-descriptions-item label="实操成绩">{{ dataDetail?.operScore }}</a-descriptions-item>
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
import { type WeldingOperScoreDetailResp, getWeldingOperScore as getDetail } from '@/apis/exam/weldingOperScore'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<WeldingOperScoreDetailResp>()
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
