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
    <GiForm ref="formRef" v-model="form" :columns="currentColumns">
      <!-- 考试等级 - 小圆点单选按钮 -->
      <template #projectLevel>
        <a-radio-group
          v-model="form.projectLevel"
          :disabled="isWeldingReadonly"
        >
          <a-radio :value="0">无</a-radio>
          <a-radio :value="1">Ⅰ级</a-radio>
          <a-radio :value="2">Ⅱ级</a-radio>
        </a-radio-group>
      </template>

      <template #isTypeTest>
        <a-radio-group v-model="form.isTypeTest">
          <a-radio :value="0">否</a-radio>
          <a-radio :value="1">是</a-radio>
        </a-radio-group>
      </template>
    </GiForm>
    <template #footer>
      <a-button v-if="isAudit" type="primary" @click="onAuditConfirm"
        >确认审核</a-button
      >
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { useWindowSize } from "@vueuse/core";
import {
  getProject,
  addProject,
  updateProject,
  examine,
} from "@/apis/exam/project";
import { type ColumnItem, GiForm } from "@/components/GiForm";
import { useResetReactive } from "@/hooks";
import { upload } from "@/apis/common/carousel";
import { ref } from "vue";
import { selectOptions } from "@/apis/exam/category";
import type { LabelValueState } from "@/types/global";
import { number } from "echarts";

const emit = defineEmits<{
  (e: "save-success"): void;
}>();

const { width } = useWindowSize();

const dataId = ref("");
const visible = ref(false);
const isUpdate = computed(() => !!dataId.value);
const isAudit = ref(false);
const title = computed(() => {
  if (isAudit.value) return "审核";
  return isUpdate.value ? "修改项目" : "新增项目";
});
const formRef = ref<InstanceType<typeof GiForm>>();

const [form, resetForm] = useResetReactive({
  projectName: "",
  projectCode: "",
  examDuration: "",
  examEndAge: 60,
  imageUrl: "",
  auditStatus: "2",
  projectStatus: "",
  isTypeTest: 0,
  categoryId: undefined as number | undefined,
  projectType: 1,
  isOperation: 1,
  projectLevel: 0,
  isTheory: 1,
  examFee: 0,
  trainingFee: 0,
});

const categorySelect = ref<LabelValueState[]>([]);

const categoryDisabled = computed(() => {
  return isUpdate.value;
});

const columns: ColumnItem[] = reactive([
  {
    label: "项目名称",
    prop: "projectName",
    type: "input",
    field: "projectName",
    required: true,
    span: 24,
  },
  {
    label: "项目代码",
    prop: "projectCode",
    field: "projectCode",
    type: "input",
    required: true,
    span: 24,
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
      disabled: categoryDisabled,
    },
  },
  {
    label: "考试时长（分钟）",
    prop: "examDuration",
    field: "examDuration",
    type: "input-number",
    required: true,
    span: 24,
  },
  {
    label: "考试年龄上限（岁）",
    prop: "examEndAge",
    field: "examEndAge",
    type: "input-number",
    required: true,
    span: 24,
    props: {
      min: 60,
      max: 80,
    },
  },
  {
    label: "是否是型式试验项目",
    field: "isTypeTest",
    type: "slot",
    span: 24,
    rules: [{ required: true, message: "请选择是否是型式试验项目" }],
  },
  // {
  //   label: '考试等级',
  //   field: 'projectLevel',
  //   type: 'slot',
  //   span: 24,
  //   rules: [{ required: true, message: '请选择考试等级' }],
  // },
  {
    label: "机考闭卷考试",
    field: "isTheory",
    type: "select",
    span: 24,
    required: true,
    props: {
      options: [
        { label: "有", value: 1 },
        { label: "无", value: 0 },
      ],
      placeholder: "请选择是否有机考闭卷考试",
    },
  },
  {
    label: "实操考试",
    field: "isOperation",
    type: "select",
    span: 24,
    required: true,
    props: {
      options: [
        { label: "有", value: 1 },
        { label: "无", value: 0 },
      ],
      placeholder: "请选择是否有实操考试",
    },
  },
  {
    label: "项目类型",
    field: "projectType",
    type: "select",
    span: 24,
    required: true,
    show: false,
    props: {
      options: [
        { label: "作业人员", value: "0" },
        { label: "检验人员", value: "1" },
      ],
      placeholder: "请选择是否有实操考试",
    },
  },
  {
    label: "项目状态",
    field: "projectStatus",
    type: "select",
    span: 24,
    required: true,
    show: false,
    props: {
      options: [
        { label: "上架", value: "1" },
        { label: "停用", value: "3" },
        { label: "正常发布中", value: "2", disabled: true },
      ],
      placeholder: "请选择项目状态",
    },
  },
  {
    label: "考试费用",
    prop: "examFee",
    field: "examFee",
    type: "input-number",
    props: {
      min: 0,
    },
    span: 24,
    rules: [{ required: true, message: "请输入考试费用" }],
  },
  {
    label: "培训费用",
    prop: "trainingFee",
    field: "trainingFee",
    type: "input-number",
    props: {
      min: 0,
    },
    span: 24,
    rules: [{ required: true, message: "请输入培训费用" }],
  },
]);

