<template>
  <a-drawer v-model:visible="visible" title="机构培训关联详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键id">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="机构id">{{ dataDetail?.orgId }}</a-descriptions-item>
      <a-descriptions-item label="培训id">{{ dataDetail?.trainingId }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type OrgTrainingDetailResp, getOrgTraining as getDetail } from '@/apis/training/orgTraining'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<OrgTrainingDetailResp>()
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
