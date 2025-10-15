<template>
    <a-modal
      v-model:visible="visible"
      title="审核复审申请"
      :mask-closable="false"
      :esc-to-close="false"
      :width="width >= 600 ? 600 : '100%'"
      draggable
      @before-ok="save"
      @close="reset"
    >
      <div class="audit-content">
        <!-- 图片预览 -->
        <div class="preview-section mb-4">
          <div class="preview-item">
            <div class="preview-title">作业人员资格证：</div>
            <a-image
              :src="form.certificateUrl"
              width="200"
              fit="contain"
            />
          </div>
          <div class="preview-item">
            <div class="preview-title">复审资格申请表：</div>
            <a-image
              :src="form.applicantFormUrl"
              width="200"
              fit="contain"
            />
          </div>
        </div>
  
        <!-- 审核表单 -->
        <GiForm ref="formRef" v-model="form" :columns="columns" />
      </div>
    </a-modal>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive } from 'vue'
  import { Message } from '@arco-design/web-vue'
  import { useWindowSize } from '@vueuse/core'
  import { getReexamine, updateReexamineStatus } from '@/apis/certificate/reexamine'
  import { type ColumnItem, GiForm } from '@/components/GiForm'
  import { useResetReactive } from '@/hooks'
  
  const emit = defineEmits<{
    (e: 'save-success'): void
  }>()
  
  const { width } = useWindowSize()
  
  const dataId = ref('')
  const visible = ref(false)
  const formRef = ref<InstanceType<typeof GiForm>>()
  
  // 表单数据只需要包含审核状态字段
  const [form, resetForm] = useResetReactive({
    reexaminStatus: undefined
  })
  
  // 表单配置
  const columns: ColumnItem[] = reactive([
    {
      label: '审核状态',
      prop: 'reexaminStatus',
      field: 'reexaminStatus',
      type: 'select',
      span: 24,
      rules: [{ required: true, message: '请选择审核状态' }],
      props: {
        options: [
          { label: '待审核', value: '0' },
          { label: '通过', value: '1' },
          { label: '不通过', value: '2' }
        ],
        allowSearch: true,
      },
    }
  ])
  
  // 重置
  const reset = () => {
    formRef.value?.formRef?.resetFields()
    resetForm()
  }
  
  // 保存（提交审核）
  const save = async () => {
    try {
      const isInvalid = await formRef.value?.formRef?.validate()
      if (isInvalid) return false
  
      // 构造提交的数据
      const submitData = {
        id: dataId.value,
        reexaminStatus: form.reexaminStatus
      }
    
      await updateReexamineStatus(form, dataId.value)
     
      emit('save-success')
      return true
    } catch (error) {
      Message.error('审核失败')
      return false
    }
  }
  
  // 打开审核
  const onExamine = async (id: string) => {
    reset()
    dataId.value = id
    const { data } = await getReexamine(id)
   
    // 只设置图片URL，不设置状态值
    // form.certificateUrl = data.certificateUrl
    // form.applicantFormUrl = data.applicantFormUrl
    Object.assign(form, data)  // 直接将所有数据合并到 form
    form.reexaminStatus = ''
    // console.log(form)
    visible.value = true
  }
  
  defineExpose({ onExamine })
  </script>
  
  <style scoped lang="scss">
  .audit-content {
    padding: 16px 0;
  }
  
  .mb-4 {
    margin-bottom: 24px;
  }
  
  .preview-section {
    .preview-item {
      margin-bottom: 16px;
      
      .preview-title {
        margin-bottom: 8px;
        font-weight: 500;
      }
    }
  }
  </style> 