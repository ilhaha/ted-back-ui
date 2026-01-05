<template>
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { useWindowSize } from "@vueuse/core";
import {
  getPersonQualification,
  addPersonQualification,
  updatePersonQualification,
} from "@/apis/exam/personQualification";
import { type ColumnItem, GiForm } from "@/components/GiForm";
import { useResetReactive } from "@/hooks";
import { encryptByRsa } from "@/utils/encrypt";
import { useDict } from "@/hooks/app";

const emit = defineEmits<{
  (e: "save-success"): void;
}>();

const { width } = useWindowSize();

const dataId = ref("");
const visible = ref(false);
const isUpdate = computed(() => !!dataId.value);
const title = computed(() =>
  isUpdate.value ? "修改人员复审信息" : "新增人员复审信息"
);
const formRef = ref<InstanceType<typeof GiForm>>();
const categoryDisabled = computed(() => {
  return isUpdate.value;
});
const [form, resetForm] = useResetReactive({
  name: "",
  idCard: "",
  education: "",
  phone: "",
  employer: "",
  qualificationCategoryCode: "",
});

// 教育程度选项
const educationOptions = ref([
  { label: "无", value: "无" },
  { label: "小学", value: "小学" },
  { label: "初中", value: "初中" },
  { label: "高中", value: "高中" },
  { label: "大专", value: "大专" },
  { label: "本科", value: "本科" },
  { label: "硕士", value: "硕士" },
  { label: "博士", value: "博士" },
]);

// 表单字段配置
const columns: ColumnItem[] = reactive([
  {
    label: "姓名",
    field: "name",
    type: "input",
    span: 24,
    rules: [{ required: true, message: "请输入姓名" }],
    props: {
      disabled: categoryDisabled,
    },
  },
  {
    label: "身份证号",
    field: "idCard",
    type: "input",
    span: 24,
    rules: [
      { required: true, message: "请输入身份证号" },
      {
        pattern: /(^\d{15}$)|(^\d{17}(\d|X)$)/,
        message: "请输入正确的身份证号"
      },
    ],
    props: {
      maxlength: 18,
      placeholder: "请输入身份证号",
      disabled: categoryDisabled,
      onInput: (val: string) => {
        form.idCard = val.toUpperCase().replace(/[^0-9X]/g, "");
      },
    },
  },
  {
    label: "文化程度",
    field: "education",
    type: "select",
    span: 24,
    rules: [{ required: true, message: "请选择文化程度" }],
    props: {
      options: educationOptions.value,
      placeholder: "请选择文化程度",
      allowClear: true,
    },
  },
  {
    label: "联系电话",
    field: "phone",
    type: "input",
    span: 24,
    rules: [
      { required: true, message: "请输入联系电话" },
      { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号" },
    ],
    props: {
      maxlength: 11,
      placeholder: "请输入联系电话",
      onInput: (val: string) => {
        form.phone = val.replace(/\D/g, ""); // 实时限制只允许数字
      },
    },
  },
  {
    label: "聘用单位",
    field: "employer",
    type: "input",
    span: 24,
    rules: [{ required: true, message: "请输入聘用单位" }],
  },
  {
    label: "资格项目代码",
    field: "qualificationCategoryCode",
    type: "input",
    span: 24,
    rules: [{ required: true, message: "请输入资格项目代码" }],
    props: {
      disabled: categoryDisabled,
    },
  },
]);
// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields();
  resetForm();
};

// 保存
const save = async () => {
  let idCardBack = "";
  try {
    const isInvalid = await formRef.value?.formRef?.validate();
    if (isInvalid) return false;

    if (!validateExtra()) return false;

    idCardBack = form.idCard;
    form.idCard = encryptByRsa(form.idCard);

    if (isUpdate.value) {
      await updatePersonQualification(form, dataId.value);
      Message.success("修改成功");
    } else {
      await addPersonQualification(form);
      Message.success("新增成功");
    }
    emit("save-success");
    return true;
  } catch (error) {
    form.idCard = idCardBack;
    return false;
  } finally {

  }
};


const validateExtra = () => {
  if (!/(^\d{15}$)|(^\d{17}(\d|X)$)/.test(form.idCard)) {
    Message.error("身份证号格式不正确");
    return false;
  }
  if (!/^1[3-9]\d{9}$/.test(form.phone)) {
    Message.error("手机号格式不正确");
    return false;
  }
  return true;
};


// 新增
const onAdd = async () => {
  reset();
  dataId.value = "";
  visible.value = true;
};

// 修改
const onUpdate = async (id: string) => {
  reset();
  dataId.value = id;
  const { data } = await getPersonQualification(id);
  Object.assign(form, data);
  visible.value = true;
};

defineExpose({ onAdd, onUpdate });
</script>

<style scoped lang="scss"></style>
