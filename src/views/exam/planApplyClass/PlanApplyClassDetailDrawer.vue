<template>
  <a-drawer v-model:visible="visible" :title="title" :width="width >= 1400 ? 1400 : '100%'" :footer="false">
    <a-spin :spinning="loading">
      <div v-for="item in classTableList" :key="item.className">
        <!-- 班级标题 -->
        <a-alert type="info" :closable="false" style="margin-top: 16px;">
          {{ item.className }} 班级成绩已统计：及格 <a-link status="success">{{ item.passCount }}</a-link> 人，不及格
          <a-link status="danger">{{ item.failCount }}</a-link> 人，请查看下方详情。
        </a-alert>

        <!-- 成绩表格 -->
        <GiTable row-key="id" :data="item.records" :columns="columns" :loading="loading" :pagination="{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true
        }" :scroll="{ x: '100%' }" :disabledTools="['size', 'refresh', 'setting', 'fullscreen']">
          <template #examScores="{ record }">
            <a-space>
              <a-tag color="green" v-if="record.examScores >= 70">{{ record.examScores }}</a-tag>
              <a-tag color="red" v-else>{{ record.examScores }}</a-tag>
            </a-space>
          </template>
          <template #operScores="{ record }">
            <span v-if="record.projectId === 110 || record.projectId === 111">
              <a-space direction="vertical" style="width: 100%;">
                <div v-for="item in record.weldingOperScoreVoList" :key="item.id">
                  <span>{{ item.projectCode }} <a-divider direction="vertical" />
                  </span>
                  <a-tag color="blue">{{ item.operScore ?? '-' }}</a-tag>
                </div>
              </a-space>
            </span>
            <span v-else>
              <a-space>
                <a-tag color="green" v-if="record.operScores >= 70">{{ record.operScores }}</a-tag>
                <a-tag color="red" v-else>{{ record.operScores }}</a-tag>
              </a-space>
            </span>
          </template>
          <template #roadScores="{ record }">
            <a-space>
              <span v-if="record.isRoad == 1">
                <a-tag color="green" v-if="record.roadScores >= 70">{{ record.roadScores }}</a-tag>
                <a-tag color="red" v-else>{{ record.roadScores }}</a-tag>
              </span>
              <a-tag color="blue" v-else>
                免考
              </a-tag>
            </a-space>
          </template>
          <template #examResultStatus="{ record }">
            <a-tag :color="getExamResultStatusColor(Number(record.examResultStatus))">
              {{ getExamResultStatusText(Number(record.examResultStatus)) }}
            </a-tag>
          </template>
        </GiTable>
      </div>
    </a-spin>
  </a-drawer>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useWindowSize } from '@vueuse/core'
import { getClassExamTableList } from '@/apis/exam/examRecords'
import type { TableInstanceColumns } from "@/components/GiTable/type";

const { width } = useWindowSize()

const planId = ref('')
const title = ref('')
const visible = ref(false)
const loading = ref(false)

const classTableList = ref<any[]>([])

// 表格列定义
const columns = ref<TableInstanceColumns[]>([
  {
    title: '序号',
    dataIndex: 'seatId', align: "center"
  },
  {
    title: '考试姓名',
    dataIndex: 'candidateName'
  },
  {
    title: '身份证号',
    dataIndex: 'username'
  },
  {
    title: '理论成绩',
    dataIndex: 'examScores', align: 'center',
    slotName: 'examScores'
  },
  {
    title: '实操成绩',
    dataIndex: 'operScores', align: "center",
    slotName: 'operScores'
  },
  {
    title: '道路成绩',
    dataIndex: 'roadScores', align: "center",
    slotName: 'roadScores'
  },
  {
    title: '总评',
    dataIndex: 'examResultStatus', align: "center", slotName: 'examResultStatus'

  }
])

// 查询数据
const getDataDetail = async () => {
  loading.value = true
  try {
    const { data } = await getClassExamTableList(planId.value)
    classTableList.value = data || []
  } finally {
    loading.value = false
  }
}

// 打开 Drawer
const onOpen = async (id: string, examPlanName: string) => {
  planId.value = id
  title.value = examPlanName + ' - 报考班级考试详情'
  await getDataDetail()
  visible.value = true
}

const getExamResultStatusColor = (status: number) => {
  const colorMap: Record<number, string> = {
    0: 'red', // 不及格
    1: 'green', // 及格
    2: 'blue', // 待录入
  }
  return colorMap[status] || 'gray'
}

// 获取审核状态文本
const getExamResultStatusText = (status: number) => {
  const textMap: Record<number, string> = {
    0: '不及格',
    1: '及格',
    2: '待录入',
  }
  return textMap[status] || '未知状态'
}


defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
