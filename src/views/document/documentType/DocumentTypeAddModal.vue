<template>
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns">
      <template #needUploadPerson>
        <a-radio-group v-model="form.needUploadPerson">
          <a-radio :value="2">仅非京籍人员需上传</a-radio>
          <a-radio :value="1">仅京籍人员需上传</a-radio>
          <a-radio :value="0">京籍与非京籍均需上传</a-radio>
        </a-radio-group>
      </template>
    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getDocumentType, addDocumentType, updateDocumentType } from '@/apis/document/documentType'
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
const title = computed(() => (isUpdate.value ? '修改资料类型' : '新增资料类型'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
  needUploadPerson: 2,
  typeName: '',
})

const columns: ColumnItem[] = reactive([
  {
    label: '资料类型名称',
    field: 'typeName',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入资料类型名称' }]
  },
  {
    label: '资料上传适用人员',
    field: 'needUploadPerson',
    type: 'radio',
    span: 24,
    soltName: 'needUploadPerson',
    rules: [{ required: true, message: '请选择是否需要上传' }]
  }


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
      await updateDocumentType(form, dataId.value)
      Message.success('修改成功')
    } else {
      try {
        await addDocumentType(form)
        Message.success('新增成功')
      } catch (error: any) {
        Message.error(error?.response.data.message || '新增失败')
        return false
      }
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
  const { data } = await getDocumentType(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
