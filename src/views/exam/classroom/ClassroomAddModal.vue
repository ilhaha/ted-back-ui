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
import { addClassroom, getClassroom, updateClassroom } from '@/apis/exam/classroom'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useClassroom } from '@/hooks/exam/useClassroom'

// 从useClassroom获取数据和方法
const emit = defineEmits(['save-success'])// 新增：从具体路径导入

const { locationSelectList, getLocationSelect } = useClassroom()
const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改考场' : '新增考场'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  classroomName: '', // 考场名称
  maxCandidates: null, // 最大容纳人数
  examLocation: '', // 考试地点
  examType: undefined, // 考试类型
})

// 监听模态框显示状态，加载考试地点数据
watch(() => visible.value, async (newVal) => {
  if (newVal) { // 模态框打开时加载数据
    await getLocationSelect()
  }
}, { immediate: false })

const columns: ColumnItem[] = reactive([
  {
    label: '考场名称',
    field: 'classroomName',
    type: 'Input',
    span: 24,
    rules: [{ required: true, message: '请输入考场名称' }],
    props: {
      placeholder: '请输入考场名称',
    },
  },
  {
    label: '最大容纳人数',
    field: 'maxCandidates',
    required: true,
    type: 'InputNumber',
    span: 24,
    rules: [{ required: true, message: '请输入最大容纳人数' }],
    props: {
      placeholder: '请输入最大容纳人数',
    },
  },
  {
    label: '考试类型',
    field: 'examType',
    type: 'select',
    span: 24,
    required: true,
    props: {
      options: [
        { label: '理论考试', value: '0' },
        { label: '实操考试', value: '1' },
      ],
      placeholder: '请选择考试类型'
    }
  },
  {
    label: '考试地点',
    field: 'examLocationId', // 注意这里改为绑定ID字段
    type: 'select',
    span: 24,
    rules: [{ required: true, message: '请选择考试地点' }],
    props: {
      options: locationSelectList,
      defaultValue: form.examLocation,
      allowSearch: true,
      placeholder: '请选择考试地点',
      fieldNames: { label: 'label', value: 'value' }, // 明确指定字段映射
      onChange: (value: number) => {
        // 选择时自动设置显示名称
        const selected = locationSelectList.value.find((item) => item.value === value)
        if (selected) {
          form.examLocation = selected.label
        }
      },
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
      await updateClassroom(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addClassroom(form)
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
  const { data } = await getClassroom(id)
  data.examLocationId = Number(data.examLocationId)
  data.examType = String(data.examType)
  Object.assign(form, data)
  console.log(form)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
