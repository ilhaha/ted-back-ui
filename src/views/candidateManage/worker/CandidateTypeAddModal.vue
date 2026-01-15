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

const [form, resetForm] = useResetReactive({
  // todo 待补充
});

const avatarUploadVisible = ref(false);
const handleAvatarUploadSuccess = (url: string) => {
  form.avatar = url;
  avatarUploadVisible.value = false;
};

const columns: ColumnItem[] = reactive([
  {
    label: "姓名",
    field: "nickname",
    type: "input",
    span: 24,
    rules: [{ required: true, message: "请输入考生id" }],
  },
  {
    label: "身份证号",
    field: "username",
    type: "input",
    span: 24,
    rules: [{ required: true, message: "请输入身份证号" }],
  },
  {
    label: "手机号",
    field: "phone",
    type: "input",
    span: 24,
    rules: [{ required: true, message: "请输入手机号" }],
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

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate();
    if (isInvalid) return false;

    // 复制一份，避免污染表单显示
    const submitData = {
      ...form,
      username: encryptByRsa(form.username), // 身份证
      phone: encryptByRsa(form.phone), // 手机号
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
