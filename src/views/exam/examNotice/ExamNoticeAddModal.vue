<template>
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns">
      <template #examLevel>
        <a-radio-group v-model="form.examLevel">
          <a-radio :value="0">无</a-radio>
          <a-radio :value="1">Ⅰ级</a-radio>
          <a-radio :value="2">Ⅱ级</a-radio>
        </a-radio-group>
      </template>
      <template #projectList>
        <div class="project-list">
          <div v-for="project in projectList" :key="project.projectId" class="project-item">
            <span class="project-code">{{ project.projectCode }}</span>
            <a-tag v-if="project.examAttemptType === 0" color="blue">初试 <a-divider direction="vertical" />
              补考</a-tag>
            <a-tag v-else-if="project.examAttemptType === 1" color="blue">初试</a-tag>
            <a-tag v-else-if="project.examAttemptType === 2" color="blue">补考</a-tag>
            <a-tag v-else-if="project.examAttemptType === 3" color="green">免考</a-tag>
            <span class="practical-type">
              <a-tag v-if="project.practicalType === 0" color="orange">实操</a-tag>
              <a-tag v-else-if="project.practicalType === 1" color="orange">拍片</a-tag>
              <a-tag v-else-if="project.practicalType === 2" color="orange">评片</a-tag>
              <a-tag v-else-if="project.practicalType === 3" color="orange">拍片 <a-divider direction="vertical" />
                评片</a-tag>
              <a-tag v-else-if="project.practicalType === 4" color="green">免考</a-tag>
            </span>
            <a-date-picker v-model="project.examTime" value-format="YYYY-MM-DD HH:mm:ss" show-now-button
              format="YYYY-MM-DD HH:mm:ss" placeholder="请选择考试时间" style="width: 200px;" />
          </div>
          <a-empty v-if="needSelectTip" description="请先选择种类和考试等级" />
          <a-empty v-else-if="noProjectTip" description="该种类与考试等级下没有考试项目" />
        </div>
      </template>
    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getExamNotice, addExamNotice, updateExamNotice } from '@/apis/exam/examNotice'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'
import { selectOptions } from "@/apis/exam/category";
import type { LabelValueState } from "@/types/global";
import { getInspectionProjectList } from '@/apis/exam/project'
const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改无损检测、检验人员考试通知' : '新增无损检测、检验人员考试通知'))
const formRef = ref<InstanceType<typeof GiForm>>()
const categorySelect = ref<LabelValueState[]>([]);
interface ProjectItem {
  projectId: string
  projectCode: string
  examTime?: string
  examAttemptType?: number
  practicalType?: number
}

const projectList = ref<ProjectItem[]>([]);

const needSelectTip = computed(() => !form.categoryId || form.examLevel === undefined)
const noProjectTip = computed(() => projectList.value.length === 0 && !needSelectTip.value)



const [form, resetForm] = useResetReactive({
  examLevel: 0,
  categoryId: undefined as string | undefined
})
// 监听 categoryId 和 examLevel 变化，重新获取项目列表
watch(
  () => [form.categoryId, form.examLevel],
  async ([newCategoryId, newExamLevel]) => {
    if (newCategoryId && newExamLevel !== undefined) {
      const { data } = await getInspectionProjectList(newCategoryId as string, newExamLevel as number)
      projectList.value = (data || []).map((item: any) => ({
        projectId: item.projectId,
        projectCode: item.projectCode,
        examTime: '',
        examAttemptType: item.examAttemptType,
        practicalType: item.practicalType
      }))
    } else {
      projectList.value = []
    }
  }
)

const columns: ColumnItem[] = reactive([
  {
    label: '标题',
    field: 'title',
    type: 'textarea',
    props: {
      autoSize: true
    },
    span: 24,
    rules: [{ required: true, message: '请输入标题' }]
  },
  {
    label: '报名截止时间',
    field: 'applyDeadline',
    type: 'date-picker',
    span: 24,
    rules: [{ required: true, message: '请输入报名截止时间' }]
  },
  {
    label: "所属种类",
    prop: "categoryId",
    field: "categoryId",
    type: "select",
    required: true,
    span: 24,
    props: {
      allowSearch: true,
      options: categorySelect,
    },
  },
  {
    label: '考试等级',
    field: 'examLevel',
    span: 24,
    rules: [{ required: true, message: '请选择考试等级' }],
  },
  {
    label: '考试项目',
    field: 'projectList',
    span: 24,
    rules: [{
      validator: (value: any, callback) => {
        if (!form.categoryId || form.examLevel === undefined) {
          callback('请选择种类和考试等级')
        } else if (!projectList.value.length) {
          callback('当前条件下无项目，请重新选择种类或考试等级')
        } else if (projectList.value.some(p => !p.examTime)) {
          callback('请为每个项目选择考试时间')
        } else {
          callback()
        }
      },
      trigger: 'change'
    }],
  },
  {
    label: '说明',
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
  formRef.value?.formRef?.clearValidate()
  resetForm()
  projectList.value = []
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateExamNotice(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addExamNotice(form)
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
  const res = await selectOptions([3, 4]);
  categorySelect.value = res.data || [];
}

// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getExamNotice(id)
  Object.assign(form, data)
  visible.value = true
}

defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss">
.project-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-item {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: nowrap;
  justify-content: space-between;
}

.project-code {
  font-weight: 500;
}

.practical-type {
  color: var(--color-text-3);
}
</style>
