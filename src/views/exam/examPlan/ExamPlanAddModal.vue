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
import { usePlan, useProject, useResetReactive } from "@/hooks";
import { bindingDocumentListApi } from "@/apis/exam/project";
import { upload } from "@/apis/common/carousel";
import { useUserStore } from "@/stores";

const userStore = useUserStore();

const emit = defineEmits(["save-success", "update-reviewer"]);

const { width } = useWindowSize();

const dataId = ref("");
const visible = ref(false);
const isUpdate = computed(() => !!dataId.value);
const title = computed(() =>
  isUpdate.value ? "确认考试计划地点时间" : "新增考试计划"
);
const formRef = ref<InstanceType<typeof GiForm>>();
const { deptProjectsList, getDeptProjectsList } = usePlan();
const {
  locationSelectList,
  getProjectLocationSelect,
  classRoomSelectList,
  getProjectClassRoomSelect,
} = useProject();

const [form, resetForm] = useResetReactive({
  examProjectId: "",
  // locationId: '',
  maxCandidates: 0,
  // dateRange: '',
  imageUrl: "",
  examPlanName: "",
  enrollList: "",
  classroomId: [],
  examType: undefined,
  planType: 0,
  invigilatorCount: 1
});

const projectBindingDocList = ref([]);



// 监听新增 删除串口是否打开
watch(
  () => visible.value,
  async (newProvinceId) => {
    if (newProvinceId === true) await getDeptProjectsList();
  },
  { immediate: false }
);

watch(
  () => form.examProjectId,
  async (newExamProjectId) => {
    if (!newExamProjectId) {
      form.classroomId = [];
      return
    };

    const response = await bindingDocumentListApi(form.examProjectId);
    projectBindingDocList.value = response.data.map((doc: any) => ({
      value: doc.id,
      label: doc.typeName,
    }));

    // 只有新增或者切换考试项目时才重置
    if (!isUpdate.value) {
      form.classroomId = [];
    }
  },
  { immediate: false }
);

watch(
  () => form.examProjectId,
  async (newExamProjectId) => {
    if (!newExamProjectId) return;

    await getProjectClassRoomSelect(newExamProjectId);

    // 只有新增或者切换考试项目时才重置
    if (!isUpdate.value) {
      form.classroomId = [];
    }

    columns.find((item) => item.field === "classroomId")!.show = true;
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
      disabled: isUpdate.value, // 修改时禁用
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
      disabled: isUpdate.value, // 修改时禁用
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
    label: '考试人员类型',
    field: 'planType',
    type: 'select',
    span: 22,
    props: computed(() => ({
      allowSearch: false,
      allowClear: false,
      multiple: false,
      disabled: isUpdate.value,
      options: [
        { label: '作业人员', value: 0 },
        { label: '检验人员', value: 1 }
      ],
      fieldNames: { label: 'label', value: 'value' }
    })),
    rules: [{ required: true, message: '请选考试人员类型' }]
  },
  {
    label: "考试考场",
    prop: "classroomId",
    field: "classroomId",
    type: "cascader",
    required: true,
    show: false,
    span: 22,
    props: {
      options: classRoomSelectList,
      allowSearch: true,
      placeholder: "请选择地点考场（可多选）",
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
    span: 22,
    props: computed(() => ({
      disabled: isUpdate.value,
      showTime: isUpdate.value ? { format: "HH:mm:ss" } : false,
      format: isUpdate.value ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD",
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
      format: isUpdate.value ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD",
      valueFormat: "YYYY-MM-DD HH:mm:ss", // 统一传递带时间的格式，新增时默认00:00:00
      placeholder: isUpdate.value ? "请选择日期时间" : "请选择日期",
    })),
  },
  {
    label: '监考员人数',
    field: 'invigilatorCount',
    required: true,
    type: 'InputNumber',
    span: 22,
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
};

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate();
    if (isInvalid) return false;

    // 确保考场选择不为空
    if (form.classroomId.length === 0) {
      Message.error("请选择地点考场");
      return false;
    }

    if (isUpdate.value) {
      if (form.invigilatorCount < form.classroomId.length) {
        Message.error("所设置的监考员人数不足以分配到全部考场");
        return false;
      }
      await updateExamPlan(form, dataId.value);
      // await updateExamPlanClassroom(form.classroomId, dataId.value);
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
      emit("update-reviewer", {
        planId: dataId.value,
        reviewer: userStore.nickname,
      });
      emit("save-success");
      Message.success("审核成功");
      visible.value = false;
    } else {
      Message.error(response.message || "审核失败");
    }
  } catch (error) {
  }
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
  const { data } = await getExamPlan(id);
  console.log(data.classroomId, 11111);

  data.examType = String(data.examType);
  // 加载关联的项目数据
  // await getDeptProjectsList();
  // await getProjectLocationSelect(data.examProjectId);
  // await getProjectClassRoomSelect(data.examProjectId);
  form.classroomId = mapRoomIdsToPaths(data.classroomId, classRoomSelectList.value)
  form.enrollList = [data.enrollStartTime, data.enrollEndTime];
  Object.assign(form, data);
  visible.value = true;
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
