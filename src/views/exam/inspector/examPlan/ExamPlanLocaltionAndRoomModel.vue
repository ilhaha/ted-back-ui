<template>
  <a-modal v-model:visible="visible" draggable :width="1200" title="考试地点和考场信息" :footer="null">
    <a-table row-key="classroomId" :loading="tableLoading" :columns="columns" :data="tableData" :pagination="false">
    </a-table>

  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getPlanLocationAndRoomByPlanId } from "@/apis/exam/examLocation";
import type { PlanLocationAndRoomVO } from "@/apis/exam/examLocation";

// 显示窗口
const visible = ref(false)


const tableLoading = ref(false)

// 表格列
const columns = [
  {
    title: '考点名称',
    dataIndex: 'locationName',
  },
  {
    title: '考点地址',
    dataIndex: 'fullAddress',
  },
  {
    title: '考场名称',
    dataIndex: 'classroomName',
  },
  {
    title: '考场容纳考生人数',
    dataIndex: 'maxCandidates',
  },
]
// 表格数据
const tableData = ref<PlanLocationAndRoomVO[]>([])  

const onOption = async (record) => {
  const res = await getPlanLocationAndRoomByPlanId(record.id)
  if (res.success) {
    tableData.value = res.data
    visible.value = true
  }
}


defineExpose({ onOption })

</script>

<style scoped lang="scss"></style>
