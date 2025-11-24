<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 1000 ? 1000 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
    <!-- 富文本编辑器 -->
    <div class="aie-container">
      <div class="aie-main">
        <div class="aie-container-panel">
          <div ref="editorRef" class="aie-container-main"></div>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getAnnouncement, addAnnouncement, updateAnnouncement } from '@/apis/common/announcement'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { AiEditor, type AiEditorOptions } from 'aieditor'
import 'aieditor/dist/style.css'
import { ref, computed, onMounted, onUnmounted } from 'vue'
import {decompressBase64} from "@/utils/textCompressor";
import {upload} from "@/apis/common/carousel";

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改公告管理' : '新增公告管理'))
const formRef = ref<InstanceType<typeof GiForm>>()
const editorRef = ref<HTMLElement>()
const aieditor = ref<AiEditor | null>(null)

const [form, resetForm] = useResetReactive({
  title: '',
  content: '',
  status: ''
})

const columns: ColumnItem[] = reactive([
  {
    label: '公告标题',
    field: 'title',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入公告标题' }]
  },

  {
    label: '公告状态',
    field: 'status',
    type: 'select',
    span: 24,
    props: {
      options: [
        { label: '禁用', value: 0 },
        { label: '启用', value: 1 },
      ],
    },
    rules: [{ required: true, message: '请选择公告状态' }]
  }
])

// 初始化富文本编辑器
const initEditor = () => {
  const editorConfig: AiEditorOptions = {
    element: editorRef.value!,
    placeholder: '请输入公告内容...',
    content: form.content,
    onChange: (editor: AiEditor) => {
      form.content = editor.getHtml()
    },
    image: {
      uploader: (file, uploadUrl, headers, formName) => {
        //可自定义图片上传逻辑
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'pic')
        const data = upload(formData)
        return data.then(res => {
          return {
            url: res.data.url,
            href: '' // 可选的图片链接
          }
        })
      },
      uploaderEvent: {
        onSuccess: (file , response) => {
          //监听图片上传成功
          //注意：
          // 1、如果此方法返回 false，则图片不会被插入到编辑器
          // 2、可以在这里返回一个新的 json 给编辑器
          return {
            "errorCode": 0,
            "data": {
              "src": response.url,
              "alt": "无法显示",
            }
          }
        },
      }
    },
    // 添加图片上传配置
    upload: {
      // 图片上传处理
      image: async (files: File[]) => {
        try {
          // 这里处理图片上传逻辑
          const file = files[0] // 获取第一个文件

          // 检查文件类型
          if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            throw new Error('只支持 jpg、png、gif 格式的图片')
          }

          // 检查文件大小（例如限制 5MB）
          if (file.size > 5 * 1024 * 1024) {
            throw new Error('图片大小不能超过 5MB')
          }
          // 创建 FormData
          const formData = new FormData()
          formData.append('file', file)

          // 调用你的上传接口
          // const response = await uploadApi(formData)
          // return response.data.url

          // 这里返回上传后的图片URL
          // return {
          //   url: response.data.url,
          //   href: '' // 可选的图片链接
          // }

          // 临时返回示例，请替换为实际的上传逻辑
          return {
            url: 'https://example.com/image.jpg',
            href: '' // 可选的图片链接
          }

        } catch (error) {
          // 处理错误
          Message.error(error instanceof Error ? error.message : '图片上传失败')
          throw error
        }
      },
      // 可选：自定义上传进度处理
      onProgress: (progress: number) => {
      },
      // 可选：上传失败处理
      onError: (error: Error) => {
        Message.error('图片上传失败')
      }
    }
  }
  aieditor.value = new AiEditor(editorConfig)
}

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
  if (aieditor.value) {
    aieditor.value.destroy() // 销毁富文本编辑器实例
    aieditor.value = null // 将实例置为 null
  }
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateAnnouncement(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addAnnouncement(form)
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
  nextTick(() => {
    if (aieditor.value) {
      aieditor.value.destroy() // 销毁旧的富文本编辑器实例
    }
    initEditor() // 重新初始化富文本编辑器
  })
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getAnnouncement(id)
  data.content = decompressBase64(data.content)
  Object.assign(form, data)
  visible.value = true
  nextTick(() => {
    if (aieditor.value) {
      aieditor.value.destroy() // 销毁旧的富文本编辑器实例
    }
    initEditor() // 重新初始化富文本编辑器
    aieditor.value?.setHtml(form.content) // 设置富文本编辑器内容
  })
}

// 生命周期钩子
onMounted(() => {
  if (visible.value) initEditor()
})

onUnmounted(() => {
  if (aieditor.value) {
    aieditor.value.destroy() // 销毁富文本编辑器实例
  }
})

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
.aie-container {
  border: none !important;
}

.aie-container-panel {
  width: 100%;
  margin: 1rem 0;
  border: 1px solid var(--color-border-1);
  background-color: var(--color-bg-1);
  padding: 1rem;
  box-sizing: border-box;
}

.aie-main {
  position: relative;
  overflow: hidden;
  flex: 1;
  box-sizing: border-box;
  background-color: var(--color-bg-2);
}
</style>