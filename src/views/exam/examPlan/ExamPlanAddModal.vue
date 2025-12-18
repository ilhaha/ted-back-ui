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
    <GiForm ref="formRef" v-model="form" :columns="currentColumns" />
    <template #footer>
      <a-button v-if="isAudit" type="primary" @click="onAuditConfirm"
        >确认审核</a-button
      >
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { useWindowSize } from "@vueuse/core";
import {
  customizAddExamPlan,
  getExamPlan,
  getExamPlanId,
  getExamPlanvalid,
  updateExamPlan,
  updateExamPlanClassroom,
  getExamClassroom,
} from "@/apis/exam/examPlan";
import { type ColumnItem, GiForm } from "@/components/GiForm";
import { useExamPlanProject, useProject, useResetReactive } from "@/hooks";
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
  isUpdate.value ? "确认考试计划地点时间" : "新增考试计划"
);
const formRef = ref<InstanceType<typeof GiForm>>();
const { examProjectOptions, getExamProjectOptions } = useExamPlanProject();

const {
  locationSelectList,
  getProjectLocationSelect,
  theoryClassRoomSelectList,
  operationClassRoomSelectList,
  getProjectClassRoomSelect,
} = useProject();

const [form, resetForm] = useResetReactive({
  examProjectId: "",
  // locationId: '',
  maxCandidates: 1,
  // dateRange: '',
  imageUrl: "",
  examPlanName: "",
  enrollList: "",
  // classroomId: [],
  examType: undefined,
  planType: 0,
  invigilatorCount: 1,
  theoryClassroomId: [],
  operationClassroomId: [],
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
    span: 24,
    props: computed(() => ({
      allowSearch: true,
      disabled: isUpdate.value,
    })),
  },
  {
    label: "考试项目",
    field: "examProjectId",
    type: "cascader",
    required: true,
    span: 24,
    props: computed(() => ({
      options: examProjectOptions.value,
      allowSearch: true,
      disabled: isUpdate.value,
    })),
  },
  {
    label: "考试所需资料(仅展示)",
    field: "documents",
    type: "checkbox-group",
    span: 24,
    props: {
      options: projectBindingDocList,
      multiple: true,
      allowClear: true,
      allowSearch: true,
      disabled: true,
    },
  },
  {
    label: "理论考场",
    prop: "theoryClassroomId",
    field: "theoryClassroomId",
    type: "cascader",
    required: true,
    show: false,
    span: 24,
    props: {
      options: theoryClassRoomSelectList,
      allowSearch: true,
      placeholder: "请选择理论考场（可多选）",
      multiple: true,
      virtualListProps: {
        height: 200,
        threshold: 30,
      },
    },
  },

  {
    label: "实操考场",
    prop: "operationClassroomId",
    field: "operationClassroomId",
    type: "cascader",
    required: true,
    show: false,
    span: 24,
    props: {
      options: operationClassRoomSelectList,
      allowSearch: true,
      placeholder: "请选择实操考场（可多选）",
      multiple: true,
      virtualListProps: {
        height: 200,
        threshold: 30,
      },
    },
  },

  {
    label: "考试报名时间",
    prop: "enrollList",
    type: "range-picker",
    field: "enrollList",
    required: true,
    span: 24,
    props: computed(() => ({
      disabled: isUpdate.value,
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
    span: 24,
    props: computed(() => ({
      showTime: isUpdate.value, // 修改时显示时间选择，新增时仅显示日期
      format: isUpdate.value ? "YYYY-MM-DD HH:mm" : "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD HH:mm:ss", // 统一传递带时间的格式，新增时默认00:00:00
      placeholder: isUpdate.value ? "请选择日期时间" : "请选择日期",
    })),
  },
  {
    label: "考试人数上限",
    field: "maxCandidates",
    required: true,
    type: "InputNumber",
    span: 24,
    show: () => !isUpdate.value,
    rules: [{ required: true, message: "请输入考试人数" }],
    props: {
      placeholder: "请输入考试人数",
      min: 1,
      max: 999,
    },
  },
  {
    label: "监考员人数",
    field: "invigilatorCount",
    required: true,
    type: "InputNumber",
    span: 24,
    show: () => isUpdate.value,
    rules: [{ required: true, message: "请输入监考员人数" }],
    props: {
      placeholder: "请输入监考员人数",
      min: 1,
      max: 10,
    },
  },
]);

const auditColumns: ColumnItem[] = reactive([
  {
    label: "审核状态",
    prop: "status",
    field: "statusa",
    type: "select",
    span: 24,
    rules: [{ required: true, message: "请选择审核状态" }],
    props: {
      options: [
        { label: "未通过", value: 0 },
        { label: "已通过", value: 1 },
      ],
      allowSearch: true,
    },
  },
]);

// 动态计算当前显示的列
const currentColumns = computed(() => {
  // eslint-disable-next-line ts/no-use-before-define
  return isAudit.value ? auditColumns : columns;
});

const isAudit = ref(false);

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields();
  resetForm();
  isAudit.value = false;
  columns.find((item) => item.field === "theoryClassroomId")!.show = false;
  columns.find((item) => item.field === "operationClassroomId")!.show = false;
};

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate();
    if (isInvalid) return false;

    if (isUpdate.value) {
      if (
        form.invigilatorCount <
        form.theoryClassroomId.length + form.operationClassroomId.length
      ) {
        Message.error("所设置的监考员人数不足以分配到全部考场");
        return false;
      }
      await updateExamPlan(form, dataId.value);
      Message.success("已确认");
    } else {
      await customizAddExamPlan(form);
      Message.success("新增成功");
    }
    emit("save-success");
    return true;
  } catch (error) {
    return false;
  }
};

const onAuditConfirm = async () => {
  try {
    if (form.status === undefined || form.status === null) {
      Message.error("请选择审核状态");
      return;
    }
    const response = await getExamPlanvalid(dataId.value, form.statusa);
    if (response.success) {
      emit("save-success");
      Message.success("审核成功");
      visible.value = false;
    } else {
      Message.error(response.message || "审核失败");
    }
  } catch (error) {}
};

const getProjectList = async (planType: number) => {
  await getExamProjectOptions(planType);
};

// 新增
const onAdd = async () => {
  reset();
  visible.value = true;
  dataId.value = "";
  getProjectList(0);
};
// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  visible.value = true

  const { data } = await getExamPlan(id)

  await getExamProjectOptions(data.planType)

  const [projectId, subProjectId] = data.examProjectId

  const project = examProjectOptions.value.find(p => p.value === projectId)
  const subProject = project?.children?.find(c => c.value === subProjectId)

  // 理论考场
  await getProjectClassRoomSelect(subProjectId, 0)

  // 实操考场
  if (subProject?.isOperation === 1) {
    await getProjectClassRoomSelect(subProjectId, 1)
  }

  Object.assign(form, data)
}

const mapRoomIdsToPaths = (roomIds: number[], options: any[]) => {
  const paths: number[][] = [];
  roomIds.forEach((roomId) => {
    options.forEach((building) => {
      const child = building.children?.find((c: any) => c.value === roomId);
      if (child) {
        paths.push([building.value, child.value]);
      }
    });
  });
  return paths;
};
// 审核
const onExamineA = async (id: string) => {
  reset();
  dataId.value = id;
  const { data } = await getExamPlanId(id);
  Object.assign(form, data);
  isAudit.value = true;
  visible.value = true;
};

defineExpose({ onAdd, onUpdate, onExamineA });
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
