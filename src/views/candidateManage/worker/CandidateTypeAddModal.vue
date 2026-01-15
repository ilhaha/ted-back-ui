<template>
  <!-- 主表单弹窗 -->
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
      <!-- 头像插槽 -->
      <template #avatar>
        <div class="avatar-upload">
          <a-image
            v-if="form.avatar"
            :src="form.avatar"
            :width="120"
            :height="168"
            fit="cover"
            show-loader
          />
          <a-button
            type="primary"
            size="small"
            style="margin-left: 16px"
            @click="avatarUploadVisible = true"
          >
            点击上传
          </a-button>
        </div>
      </template>
    </GiForm>
  </a-modal>

  <!-- 上传头像弹窗 -->
  <UploadImageModal
    :visible="avatarUploadVisible"
    @close="avatarUploadVisible = false"
    @upload-application-success="handleAvatarUploadSuccess"
  />
</template>

<script setup lang="ts">
import { Message } from "@arco-design/web-vue";
import { useWindowSize } from "@vueuse/core";
import {
  getCandidateType,
  addCandidateType,
  updateCandidateType,
} from "@/apis/training/candidateType";
import { type ColumnItem, GiForm } from "@/components/GiForm";
import { useResetReactive } from "@/hooks";
import { useDict } from "@/hooks/app";
import { encryptByRsa } from "@/utils/encrypt";
import UploadImageModal from "./UploadImageModal.vue";

const emit = defineEmits<{
  (e: "save-success"): void;
}>();

const { width } = useWindowSize();

const dataId = ref("");
const visible = ref(false);
const isUpdate = computed(() => !!dataId.value);
const title = computed(() =>
  isUpdate.value ? "修改考生类型" : "新增考生类型"
);
const formRef = ref<InstanceType<typeof GiForm>>();

const avatarUploadVisible = ref(false);
const handleAvatarUploadSuccess = (url: string) => {
  form.avatar = url;
  avatarUploadVisible.value = false;
};

const [form, resetForm] = useResetReactive({
  nickname: "",
  username: "",
  phone: "",
  avatar: "",
});


const columns: ColumnItem[] = reactive([
  {
    label: "姓名",
    field: "nickname",
    type: "input",
    span: 24,
    rules: [{ required: true, message: "请输入姓名" }],
  },
  {
    label: "身份证号",
    field: "username",
    type: "input",
    span: 24,
    validateTrigger: "input", // 这里声明为输入时触发验证
    rules: [
      { required: true, message: "请输入身份证号" },
      {
        pattern:
          /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}(19|20)\d{2}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}(\d|X)$)$/,
        message: "请输入有效的身份证号",
      },
    ],
  },
  {
    label: "手机号",
    field: "phone",
    type: "input",
    span: 24,
    validateTrigger: "input",
    rules: [
      { required: true, message: "请输入手机号" },
      {
        pattern: /^1[3-9]\d{9}$/,
        message: "请输入有效的手机号",
      },
    ],
  },
  {
    label: "图片",
    field: "avatar",
    span: 24,
    slot: "avatar",
  },
]);

// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields();
  resetForm();
};

// 身份证号限制：前17位数字，最后一位数字或大写X
watch(
  () => form.username,
  (val, oldVal) => {
    if (!val) return;
    let value = val.toUpperCase(); // 自动大写 X

    if (value.length <= 17) {
      value = value.replace(/\D/g, ""); // 前17位只能数字
    } else {
      value = value.slice(0, 17) + value.slice(17).replace(/[^0-9X]/g, ""); // 第18位数字或X
    }

    value = value.slice(0, 18); // 截断最大长度

    if (value !== val) form.username = value; // 强制修改 form
  }
);

// 手机号限制：只能数字，最多11位
watch(
  () => form.phone,
  (val) => {
    if (!val) return;
    let value = val.replace(/\D/g, "");
    value = value.slice(0, 11);
    if (value !== val) form.phone = value; // 强制修改 form
  }
);

// 保存
const save = async () => {
  try {
    await formRef.value?.formRef?.validate(); // 校验
    const submitData = {
      ...form,
      username: encryptByRsa(form.username),
      phone: encryptByRsa(form.phone),
    };
    if (isUpdate.value) {
      await updateCandidateType(submitData, dataId.value);
      Message.success("修改成功");
    } else {
      await addCandidateType(submitData);
      Message.success("新增成功");
    }
    emit("save-success");
    return true;
  } catch (error) {
    // 验证失败会抛出异常
    return false;
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
  const { data } = await getCandidateType(id);
  Object.assign(form, data);
  visible.value = true;
};

defineExpose({ onAdd, onUpdate });
</script>

<style scoped lang="scss"></style>
