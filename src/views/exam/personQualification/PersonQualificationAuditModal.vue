<template>
  <a-modal
    v-model:visible="visible"
    title="复审审核"
    :mask-closable="false"
    @ok="onSubmit"
  >
    <a-form :model="form">
      <a-form-item label="审核结果">
        <a-radio-group v-model="form.auditStatus">
          <a-radio :value="1">通过</a-radio>
          <!-- <a-radio :value="2">不通过</a-radio> -->
        </a-radio-group>
      </a-form-item>
      <!-- <a-form-item
        v-if="form.auditStatus === 2"
        label="不通过原因"
      >
        <a-textarea
          v-model="form.auditRemark"
          placeholder="请输入不通过原因"
          allow-clear
        />
      </a-form-item> -->
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { Message } from "@arco-design/web-vue";
import { auditPersonQualification } from "@/apis/exam/personQualification";

const visible = ref(false);
const currentId = ref<number>();

const form = reactive({
  auditStatus: 1,
//   auditRemark: "",
});

const emit = defineEmits(["audit-success"]);

const onOpen = (id: number) => {
  currentId.value = id;
  form.auditStatus = 1;
//   form.auditRemark = "";
  visible.value = true;
};
//需要备注
// const onSubmit = async () => {
//   if (form.auditStatus === 2 && !form.auditRemark) {
//     Message.warning("请输入不通过原因");
//     return;
//   }


const onSubmit = async () => {
  // 如果你以后要启用“不通过原因”
  // if (form.auditStatus === 2 && !form.auditRemark) {
  //   Message.warning("请输入不通过原因");
  //   return;
  // }

  await auditPersonQualification({
    id: currentId.value,
    auditStatus: form.auditStatus,
    // auditRemark: form.auditRemark,
  });

  Message.success("审核成功");
  visible.value = false;
  emit("audit-success");
};


defineExpose({ onOpen });
</script>
