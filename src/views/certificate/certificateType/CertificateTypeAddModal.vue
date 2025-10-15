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
import { getCertificateType, addCertificateType, updateCertificateType } from '@/apis/certificate/certificateType'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import {usePlan, useResetReactive} from '@/hooks'
import { useDict } from '@/hooks/app'
import {computed} from "vue";
import {upload} from "@/apis/common/carousel";

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改证件种类' : '新增证件种类'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { deptProjectsList, getDeptProjectsList} = usePlan()

const [form, resetForm] = useResetReactive({
  // todo 待补充
})

const handleUpload = (options: RequestOption) => {
  const controller = new AbortController()
  ;(async function requestWrap() {
    const { onProgress, onError, onSuccess, fileItem, name = 'file' } = options
    onProgress(20)
    const formData = new FormData()
    formData.append(name as string, fileItem.file as Blob)
    formData.append('type', 'pic')
    try {
      const res = await upload(formData, {
        signal: controller.signal
      })
      Message.success('上传成功')
      form.imageUrl = res.data.url
      onSuccess(res.data.thUrl)
    } catch (error) {
      onError(error)
    }
  })()
  return {
    abort() {
      controller.abort()
    },
  }
}
watch(() => visible.value, async (newProvinceId, oldProvinceId) => {
  if (newProvinceId === true)
    await getDeptProjectsList()
},{ immediate: false })

const columns: ColumnItem[] = reactive([
  {
    label: '证书展示图',
    field: 'imageUrl',
    type: 'upload',
    span: 24,
    props: {
      accept: 'image/*',
      limit: 1,
      showFileList: true,
      listType: 'picture-card',
      customRequest: handleUpload,
      fileList: computed(() => {
        if (form.imageUrl) {
          return [{
            uid: '-1',
            name: '已上传图片',
            url: form.imageUrl,
            status: 'done'
          }]
        }
        return []
      }),
      onChange: (fileList: any) => {
        if (fileList.length === 0) {
          form.imageUrl = ''
        }
      }
    },
    required: true,
  },
  {
    label: '证件名称',
    field: 'certificateName',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入证件名称' }],
  },
  {
    label: '所属项目',
    field: 'projectId',
    type: 'select',
    span: 24,
    rules: [{ required: true, message: '请选择所属项目' }],
    props: {
      options: deptProjectsList,
      allowSearch: true,
      placeholder: '请选择所属项目',
    },
  },
])

// 上传文件
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
      await updateCertificateType(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addCertificateType(form)
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
  const { data } = await getCertificateType(id)
  data.projectId = Number(data.belongingProjectId)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
