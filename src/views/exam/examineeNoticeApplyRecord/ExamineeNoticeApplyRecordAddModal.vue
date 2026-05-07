<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getExamineeNoticeApplyRecord, addExamineeNoticeApplyRecord, updateExamineeNoticeApplyRecord } from '@/apis/exam/examineeNoticeApplyRecord'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改考生报考通知对应项目-计划明细' : '新增考生报考通知对应项目-计划明细'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '报名主表ID',
    field: 'applyId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入报名主表ID' }]
  },
  {
    label: '考生ID',
    field: 'examineeId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考生ID' }]
  },
  {
    label: '通知ID',
    field: 'noticeId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入通知ID' }]
  },
  {
    label: '报考项目ID',
    field: 'projectId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入报考项目ID' }]
  },
  {
    label: '考试计划ID',
    field: 'planId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考试计划ID' }]
  },
  {
    label: '考试场次类型：1初试，2补考',
    field: 'examAttemptType',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考试场次类型：1初试，2补考' }]
  },
  {
    label: '报考类型位标识:1实操,2拍片,4评片,8开卷,16闭卷',
    field: 'practicalType',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入报考类型位标识:1实操,2拍片,4评片,8开卷,16闭卷' }]
  },
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateExamineeNoticeApplyRecord(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addExamineeNoticeApplyRecord(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getExamineeNoticeApplyRecord(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
