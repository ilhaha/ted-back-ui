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
import { getExamRegistration, addExamRegistration, updateExamRegistration } from '@/apis/exam/examRegistration'
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
const title = computed(() => (isUpdate.value ? '修改检验、检测考试项目记录' : '新增检验、检测考试项目记录'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '考生id',
    field: 'candidateId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考生id' }]
  },
  {
    label: '项目id',
    field: 'projectId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入项目id' }]
  },
  {
    label: '考试计划id',
    field: 'planId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考试计划id' }]
  },
  {
    label: '报考类型位标识:0免考,1实操,2拍片,4评片,8开卷,16闭卷',
    field: 'practicalType',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入报考类型位标识:0免考,1实操,2拍片,4评片,8开卷,16闭卷' }]
  },
  {
    label: '考试状态：0待考、1待发布、2及格、3不及格',
    field: 'examStatus',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考试状态：0待考、1待发布、2及格、3不及格' }]
  },
  {
    label: '成绩状态：0有效、1作废',
    field: 'scoreStatus',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入成绩状态：0有效、1作废' }]
  },
  {
    label: '考试场次类型：0免考，1初试，2补考',
    field: 'examAttemptType',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考试场次类型：0免考，1初试，2补考' }]
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
      await updateExamRegistration(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addExamRegistration(form)
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
  const { data } = await getExamRegistration(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
