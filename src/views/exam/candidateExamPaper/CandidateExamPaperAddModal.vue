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
import { getCandidateExamPaper, addCandidateExamPaper, updateCandidateExamPaper } from '@/apis/exam/candidateExamPaper'
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
const title = computed(() => (isUpdate.value ? '修改考生试卷' : '新增考生试卷'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '报名id',
    field: 'enrollId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入报名id' }]
  },
  {
    label: '试卷 JSON 内容',
    field: 'paperJson',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入试卷 JSON 内容' }]
  },
  {
    label: '创建时间',
    field: 'createTime',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入创建时间' }]
  },
  {
    label: '更新时间',
    field: 'updateTime',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入更新时间' }]
  },
  {
    label: '删除标记(0未删,1已删)',
    field: 'isDeleted',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入删除标记(0未删,1已删)' }]
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
      await updateCandidateExamPaper(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addCandidateExamPaper(form)
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
  const { data } = await getCandidateExamPaper(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
