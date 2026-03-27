<template>
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getOrgClass, addOrgClass, updateOrgClass } from '@/apis/training/orgClass'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'
import { type ProjectCategoryVO, getSelectCategoryProject } from '@/apis/training/org'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改班级' : '新增班级'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  projectId: undefined,
  className: undefined,
  classType: 0,
  status: 0
})

const categoryOptions = ref<ProjectCategoryVO[]>([])

const columns: ColumnItem[] = reactive([
  {
    label: '考试项目',
    field: 'projectId',
    type: 'cascader',
    span: 24,
    props: {
      disabled: computed(() => isUpdate.value),
      allowSearch: true,
      multiple: false,
      options: categoryOptions,
      fieldNames: { label: 'label', value: 'value' }
    },
    rules: [{ required: true, message: '请选择考试项目' }]
  },
  // {
  //   label: '班级类型',
  //   field: 'classType',
  //   type: 'select',
  //   span: 24,
  //   props: computed(() => ({
  //     allowSearch: false,
  //     multiple: false,
  //     disabled: isUpdate.value,
  //     options: [
  //       { label: '作业班', value: 0 },
  //       { label: '检验班', value: 1 }
  //     ],
  //     fieldNames: { label: 'label', value: 'value' }
  //   })),
  //   rules: [{ required: true, message: '请选择班级类型' }]
  // },
  // {
  //   label: '招生状态',
  //   field: 'status',
  //   type: 'select',
  //   span: 24,
  //   props: computed(() => ({
  //     allowSearch: false,
  //     multiple: false,
  //     options: [
  //       { label: '可报名', value: 0 },
  //       { label: '停止报名', value: 1 }
  //     ],
  //     fieldNames: { label: 'label', value: 'value' }
  //   })),
  //   rules: [{ required: true, message: '请选择招生状态' }]
  // }
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
      await updateOrgClass(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addOrgClass(form)
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
  getCategoryProjectSelect()
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getOrgClass(id)
  Object.assign(form, data)
  visible.value = true
  getCategoryProjectSelect()
}

const getCategoryProjectSelect = async () => {
  const res = await getSelectCategoryProject()
  categoryOptions.value = res.data
}


defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
