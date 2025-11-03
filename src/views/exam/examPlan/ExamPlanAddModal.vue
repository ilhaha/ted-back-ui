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
  classroomId: [], // 初始化为空数组，用于存储多选结果
  examType: undefined,
});

const projectBindingDocList = ref([]);

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
// watch(
//   () => form.locationId,
//   (val) => {
//     const examTypeField = columns.find(item => item.field === 'examType')
//     examTypeField!.show = !!val
//     if (!val) {
//       form.examType = null
//       form.classroomId = []
//       columns.find(item => item.field === 'classroomId')!.show = false
//     }
//   }
// )

// watch(
//   () => form.examType,
//   (val) => {
//     const classroomField = columns.find(item => item.field === 'classroomId')
//     classroomField!.show = !!val // 选了考试类型 → 显示地点考场
//     if (!val) {
//       form.classroomId = []
//     }
//   }
// )

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
  async (newProvinceId) => {
    if (newProvinceId !== "") {
      const response = await bindingDocumentListApi(form.examProjectId);
      projectBindingDocList.value = response.data.map((doc: any) => ({
        value: doc.id,
        label: doc.typeName,
      }));
      // 重置地点和考场选择
      // form.locationId = ''
      form.classroomId = [];
    }
  },
  { immediate: false }
);

watch(
  () => [form.examProjectId],
  async ([newexamProjectId]) => {
    if (newexamProjectId) {
      await getProjectClassRoomSelect(newexamProjectId);
      form.classroomId = [];
      columns.find((item) => item.field === "classroomId")!.show = true;
    }
  },
  { immediate: false }
);

const columns: ColumnItem[] = reactive([
  // {
  //   label: '计划展示图',
  //   field: 'imageUrl',
  //   type: 'upload',
  //   span: 24,
  //   props: {
  //     accept: 'image/*',
  //     limit: 1,
  //     showFileList: true,
  //     listType: 'picture-card',
  //     customRequest: handleUpload,
  //     fileList: computed(() => {
  //       if (form.imageUrl) {
  //         return [{
  //           uid: '-1',
  //           name: '已上传图片',
  //           url: form.imageUrl,
  //           status: 'done',
  //         }]
  //       }
  //       return []
  //     }),
  //     onChange: (fileList: any) => {
  //       if (fileList.length === 0) {
  //         form.imageUrl = ''
  //       }
  //     },
  //   },
  //   required: true,
  // },
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
  // {
  //   label: '考试地点',
  //   prop: 'locationId',
  //   type: 'select',
  //   field: 'locationId',
  //   required: true,
  //   span: 22,
  //   props: {
  //     options: locationSelectList,
  //     allowSearch: true,
  //   },
  // },
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

  // {
  //   label: '最大考试人数',
  //   prop: 'maxCandidates',
  //   type: 'input-number',
  //   field: 'maxCandidates',
  //   required: true,
  //   span: 22,
  // },
  //   {
  //   label: '考试报名时间范围',
  //   prop: 'enrollList',
  //   type: 'range-picker',
  //   field: 'enrollList',
  //   required: true,
  //   span: 22,
  // },
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

  // {
  //   label: '考试时间范围',
  //   prop: 'dateRange',
  //   type: 'range-picker',
  //   field: 'dateRange',
  //   required: true,
  //   span: 22,
  // },

{
  label: "考试报名时间",
  prop: "enrollList",
  type: "range-picker",
  field: "enrollList",
  required: true,
  span: 22,
  props: computed(() => ({
    showTime: isUpdate.value ? { format: "HH:mm:ss" } : false,
    format: isUpdate.value ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD",
    valueFormat: "YYYY-MM-DD HH:mm:ss", // 统一传递带时间的格式，新增时默认00:00:00
    placeholder: isUpdate.value ? "请选择日期时间范围" : "请选择日期范围",
  })),
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
      await updateExamPlan(form, dataId.value);
      await updateExamPlanClassroom(form.classroomId, dataId.value);
      Message.success("修改成功");
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
    console.error("审核失败:", error);
    Message.error("审核失败，请稍后重试");
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
  data.examType = String(data.examType);
  // 加载关联的项目数据
  await getDeptProjectsList();
  await getProjectLocationSelect(data.examProjectId);
  await getProjectClassRoomSelect(data.examProjectId);

  const res = await getExamClassroom(id);
  form.classroomId = res.data;

  form.enrollList = [data.enrollStartTime, data.enrollEndTime];
  // form.dateRange = [data.startTime, data.endTime]
  Object.assign(form, data);
  visible.value = true;
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
