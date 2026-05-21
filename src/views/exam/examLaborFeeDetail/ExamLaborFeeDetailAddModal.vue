<template>
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getExamLaborFeeDetail, addExamLaborFeeDetail, updateExamLaborFeeDetail } from '@/apis/exam/examLaborFeeDetail'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'
import { getHasQualificationSelectOptions as getHasQualificationSelectOptionsApi } from '@/apis/exam/category'
const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改考试考评人员劳务费计算明细' : '新增考试考评人员劳务费计算明细'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  // todo 待补充
  invigilateDurationDays: '0.5',
  isTeamLeader: 0,
  actualLaborFeeAmount: 300,
  categoryId: ''
})

// 监听考评人员选择，更新 categoryId
watch(() => form.examinerArr, (val) => {
 if(val && val.length > 0) {
  form.categoryId = val[0]
  form.examinerId = val[1]
 }
 
})

// 计算默认劳务费金额
const calculateDefaultAmount = () => {
  if (form.isTeamLeader === 1) {
    form.actualLaborFeeAmount = 500
  } else if (form.invigilateDurationDays === '0.5') {
    form.actualLaborFeeAmount = 300
  } else if (form.invigilateDurationDays === '1') {
    form.actualLaborFeeAmount = 400
  }
}

// 监听监考时长和组长变化
watch(() => [form.invigilateDurationDays, form.isTeamLeader], calculateDefaultAmount)

const columns: ColumnItem[] = reactive([
  {
    label: '考评人员',
    field: 'examinerArr',
    type: "cascader",
    span: 24,
    props: computed(() => ({
      options: categoryUserOptions.value,
      allowSearch: true,
      pathMode: true,
      fieldNames: { label: 'label', value: 'value' }
    })),
    rules: [{ required: true, message: '请选择考评人员' }]
  },
  {
    label: '监考信息',
    field: 'invigilateInfo',
    type: 'textarea',
    props: {
      minRow: 4,
      maxLength: 1000
    },
    span: 24,
    rules: [{ required: true, message: '请输入监考班级' }]
  },
  {
    label: '监考班级',
    field: 'invigilateClassName',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入监考班级' }]
  },
  {
    label: '监考日期',
    field: 'invigilateDate',
    type: 'date-picker',
    span: 24,
    rules: [{ required: true, message: '请输入监考日期' }]
  },
  {
    label: '监考时长',
    field: 'invigilateDurationDays',
    type: 'select',
    span: 24,
    props: {
      options: [
        { label: '0.5天', value: "0.5" },
        { label: '1天', value: "1" }
      ]
    },
    rules: [{ required: true, message: '请选择监考时长' }]
  },
  {
    label: '是否担任组长',
    field: 'isTeamLeader',
    type: 'select',
    span: 24,
    props: {
      options: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
      ]
    },
    rules: [{ required: true, message: '请选择是否担任组长' }]
  },
  {
    label: '备注',
    field: 'remark',
    type: 'textarea',
    props: {
      autoSize: true
    },
    span: 24,
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
      await updateExamLaborFeeDetail(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addExamLaborFeeDetail(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}
const categoryUserOptions = ref([])
const getHasQualificationSelectOptions = async () => {
  const res = await getHasQualificationSelectOptionsApi([1, 2])
  categoryUserOptions.value = res.data
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
  getHasQualificationSelectOptions()
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getExamLaborFeeDetail(id)
  Object.assign(form, data)
  form.examinerArr = [data.categoryId, data.examinerId]
  visible.value = true
  getHasQualificationSelectOptions()
}


defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
