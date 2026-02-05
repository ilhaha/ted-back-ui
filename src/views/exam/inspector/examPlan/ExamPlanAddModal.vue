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
import { computed, ref, reactive, watch } from "vue"; // 补充 reactive 导入（你原有代码已用，此处确认）
import { Message } from "@arco-design/web-vue";
import { useWindowSize } from "@vueuse/core";
import {
  customizAddExamPlan,
  getExamPlan,
  getExamPlanId,
  getExamPlanvalid,
  updateExamPlan,
  inspectorUpdate,
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
  async (val) => {
    if (!val) return;

    // ⭐ 只取最后一级ID
    const projectId = Array.isArray(val) ? val.at(-1) : val;

    const response = await bindingDocumentListApi(projectId);

    projectBindingDocList.value = response.data.map((doc: any) => ({
      value: doc.id,
      label: doc.typeName,
    }));
  }
);

// ====================================== 关键修改 1：定义响应式变量控制显示 ======================================
const hasTheory = ref(false); // false=隐藏（对应0），true=显示（对应1）
const hasOper = ref(false); // false=隐藏（对应0），true=显示（对应1）

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
    // ====================================== 关键修改 2：关联 hasTheory 响应式变量 ======================================
    show: () => hasTheory.value, // 直接关联响应式变量，1=显示（true），0=隐藏（false）
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
    // ====================================== 关键修改 3：关联 hasOper 响应式变量 ======================================
    show: () => hasOper.value, // 直接关联响应式变量，1=显示（true），0=隐藏（false）
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
    label: "准考证下载截至时间",
    prop: "admitCardEndTime",
    field: "admitCardEndTime",
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
  return isAudit.value ? auditColumns : columns;
});

const isAudit = ref(false);

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields();
  resetForm();
  isAudit.value = false;
  // ====================================== 关键修改 4：重置时还原隐藏状态 ======================================
  hasTheory.value = false;
  hasOper.value = false;
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
    const theoryLen = hasTheory.value ? 1 : 0; // 优化：基于 hasTheory 判断是否计入理论考场
    const operationLen = hasOper.value ? (form.operationClassroomId?.length || 0) : 0; // 优化：基于 hasOper 判断是否计入实操考场
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
      await inspectorUpdate(submitForm, dataId.value);
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

// ⭐ 根据 value 找 cascader 路径（支持任意层级/虚拟节点）
const findPath = (value: number | string, options: any[]): any[] | null => {
  for (const item of options) {
    if (item.value === value) return [item.value];

    if (item.children?.length) {
      const childPath = findPath(value, item.children);
      if (childPath) return [item.value, ...childPath];
    }
  }
  return null;
};

// 修改
const onUpdate = async (id: string) => {
  reset(); // 先重置，还原初始状态
  dataId.value = id;
  visible.value = true;

  try {
    // ====================================== 关键修改 5：异步获取 examPlanData 后，提取 hasTheory/hasOper ======================================
    const { data: examPlanData } = await getExamPlan(id); // 异步请求完成，获取数据

    // 1. 提取 hasTheory 和 hasOper（0=隐藏→false，1=显示→true），兼容字段不存在的兜底
    hasTheory.value = examPlanData.hasTheory === 1;
    hasOper.value = examPlanData.hasOper === 1;

    await getExamProjectOptions(examPlanData.planType);

    const subProjectId = examPlanData.examProjectId;

    // ⭐ 递归找完整路径（支持虚拟节点）
    const path = findPath(subProjectId, examProjectOptions.value);

    if (path) {
      form.examProjectId = path; // cascader 回显必须是路径数组
    } else {
      console.warn("未匹配到树路径，直接使用原ID");
      form.examProjectId = subProjectId;
    }

    // 加载考场选项（按需加载，不影响显示控制）
    if (hasTheory.value) { // 仅当需要显示理论考场时，加载理论考场选项
      await getProjectClassRoomSelect(subProjectId, 0);
    }
    if (hasOper.value) { // 仅当需要显示实操考场时，加载实操考场选项
      await getProjectClassRoomSelect(subProjectId, 1);
    }

    // ⭐ 统一赋值顺序（非常重要）
    Object.assign(form, examPlanData);

    form.enrollList = [
      examPlanData.enrollStartTime,
      examPlanData.enrollEndTime
    ];

    form.startTime = examPlanData.startTime;

  } catch (e) {
    console.error("考试计划回显失败：", e);
    // 异常时还原隐藏状态，避免残留显示
    hasTheory.value = false;
    hasOper.value = false;
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