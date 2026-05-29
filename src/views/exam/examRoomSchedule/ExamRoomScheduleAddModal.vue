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
import { getExamRoomSchedule, addExamRoomSchedule, updateExamRoomSchedule } from '@/apis/exam/examRoomSchedule'
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
const title = computed(() => (isUpdate.value ? '修改检验检测人员考试考场安排' : '新增检验检测人员考试考场安排'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '通知ID',
    field: 'noticeId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入通知ID' }]
  },
  {
    label: '项目ID',
    field: 'projectId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入项目ID' }]
  },
  {
    label: '报考类型位标识:1实操,2拍片,4评片,8开卷,16闭卷',
    field: 'practicalType',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入报考类型位标识:1实操,2拍片,4评片,8开卷,16闭卷' }]
  },
  {
    label: '考场ID',
    field: 'examRoomId',
    type: 'input',
    span: 24,
  },
  {
    label: '考试时间',
    field: 'examTime',
    type: 'input',
    span: 24,
  },
  {
    label: '创建人ID',
    field: 'createUser',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入创建人ID' }]
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
      await updateExamRoomSchedule(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addExamRoomSchedule(form)
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
  const { data } = await getExamRoomSchedule(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
