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
import { getWeldingExamApplication, addWeldingExamApplication, updateWeldingExamApplication } from '@/apis/exam/weldingExamApplication'
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
const title = computed(() => (isUpdate.value ? '修改机构申请焊接考试项目' : '新增机构申请焊接考试项目'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '申请机构ID',
    field: 'orgId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入申请机构ID' }]
  },
  {
    label: '焊接类型：0-金属焊接，1-非金属焊接',
    field: 'weldingType',
    type: 'radio-group',
    span: 24,
    rules: [{ required: true, message: '请输入焊接类型：0-金属焊接，1-非金属焊接' }]
  },
  {
    label: '焊接考试项目名称',
    field: 'projectName',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入焊接考试项目名称' }]
  },
  {
    label: '考试项目代码',
    field: 'projectCode',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考试项目代码' }]
  },
  {
    label: '申请原因或说明',
    field: 'applicationReason',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入申请原因或说明' }]
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
      await updateWeldingExamApplication(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addWeldingExamApplication(form)
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
  const { data } = await getWeldingExamApplication(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
