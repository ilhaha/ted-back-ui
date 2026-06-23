<template>
  <a-drawer v-model:visible="visible" title="题目详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="题目标题">{{ dataDetail?.question }}</a-descriptions-item>

      <a-descriptions-item label="题目附件">
        <a-image
          v-if="dataDetail?.attachment"
          :src="dataDetail.attachment"
          :width="100"
          :height="100"
          style="object-fit: contain"
          alt="题目附件"
        />
        <span v-else>无</span>
      </a-descriptions-item>

      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
    </a-descriptions>

    <div>
      <h3 style="margin-bottom:10px">题目选项</h3>
      <a-table
        :columns="columns"
        :data="stepList"
        :pagination="false"
        row-key="id"
        bordered
      >
       <template #isCorrectAnswer="{ record }">
        <a-tag
            :color="getTypeColor(record.isCorrectAnswer)"
        >{{ getQuestionType(record.isCorrectAnswer) }}</a-tag>
      </template>
      </a-table>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type QuestionBankDetailResp, getQuestionBank as getDetail } from '@/apis/examconnect/questionBank'
import {getListByQuestionId,type StepResp} from '@/apis/examconnect/step'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<QuestionBankDetailResp>()
const visible = ref(false)
const stepList = ref<StepResp[]>([])

const columns = [
  {
    title: '选项内容',
    dataIndex: 'question',
    align: 'center',
  },
 {
    title: '是否是正确答案',
    dataIndex: 'isCorrectAnswer',
    slotName: 'isCorrectAnswer',
    align: 'center',
  }
]

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
  const res = await getListByQuestionId(dataId.value)
  stepList.value = res.data  
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

const getTypeColor = (flag: boolean) => {
  if(flag) {
     return 'green'; 
  }
  return 'red';
};

const getQuestionType = (flag: boolean) => {
  if(flag) {
     return '是'; 
  }
  return '否';
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
