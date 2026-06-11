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
    <GiForm ref="formRef" v-model="form" :columns="columns">
      <template #isTypeTest>
        <a-radio-group v-model="form.isTypeTest">
          <a-radio :value="0">否</a-radio>
          <a-radio :value="1">是</a-radio>
        </a-radio-group>
      </template>
    </GiForm>
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { useWindowSize } from "@vueuse/core";
import {
  getExamNotice,
  addExamNotice,
  updateExamNotice,
} from "@/apis/exam/examNotice";
import type { ColumnItem, GiForm } from "@/components/GiForm";
import { useResetReactive } from "@/hooks";
import { selectOptions } from "@/apis/exam/category";
import type { LabelValueState } from "@/types/global";
import { getProjectInspectionSelect } from "@/apis/exam/project";
import { watch } from "vue";
import dayjs from "dayjs";

const emit = defineEmits<{
  (e: "save-success"): void;
}>();

const { width } = useWindowSize();

const dataId = ref("");
const visible = ref(false);
const isUpdate = computed(() => !!dataId.value);
const title = computed(() =>
  isUpdate.value ? "修改检验人员考试通知" : "新增检验人员考试通知"
);
const formRef = ref<InstanceType<typeof GiForm>>();
const categorySelect = ref<LabelValueState[]>([]);
const projectOptions = ref<LabelValueState[]>([]);

const isEditing = ref(false);

const [form, resetForm] = useResetReactive({
  isTypeTest: 0,
  examLevel: 0,
  startTime: undefined as string | undefined,
  categoryId: undefined as string | undefined,
  applyDeadline: undefined as string | undefined,
  projectId: undefined as string | undefined,
});

const columns: ColumnItem[] = reactive([
  {
    label: "通知内容",
    field: "title",
    type: "textarea",
    props: {
      autoSize: true,
    },
    span: 24,
    rules: [{ required: true, message: "请输入通知内容" }],
  },
  {
    label: "报名截止时间",
    field: "applyDeadline",
    type: "date-picker",
    span: 24,
    props: {
      disabledDate: (current: Date) => {
        return current && current < dayjs().startOf("day").toDate();
      },
    },
    rules: [
      { required: true, message: "请输入报名截止时间" },
      {
        validator: (value: any, callback) => {
          if (value && dayjs(value).isBefore(dayjs().startOf("day"))) {
            callback("报名截止时间不能早于当前时间");
          } else {
            callback();
          }
        },
        trigger: "change",
      },
    ],
  },
  {
    label: "所属种类",
    field: "categoryId",
    type: "select",
    required: true,
    span: 24,
    props: {
      allowSearch: true,
      options: categorySelect,
    },
  },
  {
    label: "是否是型式试验通知",
    field: "isTypeTest",
    span: 24,
    rules: [{ required: true, message: "请选择考试等级" }],
  },
  {
    label: "考试项目",
    field: "projectId",
    type: "select",
    span: 24,
    props: {
      allowSearch: true,
      options: projectOptions,
    },
    show: () => {
      return !!form.categoryId && form.isTypeTest === 0;
    },
    rules: [{ required: true, message: "请选择考试项目" }],
  },
  {
    label: "考试时间",
    field: "startTime",
    type: "date-picker",
    span: 24,
    props: {
      showTime: true,
      format: "YYYY-MM-DD HH:mm",
      disabledDate: (current: Date) => {
        if (form.applyDeadline) {
          return current < new Date(form.applyDeadline);
        }
        return current < dayjs().startOf("day").toDate();
      },
    },
    rules: [
      { required: true, message: "请输入考试时间" },
      {
        validator: (value: any, callback) => {
          if (value && dayjs(value).isBefore(dayjs().startOf("day"))) {
            callback("考试时间不能早于当前时间");
          } else if (
            value &&
            form.applyDeadline &&
            dayjs(value).isBefore(dayjs(form.applyDeadline))
          ) {
            callback("考试时间不能早于报名截止时间");
          } else {
            callback();
          }
        },
        trigger: "change",
      },
    ],
  },
  {
    label: "说明",
    field: "remark",
    type: "textarea",
    props: {
      autoSize: true,
    },
    span: 24,
  },
]);

// 监听所属种类和是否是型式试验通知变化，获取考试项目列表
watch(
  [() => form.categoryId, () => form.isTypeTest],
  async ([newCategoryId, newIsTypeTest]) => {
    form.projectId = undefined;
    if (newCategoryId && newIsTypeTest !== undefined) {
      const { data } = await getProjectInspectionSelect(
        newCategoryId as string,
        newIsTypeTest as number
      );

      projectOptions.value = (data || []).map((item: any) => ({
        label: item.label,
        value: String(item.value),
      }));
    } else {
      projectOptions.value = [];
    }
  }
);

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields();
  formRef.value?.formRef?.clearValidate();
  resetForm();
  projectOptions.value = [];
  form.projectId = undefined;
};

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate();
    if (isInvalid) return false;

    // 准备提交数据
    const submitData: any = {
      ...form,
    };

    if (isUpdate.value) {
      await updateExamNotice(submitData, dataId.value);
      Message.success("修改成功");
    } else {
      await addExamNotice(submitData);
      Message.success("新增成功");
    }
    emit("save-success");
    return true;
  } catch (error) {
    return false;
  }
};

const initProjectSelect = async () => {
  const res = await selectOptions([4]);
  categorySelect.value = res.data || [];
};
// 新增
const onAdd = async () => {
  reset();
  dataId.value = "";
  visible.value = true;
  initProjectSelect();
};

// 修改
const onUpdate = async (id: string) => {
  reset();
  dataId.value = id;
  const { data } = await getExamNotice(id);

  Object.assign(form, data);

  if ((data as any).projectList && (data as any).projectList.length > 0) {
    form.projectId = String((data as any).projectList[0].projectId);
  } else {
    form.projectId = undefined;
  }

  initProjectSelect();
  visible.value = true;
};

defineExpose({ onAdd, onUpdate });
</script>

<style scoped lang="scss"></style>
