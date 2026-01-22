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
    <GiForm :columns="computedColumns" v-model="form" ref="formRef">
      <!-- 自定义上传后的预览区域 -->
      <template #videoUrl>
        <div class="video-uploader">
          <!-- 上传按钮：仅焊接场景也保留可点击（允许修改视频） -->
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

      <!-- 种类类型 - 小圆点单选按钮：添加禁用控制 -->
      <template #categoryType>
        <div class="category-type-radio">
          <a-radio-group v-model="form.categoryType" :disabled="isWeldingReadonly">
            <div class="radio-item">
              <a-radio :value="1">八大类</a-radio>
            </div>
            <div class="radio-item">
              <a-radio :value="2">焊接</a-radio>
            </div>
            <div class="radio-item">
              <a-radio :value="3">无损检测</a-radio>
            </div>
            <div class="radio-item">
              <a-radio :value="4">检验人员</a-radio>
            </div>
          </a-radio-group>
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
import { upload } from "@/utils/upload";
import { ref, computed, reactive } from 'vue'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改八大类信息' : '新增八大类'))
const formRef = ref<InstanceType<typeof GiForm>>()

// 核心判断：修改场景 + 种类类型为2（焊接）→ 只读控制
const isWeldingReadonly = computed(() => {
  return isUpdate.value && form.categoryType === 2
})

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
    const response = await upload(formData)
    form.videoUrl = response.data.url // 更新表单中的视频URL
    Message.success('上传成功')
  } catch (error) {
    Message.error('上传失败')
  }
}

// 表单初始值
const [form, resetForm] = useResetReactive({
  name: '',
  code: '',
  videoUrl: '',
  topicNumber: 0,
  categoryType: undefined,
})

// 基础列配置（抽离公共配置）
const baseColumns: ColumnItem[] = [
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
    label: '种类类型',
    field: 'categoryType',
    type: 'slot',
    span: 24,
    rules: [{ required: true, message: '请选择种类类型' }],
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
    type: 'upload',
    span: 24,
    props: {
      accept: 'video/*',
      limit: 1,
      showFileList: false,
      fileList: computed(() =>
        form.videoUrl ? [{ uid: '-1', name: '视频', url: form.videoUrl }] : []
      ),
    },
  },
]

// 动态计算列：根据焊接只读状态控制字段禁用，全部字段保留显示
const computedColumns = computed(() => {
  return baseColumns.map(col => {
    // 焊接修改场景：禁用 名称/代码/种类类型，保留 题目数量/警示短片 可编辑
    if (isWeldingReadonly.value) {
      return {
        ...col,
        disabled: ['name', 'code', 'categoryType'].includes(col.field),
        // 禁用字段清空校验规则，避免必填校验报错
        rules: ['name', 'code', 'categoryType'].includes(col.field) ? [] : col.rules
      }
    }
    // 其他场景：所有字段可编辑，保留原规则
    return { ...col, disabled: false }
  })
})

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存：适配焊接场景的校验逻辑
const save = async () => {
  try {
    // 统一执行表单校验（已通过computedColumns处理不同场景的规则）
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false

    // 额外校验题目数量（焊接场景核心必传）
    if (form.topicNumber === 0 || form.topicNumber === undefined) {
      Message.error('请输入题目数量')
      return false
    }
    // 非焊接场景：校验种类类型有效性
    if (!isWeldingReadonly.value && (!form.categoryType || ![1,2,3,4].includes(form.categoryType))) {
      Message.error('请选择有效的种类类型')
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
    visible.value = false
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

// 修改回显
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getCategory(id)
  if (data.categoryType) data.categoryType = Number(data.categoryType)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
.video-preview {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.category-type-radio {
  padding: 8px 0;
  
  .radio-item {
    display: inline-block;
    margin-right: 24px;
    line-height: 32px;
  }

  :deep(.arco-radio) {
    :deep(.arco-radio-inner) {
      width: 16px;
      height: 16px;
    }
  }
}
</style>