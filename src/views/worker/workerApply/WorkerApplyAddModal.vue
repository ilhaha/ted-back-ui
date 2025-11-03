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
import { getWorkerApply, addWorkerApply, updateWorkerApply } from '@/apis/worker/workerApply'
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
const title = computed(() => (isUpdate.value ? '修改作业人员报名' : '新增作业人员报名'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '报考项目ID',
    field: 'categoryId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入报考项目ID' }]
  },
  {
    label: '作业人员姓名',
    field: 'candidateName',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入作业人员姓名' }]
  },
  {
    label: '作业人员性别',
    field: 'gender',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入作业人员性别' }]
  },
  {
    label: '作业人员手机号',
    field: 'phone',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入作业人员手机号' }]
  },
  {
    label: '报名资格申请表名称',
    field: 'qualificationName',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入报名资格申请表名称' }]
  },
  {
    label: '身份证号',
    field: 'idCardNumber',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入身份证号' }]
  },
  {
    label: '身份证正面存储地址',
    field: 'idCardPhotoFront',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入身份证正面存储地址' }]
  },
  {
    label: '身份证反面存储地址',
    field: 'idCardPhotoBack',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入身份证反面存储地址' }]
  },
  {
    label: '一寸免冠照存储地址',
    field: 'facePhoto',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入一寸免冠照存储地址' }]
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
      await updateWorkerApply(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addWorkerApply(form)
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
  const { data } = await getWorkerApply(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
