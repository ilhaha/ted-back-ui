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
import {getDocument, addDocument, updateDocument, getStatus, updateStatus, listDocument} from '@/apis/document/document'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import {useResetReactive, useTable} from '@/hooks'
import {useDocument} from '@/hooks/document/useDocument'

const { statusList,getStatusList } = useDocument()

const emit = defineEmits<{
  (e: 'save-success'): void
  (e: '审核成功'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const isExamine = computed(() => !!dataId.value)
const title = computed(() => ( isExamine.value = "审核资料" ))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  status: '',
})
// watch(() => form.status, async (newStatus, oldStatus) => {
//   if (newStatus !== oldStatus || newStatus !== '') {
//     form.status = ''
//   }
// },{ immediate: false })

const columns: ColumnItem[] = reactive([
  {
    label: '审核状态',
    prop: 'status',
    field: 'status',
    type: 'select',
    span: 24,
    rules: [{ required: true, message: '请选择审核状态' }],
    props: {
      options: [
        { label: '未审核', value: 0 },
        { label: '已通过', value: 1 },
        { label: '未通过', value: 2 },
      ],
      allowSearch: true,
    },
  },
  // {
  //   label: '创建人ID',
  //   field: 'createUser',
  //   type: 'input',
  //   span: 24,
  //   rules: [{ required: true, message: '请输入创建人ID' }]
  // },
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}
// 确保 search() 函数明确更新了表格数据
const search = async () => {
  try {
    const res = await fetchData(); // 调用后端接口获取最新数据
    tableData.value = res.data;    // 更新响应式数据（假设 tableData 是表格的数据源）
  } catch (error) {
    console.error('刷新数据失败:', error);
  }
};
// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isExamine.value) {
      await updateDocument(form, dataId.value)
     
      Message.success('审核成功')
      emit('save-success')
      await search()
      // window.location.reload()
      //todo 增加角色校验
      return true
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
  const { data } = await getDocument(id)
  Object.assign(form, data)
  visible.value = true
}
// 审核
const onExamine = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getDocument(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate, onExamine })
</script>

<style scoped lang="scss"></style>
