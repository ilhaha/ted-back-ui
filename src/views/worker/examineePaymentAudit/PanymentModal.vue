<template>
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="handleClose">
    <GiForm ref="formRef" v-model="form" :columns="columns.filter((c) => !c.hidden)" />
  </a-modal>
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { useWindowSize } from "@vueuse/core";
import { reactive, ref, computed, watch } from "vue";
import { reviewPayment } from "@/apis/exam/examineePaymentAudit";
import { type ColumnItem, GiForm } from "@/components/GiForm";
import { useResetReactive } from "@/hooks";

//  审核状态常量
const AUDIT_STATUS = {
  PASSED: 2, // 审核通过
  REJECTED: 3, // 补正
} as const;

// 状态选项
const statusOptions = [
  { label: "审核通过", value: AUDIT_STATUS.PASSED },
  { label: "补正", value: AUDIT_STATUS.REJECTED },
];

const emit = defineEmits<{ (e: "save-success"): void }>();
const { width } = useWindowSize();

// ------------ 关键 data 和 ref 提前放置确保正常访问 ---------------
const dataId = ref("");
const examineeId = ref<string | undefined>();
const examPlanId = ref<string | undefined>();
const visible = ref(false);

// 是否为审核模式，根据 dataId 判断
const isExamine = computed(() => !!dataId.value);
const title = computed(() =>
  isExamine.value ? "审核缴费资料" : "新增缴费资料"
);

const formRef = ref<InstanceType<typeof GiForm>>();

// 表单状态
const [form, resetForm] = useResetReactive({
  auditStatus: undefined,
  rejectReason: "",
});

// 表单列
const columns: ColumnItem[] = reactive([
  {
    label: "审核状态",
    field: "auditStatus",
    type: "select",
    span: 24,
    props: { options: statusOptions },
    rules: [
      { required: true, message: "请选择审核状态", trigger: "change" },
    ],
  },
  {
    label: "审核备注",
    field: "rejectReason",
    type: "textarea",
    span: 24,
    hidden: true,
    props: {
      placeholder: "请输入审核备注",
      autoSize: { minRows: 2, maxRows: 5 },
    },
    rules: [
      { required: true, message: "请输入审核备注", trigger: "change" },
    ],
  },
]);

// 监听审核状态，控制备注框显示隐藏
watch(
  () => form.auditStatus,
  (val) => {
    const remarkField = columns.find((c) => c.field === "rejectReason");
    if (!remarkField) return;

    if (val === AUDIT_STATUS.REJECTED) {
      remarkField.hidden = false;
    } else {
      remarkField.hidden = true;
      form.rejectReason = "";
    }
  },
  { immediate: true }
);

// 重置及关闭弹窗
const handleClose = () => {
  formRef.value?.formRef?.resetFields();
  resetForm();
  const remarkField = columns.find((c) => c.field === "rejectReason");
  if (remarkField) remarkField.hidden = true;
  visible.value = false;
};

// 保存审核结果
const save = async () => {
  const isInvalid = await formRef.value?.formRef?.validate()
  if (isInvalid) return false
  const payload = {
    id: dataId.value,
    examineeId: examineeId.value,
    examPlanId: examPlanId.value,
    auditStatus: form.auditStatus,
    rejectReason: form.rejectReason,
  };
  try {
    await reviewPayment(payload);
    Message.success("审核成功");
    emit("save-success");
    handleClose();
  } catch (error) {
    handleClose();
  }
};

// 打开审核弹窗
const onExamine = (id: string, examineeIdParam: string, examPlanIdParam: string) => {
  dataId.value = id
  examineeId.value = examineeIdParam
  examPlanId.value = examPlanIdParam

  form.rejectReason = ''
  visible.value = true
}

// 暴露方法给父组件
defineExpose({ onExamine })

</script>
