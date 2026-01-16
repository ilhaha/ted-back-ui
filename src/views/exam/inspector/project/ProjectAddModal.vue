<template>
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="currentColumns" />
    <template #footer>
      <a-button v-if="isAudit" type="primary" @click="onAuditConfirm">确认审核</a-button>
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
  imageUrl: "",
  auditStatus: "2",
  projectStatus: "",
  categoryId: undefined,
  projectType: 1,
  isOperation: 0,
});

// 上传图片
const handleUpload = (options: RequestOption) => {
  const controller = new AbortController();
  (async function requestWrap() {
    const { onProgress, onError, onSuccess, fileItem, name = "file" } = options;
    onProgress(20);
    const formData = new FormData();
    formData.append(name as string, fileItem.file as Blob);
    formData.append("type", "pic");
    try {
      const res = await upload(formData, {
        signal: controller.signal,
      });
      Message.success("上传成功");
      form.imageUrl = res.data.url;
      onSuccess(res.data.thUrl);
    } catch (error) {
      onError(error);
    }
  })();
  return {
    abort() {
      controller.abort();
    },
  };
};

const categorySelect = ref<LabelValueState[]>([]);
//计算属性，判断所属八大类是否禁用
// const categoryDisabled = computed(() => {
//   return isUpdate.value && form.projectStatus === "2";
// });
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
    label: "考试时长（分钟）",
    prop: "examDuration",
    field: "examDuration",
    type: "input-number",
    required: true,
    span: 24,
  },
  {
    label: "所属八大类",
    prop: "categoryId",
    field: "categoryId",
    type: "select",
    required: true,
    span: 24,
    props: {
      allowSearch: true,
      options: categorySelect,
      // disabled: categoryDisabled,
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
        { label: "无", value: 0 },
        { label: "有", value: 1 },
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
    label: "收费标准（元）",
    prop: "examFee",
    field: "examFee",
    type: "input-number",
    required: true,
    span: 24,
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
  const res = await selectOptions(1);
  categorySelect.value = res.data || [];
  visible.value = true;
};

// 修改
const onUpdate = async (id: string) => {
  reset();
  dataId.value = id;
  const res = await selectOptions(1);
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
    Message.error("审核失败");
    return false;
  }
};

// 审核
const onExamineA = async (id: string) => {
  reset();
  dataId.value = id;
  const res = await selectOptions(1);
  categorySelect.value = res.data || [];

  const { data } = await getProject(id);
  Object.assign(form, data);
  isAudit.value = true;
  visible.value = true;
};

defineExpose({ onAdd, onUpdate, onExamineA });
</script>

<style scoped lang="scss"></style>