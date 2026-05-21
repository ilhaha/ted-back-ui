<template>
  <a-drawer v-model:visible="visible" title="考试考评人员劳务费计算明细详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="考评人员ID">{{ dataDetail?.examinerId }}</a-descriptions-item>
      <a-descriptions-item label="监考种类ID">{{ dataDetail?.categoryId }}</a-descriptions-item>
      <a-descriptions-item label="监考班级">{{ dataDetail?.invigilateInfo }}</a-descriptions-item>
      <a-descriptions-item label="监考班级">{{ dataDetail?.invigilateClassName }}</a-descriptions-item>
      <a-descriptions-item label="监考日期">{{ dataDetail?.invigilateDate }}</a-descriptions-item>
      <a-descriptions-item label="监考时长（天）">{{ dataDetail?.invigilateDurationDays }}</a-descriptions-item>
      <a-descriptions-item label="是否担任组长（0否 1是）">{{ dataDetail?.isTeamLeader }}</a-descriptions-item>
      <a-descriptions-item label="实发劳务费金额（税后）">{{ dataDetail?.actualLaborFeeAmount }}</a-descriptions-item>
      <a-descriptions-item label="备注">{{ dataDetail?.remark }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="是否删除，0:未删除，1:已删除">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamLaborFeeDetailDetailResp, getExamLaborFeeDetail as getDetail } from '@/apis/exam/examLaborFeeDetail'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamLaborFeeDetailDetailResp>()
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
