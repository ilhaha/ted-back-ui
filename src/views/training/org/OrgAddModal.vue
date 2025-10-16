<template>
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { addOrg, getOrg, updateOrg } from '@/apis/training/org'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { selectOptions } from '@/apis/exam/category'
import type { LabelValueState } from "@/types/global";
import { upload } from '@/apis/common/carousel'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改机构信息' : '新增机构信息'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  code: '',
  name: '',
  socialCode: '',
  location: '',
  legalPerson: '',
  scale: '',
  businessLicense: '',
  businessLicenseFileList: [],
  categoryIds: [], // 改为数组
})

const categorySelect = ref<LabelValueState[]>([])

const columns: ColumnItem[] = reactive([
  {
    label: '机构代号',
    field: 'code',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入机构代号' }],
  },
  {
    label: '机构名称',
    field: 'name',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入机构名称' }],
  },
  {
    label: '机构八大类归属',
    field: 'categoryIds',
    type: 'select',
    required: true,
    span: 24,
    props: {
      allowSearch: true,
      multiple: true, // 支持多选
      options: categorySelect,
      fieldNames: { label: 'label', value: 'value' }
    },
    rules: [
      { required: true, message: '请选择机构八大类归属' },
      { type: 'array', min: 1, message: '至少选择一个类目' }
    ],
  },
  {
  label: '统一社会信用代码',
  field: 'socialCode',
  type: 'input',
  span: 24,
  rules: [
    { required: true, message: '请输入统一社会信用代码' },
    {
      validator: (value, callback) => {
        // 修正后的正则表达式
        const reg = /^[0-9A-HJ-NPQRTUWXY]{2}\d{6}[0-9A-HJ-NPQRTUWXY]{10}$/;;
        if (!reg.test(value)) {
          callback('请输入有效的18位统一社会信用代码');
        } else {
          callback();
        }
      }
    }
  ],
},
  {
    label: '地点',
    field: 'location',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入地点' }],
  },
  {
    label: '法人',
    field: 'legalPerson',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入法人' }],
  },
  {
    label: '公司规模大小',
    field: 'scale',
    type: 'input', // 改为输入框类型
    span: 24,
    props: {
      type: 'number', // 设置为数字输入类型[2](@ref)
      placeholder: '请输入员工人数',
      min: 1, // 最小员工数[1](@ref)
      max: 100000 // 最大员工数[1](@ref)
    },
    rules: [
      { required: true, message: '请输入公司规模大小' },
      // 添加数字验证规则[6,7](@ref)
      {
        validator: (value, callback) => {
          if (!/^\d+$/.test(value)) {
            callback('请输入有效的数字');
          } else if (value < 1) {
            callback('公司规模不能小于1人');
          } else if (value > 100000) {
            callback('公司规模不能超过100000人');
          } else {
            callback();
          }
        }
      }
    ]
  },
  {
    label: '营业执照',
    field: 'businessLicense',
    type: 'upload',
    span: 24,
    rules: [{ required: true, message: '请上传营业执照' }],
    props: {
      max: 1,
      limit: 1,
      accept: 'image/*',
      fileList: form.businessLicenseFileList, // 绑定文件列表[6](@ref)
      customRequest: async ({ fileItem, onSuccess, onError }) => {
        try {
          const formData = new FormData()
          formData.append('file', fileItem.file)
          formData.append('type', 'pic')

          const { data } = await upload(formData)

          // 4. 更新文件列表和表单值
          form.businessLicense = data.url
          form.businessLicenseFileList = [{
            uid: fileItem.uid,
            name: fileItem.name,
            url: data.url, // 预览URL[1](@ref)
            status: 'done', // 必须设置为done状态
            response: { url: data.url } // 响应数据
          }]

          onSuccess({ url: data.url })
        } catch (err) {
          onError(err)
          Message.error('营业执照上传失败')
        }
      },
      // 5. 添加预览配置
      imagePreview: true, // 启用图片预览
      listType: 'picture-card' // 卡片式预览[7](@ref)
    },
  },
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
  // 重置文件列表
  form.businessLicenseFileList = []
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateOrg(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addOrg(form)
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
  const res = await selectOptions()
  categorySelect.value = res.data || []
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const res = await selectOptions()
  categorySelect.value = res.data || []
  const { data } = await getOrg(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
