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
  planType: 1,
  invigilatorCount: 1,
  theoryClassroomId: [],
  operationClassroomId: []
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
      placeholder: "请选择理论考场",
      multiple: false,
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
    label: '考试人数上限',
    field: 'maxCandidates',
    required: true,
    type: 'InputNumber',
    span: 24,
    show: () => !isUpdate.value,
    rules: [{ required: true, message: '请输入考试人数' }],
    props: {
      placeholder: '请输入考试人数',
      min: 1,
      max: 999,
    },
  },
  {
    label: '监考员人数',
    field: 'invigilatorCount',
    required: true,
    type: 'InputNumber',
    span: 24,
    show: () => isUpdate.value,
    rules: [{ required: true, message: '请输入监考员人数' }],
    props: {
      placeholder: '请输入监考员人数',
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
const loading = ref(false);
const save = async () => {
  if (loading.value) return false;
  loading.value = true;

  try {
    // 表单实例校验
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false

    // 计算考场总数
    const theoryLen = 1;
    const operationLen = form.operationClassroomId?.length || 0;
    const totalClassroom = theoryLen + operationLen;

    // 核心修改：仅修改时校验是否选择考场（新增时跳过）
    if (isUpdate.value && totalClassroom === 0) {
      Message.error("请至少选择一个理论或实操考场");
      return false;
    }

    // 监考员人数校验：仅当有考场时才校验（新增/修改通用）
    const invigilatorCount = Number(form.invigilatorCount) || 0;
    if (totalClassroom > 0) { // 有考场时才校验人数
      if (invigilatorCount <= 0) {
        Message.error("监考员人数必须为正整数");
        return false;
      }
      if (invigilatorCount < totalClassroom) {
        Message.error(`需要至少${totalClassroom}名监考员（当前仅${invigilatorCount}名）`);
        return false;
      }
    }

    // 封装参数（兜底格式）
    const submitForm = {
      ...form,
      theoryClassroomId: Array.isArray(form.theoryClassroomId) ? form.theoryClassroomId : [form.theoryClassroomId],
      operationClassroomId: form.operationClassroomId || [],
      invigilatorCount: invigilatorCount
    };

    // 发送请求
    if (isUpdate.value) {
      await updateExamPlan(submitForm, dataId.value);
      Message.success("已确认");
    } else {
      submitForm.enrollList = [submitForm.enrollList[0].slice(0, 10) + " 09:00:00", submitForm.enrollList[1].slice(0, 10) + " 17:00:00"]
      submitForm.startTime = submitForm.startTime.slice(0, 10) + " 09:00:00"
      await customizAddExamPlan(submitForm);
      Message.success("新增成功");
    }

    emit("save-success");
    visible.value = false;
    return true;

  } catch (error) {
    return false;

  } finally {
    loading.value = false;
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
  } catch (error) {
  }
};

const getProjectList = async (planType: number) => {
  await getExamProjectOptions(planType);
};

// 新增
const onAdd = async () => {
  reset();
  visible.value = true;
  dataId.value = "";
  getProjectList(1);
};

// 修改
const onUpdate = async (id: string) => {
  reset();
  dataId.value = id;
  visible.value = true;

  try {
    // 1. 获取考试计划详情
    const { data: examPlanData } = await getExamPlan(id);
    // 2. 获取部门项目列表（父项目数组）
    await getExamProjectOptions(examPlanData.planType);
    const parentProjects = examProjectOptions.value;

    // 3. 核心：根据子项目ID（examProjectId）找对应的子项目+父项目
    const subProjectId = examPlanData.examProjectId; // 子项目ID（如81）
    let targetSubProject = null;
    let targetParentProject = null;
    // 遍历父项目数组，找包含当前子项目ID的父项
    for (const parent of parentProjects) {
      targetSubProject = parent.children?.find(
        (child: any) => child.value === subProjectId
      );
      if (targetSubProject) {
        targetParentProject = parent;
        break;
      }
    }

    // 容错：如果没找到子项目，提示并终止后续逻辑
    if (!targetSubProject) {
      console.warn(`未找到ID为${subProjectId}的子项目`);
      Object.assign(form, examPlanData);
      return;
    }

    // 4. 加载理论考场（用子项目ID）
    await getProjectClassRoomSelect(subProjectId, 0);
    columns.find((item) => item.field === "theoryClassroomId")!.show = true;

    // 5. 加载实操考场（如果子项目是实操类型）
    if (targetSubProject.isOperation === 1) {
      columns.find((item) => item.field === "operationClassroomId")!.show = true;
      await getProjectClassRoomSelect(subProjectId, 1);
    }

    // 6. 表单赋值
    form.enrollList = [examPlanData.enrollStartTime, examPlanData.enrollEndTime];
    Object.assign(form, examPlanData);

  } catch (e) {
    console.error("考试计划回显失败：", e);
  }
};
const mapRoomIdsToPaths = (roomIds: number[], options: any[]) => {
  const paths: number[][] = []
  roomIds.forEach(roomId => {
    options.forEach(building => {
      const child = building.children?.find((c: any) => c.value === roomId)
      if (child) {
        paths.push([building.value, child.value])
      }
    })
  })
  return paths
}
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
