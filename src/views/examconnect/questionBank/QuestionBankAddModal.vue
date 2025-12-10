<template>
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />

    <!-- 动态输入框 -->
    <template v-if="form.questionType === 0 || form.questionType === 1">
      <!-- 单选题和判断题 -->
      <a-radio-group v-model="correctAnswers">
        <div v-for="(option, index) in options" :key="index" class="option-row">
          <a-textarea v-model="options[index]" placeholder="请输入选项" allow-clear />
          <a-radio :value="index" class="radio-button">正确答案</a-radio>
        </div>
      </a-radio-group>
    </template>

    <template v-else-if="form.questionType === 2">
      <!-- 多选题 -->
      <a-checkbox-group v-model="correctAnswers">
        <div v-for="(option, index) in options" :key="index" class="option-row">
          <a-textarea v-model="options[index]" placeholder="请输入选项" allow-clear />
          <a-checkbox :value="index" class="checkbox-button">答案</a-checkbox>
        </div>
      </a-checkbox-group>
    </template>

    <template v-else>
      <!-- 简答题 -->
      <div class="option-row">
        <a-textarea v-model="options[0]" placeholder="请输入参考答案" allow-clear />
      </div>
    </template>

    <!-- 按钮组 -->
    <div v-if="form.questionType !== 3" class="button-group">
      <a-button @click="addOption" type="primary" class="add-option-btn">添加答案选项</a-button>
      <a-button @click="removeLastOption" status="danger" class="remove-option-btn">删除答案选项</a-button>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getQuestionBank, addQuestionBank, updateQuestionBank, getOptions } from '@/apis/examconnect/questionBank'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { upload } from '@/apis/common/carousel'
import { watch } from 'vue'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改题目' : '新增题目'))
const formRef = ref<InstanceType<typeof GiForm>>()
const categoryOptions = ref([])
const correctAnswer = ref(null)
const correctAnswers = ref<number[]>([])

// 新增选项的数组
const options = ref<string[]>([])

const addOption = () => {
  options.value.push('')  // 每次点击按钮时新增一个空选项
}

// 添加删除方法
const removeLastOption = () => {
  options.value.pop()
  if (correctAnswer.value === options.value.length) {
    correctAnswer.value = null
  }
  if (correctAnswers.value.includes(options.value.length)) {
    correctAnswers.value = correctAnswers.value.filter(v => v !== options.value.length)
  }
}

// 修改 form 的初始化，移除循环引用
const [form, resetForm] = useResetReactive({
  questionType: 0,
  question: '',
  categoryIds: [],
  imageMinUrl: '',
  imageUrl: '',
  examType: 1,
})

const findPath = (
  options: any[],
  targetId: string | number,
  path: any[] = []
): any[] | null => {
  for (const item of options) {
    const newPath = [...path, item.value];
    if (String(item.value) === String(targetId)) {
      return newPath;
    }
    if (item.children && item.children.length > 0) {
      const result = findPath(item.children, targetId, newPath);
      if (result) return result;
    }
  }
  return null;
};

// 修改保存方法中的相关部分
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    const categoryIds = findPath(categoryOptions.value, form.categoryIds)

    if (!options.value || options.value.length < 2) {
      Message.warning('题目必须包含两个选项');
      return false;
    }

    const hasEmpty = options.value.some(opt => !opt);

    if (hasEmpty) {
      Message.warning('选项中内容不允许为空');
      return false;
    }

    if (correctAnswers.value.length === 0) {
      Message.warning('题目必须至少有一个正确答案');
      return false;
    }

    if (!Array.isArray(correctAnswers.value)) {
      correctAnswers.value = [correctAnswers.value]
    }

    const submitData = {
      questionType: form.questionType,
      question: form.question,
      imageMinUrl: form.imageMinUrl,
      imageUrl: form.imageUrl,
      categoryId: categoryIds,
      options: options.value,
      correctAnswers: correctAnswers.value,
      examType: form.examType,
    }
    if (isUpdate.value) {
      await updateQuestionBank(submitData, dataId.value)
      Message.success('修改成功')
    } else {
      await addQuestionBank(submitData)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}

// 修改 watch 函数，在切换到简答题时重置选项
watch(() => form.questionType, (newValue) => {
  if (newValue === 3) {
    options.value = [''];
    correctAnswer.value = null;
    correctAnswers.value = [];
  }
});

