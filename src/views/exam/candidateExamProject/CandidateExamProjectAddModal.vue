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
import { getCandidateExamProject, addCandidateExamProject, updateCandidateExamProject } from '@/apis/exam/candidateExamProject'
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
const title = computed(() => (isUpdate.value ? '修改考生-考试项目考试状态' : '新增考生-考试项目考试状态'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const columns: ColumnItem[] = reactive([
  {
    label: '考生ID',
    field: 'candidateId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考生ID' }]
  },
  {
    label: '考试项目ID',
    field: 'projectId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入考试项目ID' }]
  },
  {
    label: '当前考试轮次（0表示未开始）',
    field: 'attemptNo',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入当前考试轮次（0表示未开始）' }]
  },
  {
    label: '当前轮次是否已补考：0-否 1-是',
    field: 'usedMakeup',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入当前轮次是否已补考：0-否 1-是' }]
  },
  {
    label: '是否通过：0-未通过 1-通过',
    field: 'passed',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入是否通过：0-未通过 1-通过' }]
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
      await updateCandidateExamProject(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addCandidateExamProject(form)
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
  const { data } = await getCandidateExamProject(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
