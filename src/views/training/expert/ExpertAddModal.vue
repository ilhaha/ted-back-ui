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
import { getExpert, addExpert, updateExpert } from '@/apis/training/expert'
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
const title = computed(() => (isUpdate.value ? '修改专家信息' : '新增专家信息'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const addOrUpdate = ref('新增')
const education = ref([
  { label: '博士', value: '博士' },
  { label: '硕士', value: '硕士' },
  { label: '本科', value: '本科' },
  { label: '其他', value: '其他' },
])

const columns: ColumnItem[] = reactive([
  {
    label: '专家名字',
    field: 'name',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入专家名字' }],
  },
  {
    label: '身份证号',
    field: 'idCard',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入身份证号' }],
    hide: () => addOrUpdate.value === '修改',
    show: () => addOrUpdate.value === '新增',
  },
  {
    label: '专家称号',
    field: 'title',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入专家称号' }],
  },
  {
    label: '学历',
    field: 'education',
    type: 'select',
    span: 24,
    rules: [{ required: true, message: '请选择学历' }],
    props: {
      options: education,
      placeholder: '请选择专家',
    },
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
      await updateExpert(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addExpert(form)
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
  addOrUpdate.value = '新增'
  reset()
  dataId.value = ''
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  addOrUpdate.value = '修改'
  reset()
  dataId.value = id
  const { data } = await getExpert(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
