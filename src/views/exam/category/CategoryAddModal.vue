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
    <GiForm :columns="columns" v-model="form">
      <!-- 自定义上传后的预览区域 -->
      <template #videoUrl>
        <div class="video-uploader">
          <!-- 上传按钮 -->
          <a-upload
              :file-list="form.videoUrl ? [] : []"
              :show-file-list="false"
              :custom-request="handleFileUpload"
              :before-upload="beforeUpload"
          >
            <a-button type="outline">
              <template #icon><icon-upload /></template>
              上传视频
            </a-button>
          </a-upload>

          <!-- 视频预览 -->
          <div v-if="form.videoUrl" class="video-preview">
            <video :src="form.videoUrl" controls style="width: 200px; height: 120px;"></video>
            <a-button type="text" status="danger" @click="form.videoUrl = ''">
              <template #icon><icon-delete /></template>
            </a-button>
          </div>
        </div>
      </template>
    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { addCategory, getCategory, updateCategory } from '@/apis/exam/category'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import {upload} from "@/utils/upload";

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改八大类信息' : '新增八大类'))
const formRef = ref<InstanceType<typeof GiForm>>()

const beforeUpload = (file) => {
  const isVideo = file.type.startsWith('video/');
  if (!isVideo) {
    Message.error('只能上传视频文件！');
  }
  return isVideo;
};

const handleFileUpload = async (file) => {
  if (!beforeUpload(file.fileItem.file)) return;
  const formData = new FormData();
  formData.append('file', file.fileItem.file)
  formData.append('type', 'video')

  try {
    const response = await upload( formData )
    form.videoUrl = response.data.url // 更新表单中的视频URL
    Message.success('上传成功')
  } catch (error) {
    Message.error('上传失败')
  }
}

const [form, resetForm] = useResetReactive({
  // todo 待补充
  name: '',
  code: '',
  videoUrl: '', // 新增视频URL字段
  topicNumber: 0, // 新增题目数量字段
})

const columns: ColumnItem[] = reactive([
  {
    label: '种类名称',
    field: 'name',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入种类名称' }],
  },
  {
    label: '代码',
    field: 'code',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入八大类代码' }],
  },
  {
    label: '题目数量',
    field: 'topicNumber',
    type: 'input-number',
    span: 24,
    rules: [{ required: true, message: '请输入题目数量' }],
  },
  {
    label: '警示短片',
    field: 'videoUrl',
    type: 'upload', // 启用上传组件
    span: 24,
    props: {
      accept: 'video/*',
      limit: 1,
      showFileList: false, // 隐藏默认文件列表
      // customRequest: handleFileUpload, // 自定义上传逻辑
      fileList: computed(() =>
          form.videoUrl ? [{ uid: '-1', name: '视频', url: form.videoUrl }] : []
      ),
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
    if(form.topicNumber === undefined) {
      Message.error('请上传题目数量')
      return false
    }
    if(form.videoUrl === '') {
      Message.error('请上传视频')
      return false
    }
    if (isUpdate.value) {
      await updateCategory(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addCategory(form)
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
  const { data } = await getCategory(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
.video-preview {
  margin-top: 20px;
}
</style>
