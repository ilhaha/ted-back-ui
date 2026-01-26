<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
    draggable
    @before-ok="save"
    @close="handleClose"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns.filter(c => !c.hidden)" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { reactive, ref, computed, watch } from 'vue'
import { reviewDocument } from '@/apis/document/document'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'

//  审核状态常量定义（避免硬编码）
const AUDIT_STATUS = {
  PASSED: 1,    // 审核通过
  REJECTED: 2,  // 补正
} as const

//  状态选项映射
const statusOptions = [
  { label: '审核通过', value: AUDIT_STATUS.PASSED },
  { label: '补正', value: AUDIT_STATUS.REJECTED },
]

const emit = defineEmits<{
  (e: 'save-success'): void
  (e: 'close-parent'): void
  (e: 'audit-finished'): void   
}>()

const { width } = useWindowSize()
const dataId = ref('')
const visible = ref(false)
const isExamine = computed(() => !!dataId.value)
const title = computed(() => (isExamine.value ? '审核资料' : '新增资料'))

const formRef = ref<InstanceType<typeof GiForm>>()

//  表单数据
const [form, resetForm] = useResetReactive({
  status: 1, // 审核状态
  auditRemark: '', // 审核备注
})

//  表单列定义
const columns: ColumnItem[] = reactive([
  {
    label: '审核状态',
    field: 'status',
    type: 'select',
    span: 24,
    props: { options: statusOptions },
  },
  {
    label: '审核备注',
    field: 'auditRemark',
    type: 'textarea',
    span: 24,
    hidden: true, // 默认隐藏
    props: {
      placeholder: '请输入审核备注',
      autoSize: { minRows: 2, maxRows: 5 },
    },
  },
])

//  监听审核状态变化（控制备注框显示逻辑）
watch(
  () => form.status,
  (val) => {
    const remarkField = columns.find(c => c.field === 'auditRemark')
    if (!remarkField) return

    if (val === AUDIT_STATUS.REJECTED) {
      remarkField.hidden = false
    } else {
      remarkField.hidden = true
      form.auditRemark = '' // 清空备注
    }
  },
  { immediate: true }
)

//  关闭弹窗时重置状态
const handleClose = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
  const remarkField = columns.find(c => c.field === 'auditRemark')
  if (remarkField) remarkField.hidden = true
  visible.value = false
}

//  保存审核结果（含校验）
const save = async () => {
  const payload = {
    id: dataId.value,
    typeId: typeId.value,
    candidateId: candidateId.value,
    status: form.status,
    auditRemark: form.auditRemark,
  }

  try {
    await reviewDocument(payload)
    Message.success('审核成功')
    emit('save-success')
    emit('audit-finished')
  } catch (error) {
    Message.error('审核失败')
  } finally {
    handleClose()          // 关闭【审核资料】弹窗
    emit('close-parent')   // ✅ 通知父组件关【考生资料窗口】
  }
}

const typeId = ref<string | undefined>()
const candidateId = ref<string | undefined>()

//  打开审核弹窗
const onExamine = async (id: string, type: string, user: string) => {

  dataId.value = id // 设置资料 ID
  typeId.value = type // 设置资料种类 ID
  candidateId.value = user // 设置用户 ID

  form.auditRemark = '' // 清空审核备注
  visible.value = true // 打开弹窗
}

defineExpose({ onExamine })
</script>
