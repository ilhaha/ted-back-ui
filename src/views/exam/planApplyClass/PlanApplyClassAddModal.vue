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
import { getPlanApplyClass, addPlanApplyClass, updatePlanApplyClass } from '@/apis/exam/planApplyClass'
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
const title = computed(() => (isUpdate.value ? '修改考试计划报考班级' : '新增考试计划报考班级'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '考试计划ID',
    field: 'planId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考试计划ID' }]
  },
  {
    label: '班级ID',
    field: 'classId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入班级ID' }]
  },
  {
    label: '是否已确认成绩（0：未确认 1：已确认）',
    field: 'isScoreConfirmed',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入是否已确认成绩（0：未确认 1：已确认）' }]
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
      await updatePlanApplyClass(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addPlanApplyClass(form)
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
  const { data } = await getPlanApplyClass(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
