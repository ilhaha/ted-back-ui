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
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive, useProject } from '@/hooks'
import { bindingBindingDocument } from '@/apis/exam/project'


const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const title = computed(() => ('项目绑定资料'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { notBindingDocumentList, getNotBindingDocumentFun } = useProject()


const [form, resetForm] = useResetReactive({
  locationIds: []
})

// 窗口打开，获取所有地址列表
watch(() => visible.value, async (newProvinceId, oldProvinceId) => {
  if (newProvinceId === true) {
    await getNotBindingDocumentFun(dataId.value)
    if (notBindingDocumentList.value.length === 0) {
      visible.value = false
      // 提示
      Message.info('暂无可绑定资料')
    }
  }
},{ immediate: false })


const columns: ColumnItem[] = reactive([
  {
    prop: 'locationIds',
    type: 'checkbox-group',
    field: 'locationIds',
    span: 24,
    props: {
      options: notBindingDocumentList,
      allowSearch: true,
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
    // await addProject(form)
    // 发送绑定请求
    await bindingBindingDocument(dataId.value, form.locationIds)
    Message.success('绑定成功')
    emit('save-success')
    return true
  } catch (error) {
    Message.success('绑定失败')
    return false
  }
}

// 修改
const onBinding = async (id: string) => {
  reset()
  dataId.value = id
  visible.value = true
}

defineExpose({ onBinding })
</script>

<style scoped lang="scss">
</style>
