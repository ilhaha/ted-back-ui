<template>
  <a-modal
    v-model:visible="visible"
    title="绑定机构账号"
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
import { useResetReactive } from '@/hooks'
import { getBindableUsers, bindUserToOrg } from '@/apis/training/org'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const formRef = ref<InstanceType<typeof GiForm>>()
const userList = ref<Array<{ id: string; nickname: string }>>([])

const [form, resetForm] = useResetReactive({
  userId: ''
})

const columns: ColumnItem[] = reactive([
  {
    prop: 'userId',
    label: '选择用户',
    field: 'userId',
    required: true,
    span: 24,
    type: 'select',
    props: {
      options: userList,
      allowSearch: true,
      fieldNames: {
        label: 'nickname',
        value: 'id'
      }
    }
  }
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 获取可绑定的用户列表
const getUsers = async () => {
  try {
    const { data } = await getBindableUsers()
    userList.value = data || []
  } catch (error) {
    Message.error('获取用户列表失败')
  }
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    await bindUserToOrg(dataId.value, form.userId)
    Message.success('绑定成功')
    emit('save-success')
    return true
  } catch (error) {
    Message.error('绑定失败')
    return false
  }
}

// 打开
const onOpen = async (id: string) => {
  reset()
  dataId.value = id
  await getUsers()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
</style> 