const auditColumns: ColumnItem[] = reactive([
  {
    label: "审核状态",
    field: "auditStatus",
    type: "select",
    span: 24,
    required: true,
    props: {
      options: [
        { label: "不通过", value: "0" },
        { label: "通过", value: "2" },
      ],
      placeholder: "请选择审核状态",
    },
  },
]);

// 动态计算当前显示的列
const currentColumns = computed(() => {
  return isAudit.value ? auditColumns : columns;
});

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields();
  resetForm();
  isAudit.value = false;
};

// 核心判断：修改场景 + 考试等级为 1 或 2 → 只读
// 修改场景 + 考试等级为 1 / 2 → 只读
const isWeldingReadonly = computed(() => {
  return isUpdate.value && [0, 1, 2].includes(Number(form.projectLevel));
});
// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate();
    if (isInvalid) return false;
    if (isUpdate.value) {
      await updateProject(form, dataId.value);
      Message.success("修改成功");
      visible.value = false;
      emit("save-success");
    } else {
      await addProject(form);
      Message.success("新增成功");
      visible.value = false;
      emit("save-success");
    }
    return true;
  } catch (error) {
    return false;
  }
};

// 新增
const onAdd = async () => {
  reset();
  dataId.value = "";
  const res = await selectOptions([4]);
  categorySelect.value = res.data || [];
  visible.value = true;
};

// 修改
const onUpdate = async (id: string) => {
  reset();
  dataId.value = id;
  const res = await selectOptions([4]);
  categorySelect.value = res.data || [];

  const { data } = await getProject(id);
  data.projectStatus = String(data.projectStatus);
  data.categoryId = Number(data.categoryId);
  data.projectType = String(data.projectType);
  Object.assign(form, data);
  visible.value = true;
};

// 审核确认
const onAuditConfirm = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate();
    if (isInvalid) return false;

    await examine(dataId.value, {
      projectId: dataId.value,
      projectStatus: Number(form.auditStatus), // 转换为数字类型发送给后端
    });
    Message.success("审核成功");
    visible.value = false;
    emit("save-success");
    return true;
  } catch (error) {
    return false;
  }
};

// 审核
const onExamineA = async (id: string) => {
  reset();
  dataId.value = id;
  const res = await selectOptions([3, 4]);
  categorySelect.value = res.data || [];

  const { data } = await getProject(id);
  data.categoryId = Number(data.categoryId);
  Object.assign(form, data);
  isAudit.value = true;
  visible.value = true;
};

defineExpose({ onAdd, onUpdate, onExamineA });
</script>

<style scoped lang="scss"></style>