// 上传图片
const handleUpload = (options: RequestOption) => {
  const controller = new AbortController()
    ; (async function requestWrap() {
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
// 考试类型选项（与数据库枚举值一致：0-未指定，1-作业人员考试，2-无损检验人员考试，3-有损检验人员考试）
const examTypeOptions = [
  { label: '作业人员', value: 1 },
  { label: '检验人员', value: 2 },
  // 后续新增类型直接在这里添加，无需修改表结构
];
const columns: ColumnItem[] = reactive([
  {
    label: '附件图片',
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
  },
  {
    label: '知识类型',
    field: 'categoryIds',
    type: 'cascader',
    span: 24,
    props: {
      options: categoryOptions,
      allowSearch: true,
      allowClear: true
    },
    rules: [{ required: true, message: '请选择知识类型' }]
  },
  {
    label: '问题',
    field: 'question',
    type: 'textarea',
    span: 24,
    rules: [{ required: true, message: '请输入问题' }]
  },
  {
    label: '题型',
    field: 'questionType',
    type: 'radio-group',
    span: 24,
    props: {
      options: [
        { label: '选择题', value: 0 },
        { label: '多选题', value: 2 },
        { label: '判断题', value: 1 },
        // {label: '简单题', value: 3},
      ],
      type: 'button',
    },
  },
  {
    label: '考试人员类型',
    field: 'examType', // 字段名与数据库字段 exam_type 对应
    type: 'radio-group',
    span: 24,
    props: {
      options: examTypeOptions, // 引用上面定义的选项数组
      type: 'button', // 与题目类型保持一致的按钮样式
    },
    rules: [{ required: true, message: '请选择考试类型' }],
  },
])
// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
  correctAnswer.value = null
  correctAnswers.value = []
  options.value = []
}

// 新增
const onAdd = async () => {
  reset()
  dataId.value = ''
  const res = await getOptions()
  categoryOptions.value = res.data || []
  visible.value = true
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const res = await getOptions()
  categoryOptions.value = res.data || []
  const { data } = await getQuestionBank(id)
  Object.assign(form, data)

  visible.value = true
  form.categoryIds = form.categoryId
  form.imageMinUrl = form.attachment
  form.imageUrl = form.attachment
  form.examType = data.examType || 0 // 兜底默认值 0，避免 undefined
  options.value = form.options
  if (form.questionType !== 2) {
    correctAnswers.value = form.correctAnswers[0]
  } else {
    correctAnswers.value = form.correctAnswers
  }
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
.option-row {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  gap: 8px;
  width: 175%; // 添加100%宽度

  .arco-textarea-wrapper {
    flex: 1;
    width: 100%; // 确保文本框占据所有可用空间
    min-width: 0; // 防止flex项溢出
    margin-left: 10px;
    height: 100px;
  }

  .radio-button {
    flex-shrink: 0;
    margin-left: 8px;
    white-space: nowrap; // 防止文字换行
  }
}

// 确保radio group容器也是100%宽度
:deep(.arco-radio-group) {
  width: 100%;
  display: block;

  .option-row {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
    gap: 8px;
    width: 100%;
  }
}

// 确保文本框容器占满宽度
:deep(.arco-textarea) {
  width: 100%;
  display: block;
  min-height: 60px; // 增加默认最小高度
}

:deep(.arco-textarea-wrapper) {
  width: 100%;
  flex: 1;

  textarea {
    min-height: 60px; // 确保textarea本身也有最小高度
    line-height: 1.5; // 调整行高
    padding: 8px; // 增加内边距
  }
}

.radio-button {
  flex: 0 0 auto;
  white-space: nowrap;
  margin-left: 8px;
}

// 添加外层容器样式
:deep(.arco-modal-content) {
  width: 100%;
  padding: 16px;
}

// 添加复选框样式
.checkbox-button {
  flex-shrink: 0;
  margin-left: 8px;
  white-space: nowrap;
}

// 修改单选框和复选框选中状态的样式
:deep(.arco-radio-checked) {
  .arco-radio-label {
    color: rgb(var(--success-6));
    font-weight: 500;
  }
}

:deep(.arco-checkbox-checked) {
  .arco-checkbox-label {
    color: rgb(var(--success-6));
    font-weight: 500;
  }
}

// 添加按钮组样式
.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;

  .add-option-btn,
  .remove-option-btn {
    width: 100%;
  }
}
</style>
