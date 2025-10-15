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
import { getWatchRecord, addWatchRecord, updateWatchRecord } from '@/apis/training/watchRecord'
import { getVideo } from '@/apis/training/video'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改学习记录' : '新增学习记录'))
const formRef = ref<InstanceType<typeof GiForm>>()

const [form, resetForm] = useResetReactive({
  studentId: '',
  videoId: '',
  watchedDuration: 0
})

const videoDuration = ref(0)
const remainingDuration = computed(() => videoDuration.value - (parseInt(form.watchedDuration) || 0))
const isDurationValid = ref(true)

// 获取视频时长
const getVideoDuration = async (videoId: string) => {
  try {
    const { data } = await getVideo(videoId)
    videoDuration.value = parseInt(data.duration)
  } catch (error) {
    console.error('获取视频时长失败:', error)
  }
}

// 验证时长
const validateDuration = (value: string) => {
  const duration = parseInt(value)
  if (isNaN(duration) || duration < 0) {
    Message.error('请输入有效的时长')
    isDurationValid.value = false
    return false
  }
  if (duration > videoDuration.value) {
    Message.error(`观看时长不能超过视频总时长(${videoDuration.value}秒)`)
    isDurationValid.value = false
    return false
  }
  isDurationValid.value = true
  return true
}

const columns: ColumnItem[] = reactive([
  {
    label: '学生ID',
    field: 'studentId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入学生ID' }]
  },
  {
    label: '视频ID',
    field: 'videoId',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入视频ID' }]
  },
  {
    label: '已观看时长（秒）',
    field: 'watchedDuration',
    type: 'input',
    span: 24,
    rules: [{ required: true, message: '请输入已观看时长' }],
    extra: computed(() => `已输入：${form.watchedDuration || 0}秒 / 剩余：${remainingDuration.value}秒`),
    props: {
      type: 'number',
      min: 0,
      max: videoDuration.value,
      onChange: (value: string) => validateDuration(value)
    }
  }
])

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    if (!isDurationValid.value) {
      Message.error('请修正观看时长后再提交')
      return false
    }
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateWatchRecord(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addWatchRecord(form)
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
  const { data } = await getWatchRecord(id)
  // 先获取视频时长
  await getVideoDuration(data.videoId)
  // 再设置表单数据
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
