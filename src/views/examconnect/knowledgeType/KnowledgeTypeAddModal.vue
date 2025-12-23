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
import { Message } from "@arco-design/web-vue";
import { useWindowSize } from "@vueuse/core";
import {
  getKnowledgeType,
  addKnowledgeType,
  updateKnowledgeType,
} from "@/apis/examconnect/knowledgeType";
import { selectOptions } from "@/apis/exam/project";
import { type ColumnItem, GiForm } from "@/components/GiForm";
import { useExamPlanProject, useResetReactive } from "@/hooks";
import { ref } from "vue";
import type { LabelValueState } from "@/types/global";

const emit = defineEmits<{
  (e: "save-success"): void;
}>();

const { width } = useWindowSize();

const dataId = ref("");
const visible = ref(false);
const isUpdate = computed(() => !!dataId.value);
const title = computed(() =>
  isUpdate.value ? "修改项目知识类型" : "新增项目知识类型"
);
const formRef = ref<InstanceType<typeof GiForm>>();
const projectOptions = ref<LabelValueState[]>([]);
const { examProjectOptions, getExamProjectOptions } = useExamPlanProject();

const [form, resetForm] = useResetReactive({
  name: "",
  proportion: 0,
  projectId: undefined,
});

// 自定义校验函数
const validateProportion = (
  value: number | undefined,
  callback: (error?: string) => void
) => {
  if (value === undefined || value === null) {
    callback(); // 由 required 规则处理
    return;
  }
  if (value < 1 || value > 100) {
    callback("分数占比必须在 1 到 100 之间");
  } else {
    callback();
  }
};

const columns: ColumnItem[] = reactive([
  {
    label: "知识类型名称",
    field: "name",
    type: "input",
    span: 22,
    rules: [{ required: true, message: "请输入项目ID" }],
  },
  {
    label: "分数占比(整数)",
    field: "proportion",
    type: "input-number",
    span: 22,
    rules: [
      { required: true, message: "请输入分数占比" },
      { validator: validateProportion }, // 添加自定义校验器
    ],
    props: {
      min: 1,
      max: 100,
      precision: 0, // 确保是整数
    },
  },
  {
    label: "考试项目",
    field: "projectId",
    type: "cascader",
    required: true,
    span: 24,
    props: computed(() => ({
      options: examProjectOptions.value,
      allowSearch: true,
      disabled: isUpdate.value,
    })),
    rules: [{ required: true, message: "请选择项目" }],
  },
]);

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields();
  resetForm();
};

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate();
    if (isInvalid) return false;
    if (isUpdate.value) {
      await updateKnowledgeType(form, dataId.value);
      Message.success("修改成功");
    } else {
      await addKnowledgeType(form);
      Message.success("新增成功");
    }
    emit("save-success");
    return true;
  } catch (error) {
    return false;
  }
};

const getProjectList = async (planType: number) => {
  await getExamProjectOptions(planType);
};

// 新增
const onAdd = async () => {
  reset();
  dataId.value = "";
  visible.value = true;
  getProjectList(2);
};

// 修改
const onUpdate = async (id: string) => {
  reset();
  dataId.value = id;
  visible.value = true;

  try {
    // 1. 获取知识点类型详情
    const { data } = await getKnowledgeType(id);

    // 2. 加载 分类-项目 树
    await getExamProjectOptions(2);
    const parentProjects = examProjectOptions.value;

    // 3. 根据 projectId 找到对应的 父分类 + 子项目
    const projectId = data.projectId;
    let targetParent = null;
    let targetProject = null;

    for (const parent of parentProjects) {
      const child = parent.children?.find(
        (item: any) => item.value === projectId
      );
      if (child) {
        targetParent = parent;
        targetProject = child;
        break;
      }
    }

    // 4. 容错处理
    if (!targetProject) {
      console.warn(`未找到 projectId=${projectId} 对应的项目`);
      Object.assign(form, data);
      return;
    }

    // 5. 如果你有「是否实操」相关逻辑，可在这里处理
    // if (targetProject.isOperation === 1) {
    //   ...
    // }

    // 6. 表单回显
    Object.assign(form, data);

  } catch (e) {
    console.error("知识点类型回显失败：", e);
  }
};


onMounted(async () => {
  // 获取项目选项
  const res = await selectOptions();
  projectOptions.value = res.data || [];
});

defineExpose({ onAdd, onUpdate });
</script>

<style scoped lang="scss"></style>
