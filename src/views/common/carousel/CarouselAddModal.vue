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
import {Message, type RequestOption} from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import {getCarousel, addCarousel, updateCarousel, upload} from '@/apis/common/carousel'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { selectAnnouncement } from '@/apis/common/announcement'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改轮播图管理' : '新增轮播图管理'))
const formRef = ref<InstanceType<typeof GiForm>>()
const announcementList = ref([])

const [form, resetForm] = useResetReactive({
  imageUrl: '',
  imageMinUrl: '',
  announcementId: '',
  description: '',
  sortOrder: '',
  status: 1,
})

// 上传图片
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
      form.imageMinUrl = res.data.thUrl
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
const columns: ColumnItem[] = reactive([
  {
    label: '轮播图片',
    field: 'imageMinUrl',
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
            url: form.imageMinUrl || form.imageUrl,
            status: 'done'
          }]
        }
        return []
      }),
      onChange: (fileList: any) => {
        if (fileList.length === 0) {
          form.imageUrl = ''
          form.imageMinUrl = ''
        }
      }
    },
    required: true,
  },
  {
    label: '图片描述',
    field: 'description',
    type: 'input',
    span: 24,
  },
  {
    label: '跳转的公告',
    field: 'announcementId',
    type: 'select',
    span: 24,
    required: true,
    props: {
      options: announcementList
    }
  },
  {
    label: '排序，数值越大越靠前',
    field: 'sortOrder',
    type: 'input-number',
    span: 24,
    required: true,
  },
  {
    label: '轮播图状态',
    field: 'status',
    type: 'select',
    span: 24,
    props: {
      options: [
        { label: '禁用', value: 0 },
        { label: '启用', value: 1 },
      ],
    },
  },
]);

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
      await updateCarousel(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addCarousel(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 获取公告列表
const getAnnouncementList = async () => {
  try {
    const { data } = await selectAnnouncement()
    announcementList.value = data
  } catch (error) {
    console.error('获取公告列表失败:', error)
  }
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  visible.value = true
  // 获取最新的公告列表
  await getAnnouncementList()
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  // 获取最新的公告列表
  await getAnnouncementList()
  const { data } = await getCarousel(id)
  Object.assign(form, data)
  visible.value = true
}

const onUpdateStatus = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getCarousel(id)
  Object.assign(form, data)
}

defineExpose({ onAdd, onUpdate, onUpdateStatus })
</script>

<style scoped lang="scss"></style>
