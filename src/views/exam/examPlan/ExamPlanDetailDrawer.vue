<template>
  <a-drawer v-model:visible="visible" title="考试计划详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <!--      <a-descriptions-item label="考试计划">{{ dataDetail?.id }}</a-descriptions-item> -->
      <a-descriptions-item label="所属项目">{{ dataDetail?.projectName }}</a-descriptions-item>
      <a-descriptions-item label="计划年份">{{ dataDetail?.planYear }}</a-descriptions-item>
      <a-descriptions-item label="报名开始时间">{{ dataDetail?.enrollStartTime }}</a-descriptions-item>
      <a-descriptions-item label="报名结束时间">{{ dataDetail?.enrollEndTime }}</a-descriptions-item>
      <a-descriptions-item label="考试开始时间">{{ dataDetail?.startTime }}</a-descriptions-item>
      <a-descriptions-item label="考试结束时间">{{ dataDetail?.endTime }}</a-descriptions-item>
      <a-descriptions-item label="考试时长 （分钟）">{{ dataDetail?.examDuration }}</a-descriptions-item>
      <a-descriptions-item label="考试地点">{{ dataDetail?.locationName }}</a-descriptions-item>
      <a-descriptions-item label="最大容纳考生人数">{{ dataDetail?.maxCandidates }}</a-descriptions-item>
      <a-descriptions-item label="实际考生人数">{{ dataDetail?.actualCandidates }}</a-descriptions-item>
      <a-descriptions-item label="计划状态">{{ dataDetail?.status }}</a-descriptions-item>

      <!--    case 0: return 'blue'     // 待主任审核
              case 1: return 'gold'    // 待市监局审核
              case 2: return 'green'  // 通过
              case 3: return 'purple' // 考试进行中
              case 4: return 'gray'  // 已结束
              case 5: return 'red'    // 未通过
      -->
      <!--<a-descriptions-item label="审批人ID列表">{{ dataDetail?.approvedUsers }}</a-descriptions-item>
      <a-descriptions-item label="审批时间列表">{{ dataDetail?.approvalTime }}</a-descriptions-item>-->
            <a-descriptions-item label="描述">{{ dataDetail?.redeme }}</a-descriptions-item>
      <!--      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item> -->
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      
      <!--      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item> -->
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <!--      <a-descriptions-item label="删除标记">{{ dataDetail?.isDeleted }}</a-descriptions-item> -->
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamPlanDetailResp, getExamPlan as getDetail } from '@/apis/exam/examPlan'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamPlanDetailResp>()
const visible = ref(false)

const getStatusColor = (status: number) => {
  switch (status) {
    case 0: return 'blue' // 待主任审核
    case 1: return 'gold' // 待市监局审核
    case 2: return 'green' // 通过
    case 3: return 'purple' // 考试进行中
    case 4: return 'gray' // 已结束
    case 5: return 'red' // 未通过
    default: return 'default'
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0: return '待主任审核'
    case 1: return '待市监局审核'
    case 2: return '通过'
    case 3: return '考试进行中'
    case 4: return '已结束'
    case 5: return '未通过'
    default: return ''
  }
}

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
