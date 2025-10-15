<template>
  <a-drawer v-model:visible="visible" title="考场管理" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <!-- 添加表格组件 -->
    <a-table :data="tableData" :columns="columns" bordered style="padding: 24px;">
      <template #bodyCell="{ record, column }">
        <span>{{ record[column.dataIndex] }}</span>
      </template>
    </a-table>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamLocationDetailResp, getExamLocation as getDetail } from '@/apis/exam/examLocation'
import { ref } from 'vue'

const { width } = useWindowSize()

// 固定表格数据（添加key字段满足Ant Design要求）
const tableData = ref([
  { key: '1', locationName: '第一考场', maxCapacity: 120 },
  { key: '2', locationName: '第二考场', maxCapacity: 150 },
  { key: '3', locationName: '第三考场', maxCapacity: 100 }
])

// 表格列配置
const columns = ref([
  { title: '考场名称', dataIndex: 'locationName', key: 'locationName' },
  { title: '最大容纳人数', dataIndex: 'maxCapacity', key: 'maxCapacity' }
])

const dataId = ref('')
const dataDetail = ref<ExamLocationDetailResp>()
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

<style scoped lang="scss">
/* 添加表格内边距样式 */
.ant-table {
  padding: 24px;
}
</style>
