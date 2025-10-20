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
    <a-form ref="formRef" :model="form" layout="vertical">
      <a-form-item field="status" label="审核结果" :rules="[{ required: true, message: '请选择审核结果' }]">
        <a-radio-group v-model="form.status">
          <a-radio :value="1">审核通过</a-radio>
          <a-radio :value="2">退回补正</a-radio>
          <a-radio :value="3">虚假资料</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item 
        v-if="form.status === 2 || form.status === 3"
        field="remark"
        :label="form.status === 2 ? '退回原因' : '虚假资料原因'"
        :rules="[{ required: true, message: form.status === 2 ? '请填写退回原因' : '请填写虚假资料原因' }]"
      >
        <a-input v-model="form.remark" :placeholder="form.status === 2 ? '请输入退回原因' : '请输入虚假资料原因'" allow-clear />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getSpecialCertificationApplicant, addSpecialCertificationApplicant, updateSpecialCertificationApplicant } from '@/apis/exam/specialCertificationApplicant'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const isAudit = ref(false)
const title = computed(() => {
  if (isAudit.value) return '审核特种设备人员资格申请'
  return isUpdate.value ? '修改特种设备人员资格申请' : '新增特种设备人员资格申请'
})
const formRef = ref()

const [form, resetForm] = useResetReactive({
  status: undefined,
  remark: undefined
})

// 重置
const reset = () => {
  formRef.value?.resetFields()
  resetForm()
  isAudit.value = false
  form.status = undefined
  form.remark = undefined
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.validate()
    if (isInvalid) return false

    // 构造请求参数
    const req = {
      ...form,
      remark: form.remark 
    }

    if (isAudit.value) {
      const res = await updateSpecialCertificationApplicant(req, dataId.value)
      if (res.data.success) {
        Message.success('审核成功')
        emit('save-success')
        return true
      } else {
        Message.error(res.data.msg || '审核失败')
        emit('save-success')
        return true  // 审核失败也关闭表单
      }
    } else if (isUpdate.value) {
      await updateSpecialCertificationApplicant(form, dataId.value)
      Message.success('修改成功')
      emit('save-success')
      return true
    } else {
      await addSpecialCertificationApplicant(form)
      Message.success('新增成功')
      emit('save-success')
      return true
    }
  } catch (error) {
    emit('save-success')
    return true  // 发生错误时也关闭表单
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
  const { data } = await getSpecialCertificationApplicant(id)
  Object.assign(form, data)
  visible.value = true
}

// 审核
const onAudit = async (id: string) => {
  reset()
  dataId.value = id
  isAudit.value = true
  const { data } = await getSpecialCertificationApplicant(id)
  Object.assign(form, data)
  form.status = undefined
  visible.value = true
}

defineExpose({ onAdd, onUpdate, onAudit })
</script>

<style scoped lang="scss"></style>
