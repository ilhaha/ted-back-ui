<template>
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { useWindowSize } from "@vueuse/core";
import {
  getExamPlan,
  adjustPlanTimeApi
} from "@/apis/exam/examPlan";
import { type ColumnItem, GiForm } from "@/components/GiForm";
import { usePlan, useProject, useResetReactive } from "@/hooks";
import { bindingDocumentListApi } from "@/apis/exam/project";
import { upload } from "@/apis/common/carousel";
import { useUserStore } from "@/stores";

const userStore = useUserStore();

const emit = defineEmits(["save-success"]);

const { width } = useWindowSize();

const dataId = ref("");
const visible = ref(false);
const isUpdate = computed(() => !!dataId.value);
const title = computed(() =>
  isUpdate.value ? "调整考试/报名时间" : "新增考试计划"
);
const formRef = ref<InstanceType<typeof GiForm>>();
const { deptProjectsList, getDeptProjectsList } = usePlan();

const [form, resetForm] = useResetReactive({
  enrollList: "",
  startTime: 0,
});

const projectBindingDocList = ref([]);



// 监听新增 删除串口是否打开
watch(
  () => form.examProjectId,
  async (newExamProjectId) => {
    if (!newExamProjectId) {
      return;
    }
    const response = await bindingDocumentListApi(newExamProjectId);
    projectBindingDocList.value = response.data.map((doc: any) => ({
      value: doc.id,
      label: doc.typeName,
    }));

  },
  { immediate: false }
);


const columns: ColumnItem[] = reactive([
  {
    label: "计划名称",
    prop: "examPlanName",
    type: "input",
    field: "examPlanName",
    required: true,
    span: 22,
    props: computed(() => ({
      allowSearch: true,
      disabled: isUpdate.value,
    })),
  },
  {
    label: "考试项目",
    prop: "examProjectId",
    type: "select",
    field: "examProjectId",
    required: true,
    span: 22,
    props: computed(() => ({
      options: deptProjectsList,
      allowSearch: true,
      disabled: isUpdate.value,
    })),
  },
  {
    label: "考试所需资料(仅展示)",
    field: "documents",
    type: "checkbox-group",
    span: 22,
    props: {
      options: projectBindingDocList,
      multiple: true,
      allowClear: true,
      allowSearch: true,
      disabled: true,
    },
  },
  {
    label: "考试报名时间",
    prop: "enrollList",
    type: "range-picker",
    field: "enrollList",
    required: true,
    span: 22,
    props: computed(() => ({
      showTime: isUpdate.value ? { format: "HH:mm:ss" } : false,
      format: isUpdate.value ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD HH:mm:ss", // 统一传递带时间的格式，新增时默认00:00:00
      placeholder: isUpdate.value ? "请选择日期时间范围" : "请选择日期范围",
    })),
  },
  {
    label: "考试开始时间",
    prop: "startTime",
    field: "startTime",
    type: "date-picker",
    required: true,
    span: 22,
    props: computed(() => ({
      showTime: isUpdate.value, // 修改时显示时间选择，新增时仅显示日期
      format: isUpdate.value ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD HH:mm:ss", // 统一传递带时间的格式，新增时默认00:00:00
      placeholder: isUpdate.value ? "请选择日期时间" : "请选择日期",
    })),
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
      await adjustPlanTimeApi(form, dataId.value);
      Message.success("已调整");
    }
    emit("save-success");
    return true;
  } catch (error) {
    return false;
  }
};


const getProjectList = async (planType: number) => {
  await getDeptProjectsList(planType)
}

// 修改
const onUpdate = async (id: string) => {
  reset();
  dataId.value = id;
  visible.value = true;
  const { data } = await getExamPlan(id);
  await getDeptProjectsList(data.planType)
  // 加载关联的项目数据
  form.enrollList = [data.enrollStartTime, data.enrollEndTime];
  Object.assign(form, data);
};

defineExpose({ onUpdate });
</script>

<style scoped lang="scss">
/* Hide hover icons for the checkbox and icons in their disabled state */
.arco-icon-hover,
.arco-icon-hover-disabled,
.arco-checkbox-icon-hover {
  display: none !important;
  /* Ensure these styles are applied with higher priority */
}
</style>
