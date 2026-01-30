<template>
  <!-- 主表单弹窗 -->
  <a-modal v-model:visible="visible" :title="title" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="save" @close="reset">
    <GiForm ref="formRef" v-model="form" :columns="columns">
      <!-- 头像插槽 -->
      <template #avatar>
        <div class="avatar-upload">
          <a-image v-if="form.avatar" :src="form.avatar" :width="120" :height="168" fit="cover" show-loader />
          <a-button type="primary" size="small" style="margin-left: 16px" @click="avatarUploadVisible = true">
            点击上传
          </a-button>
        </div>
      </template>
    </GiForm>
  </a-modal>

  <!-- 上传头像弹窗 -->
  <UploadImageModal :visible="avatarUploadVisible" @close="avatarUploadVisible = false"
    @upload-application-success="handleAvatarUploadSuccess" />
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
import { encryptByRsa } from "@/utils/encrypt";
import UploadImageModal from "./UploadImageModal.vue";

const emit = defineEmits<{
  (e: "save-success"): void;
}>();

const { width } = useWindowSize();

const visible = ref(false);
const dataId = ref("");
const isUpdate = computed(() => !!dataId.value);
const title = computed(() =>
  isUpdate.value ? "修改作业人员信息" : "新增考生类型"
);

const formRef = ref<InstanceType<typeof GiForm>>();
const avatarUploadVisible = ref(false);

const [form, resetForm] = useResetReactive({
  nickname: "",
  username: "",
  phone: "",
  avatar: "",
});

/* ===================== 表单列配置（核心） ===================== */

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
    rules: [
      { required: true, message: "请输入身份证号" },
      {
        validator: (value: string, callback: Function) => {
          if (!value) return callback();

          const v = value.toUpperCase();

          // 基础格式校验
          const reg =
            /^(^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$)|(^[1-9]\d{5}(19|20)\d{2}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}(\d|X)$)$/;

          if (!reg.test(v)) {
            callback("请输入有效的身份证号");
          } else {
            callback();
          }
        },
      },
    ],
  },
  {
    label: "联系电话",
    field: "phone",
    type: "input",
    span: 24,
    rules: [
      { required: true, message: "请输入手机号" },
      {
        validator: (value: string, callback: Function) => {
          if (!value) return callback();

          if (!/^1[3-9]\d{9}$/.test(value)) {
            callback("请输入有效的手机号");
          } else {
            callback();
          }
        },
      },
    ],
  },
  {
    label: "照片",
    field: "avatar",
    span: 24,
    slot: "avatar",
    rules: [{ required: true, message: "请上传照片" }],
  },
]);

/* ===================== 方法 ===================== */

const handleAvatarUploadSuccess = (url: string) => {
  form.avatar = url;
  avatarUploadVisible.value = false;
};

const reset = () => {
  formRef.value?.formRef?.resetFields();
  resetForm();
};

const save = async () => {
  try {
    // 校验失败会直接 throw
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
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
  } catch {
    return false;
  }
};

/* ===================== 对外暴露 ===================== */

const onAdd = () => {
  reset();
  dataId.value = "";
  visible.value = true;
};

const onUpdate = async (id: string) => {
  reset();
  dataId.value = id;
  const { data } = await getCandidateType(id);
  Object.assign(form, data);
  visible.value = true;
};

defineExpose({ onAdd, onUpdate });
</script>

<style scoped lang="scss">
.avatar-upload {
  display: flex;
  align-items: center;
}
</style>
