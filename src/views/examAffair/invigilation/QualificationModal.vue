<template>
  <!-- 用户资质弹窗 -->
  <a-modal
    :visible="visible"
    width="70%"
    @cancel="close"
    title="用户资质"
    :footer="null"
  >
    <template #title>
      <span>用户资质</span>
      <a-button
        @click="handleUploadClick"
        style="margin-left: auto; margin-right: 30px"
      >
        <icon-file />
        上传资质
      </a-button>
    </template>

    <a-table
      :columns="columns"
      :data="tableData"
      :pagination="false"
      row-key="id"
    >
      <template #qualificationUrl="{ record }">
        <a-image
          width="100"
          :src="record.qualificationUrl"
          :preview="true"
          :preview-props="{
            actions: ['rotateRight', 'zoomIn', 'zoomOut', 'originalSize'],
          }"
        />
      </template>
    </a-table>

    <div class="pagination-wrapper">
      <a-pagination
        :total="total"
        :page-size="pageSize"
        v-model:current="currentPage"
        size="small"
        show-total
        :hide-on-single-page="false"
        @change="loadQualification"
      />
    </div>

    <!-- 上传组件 -->
    <DocumentUpload
      ref="documentUploadRef"
      title="上传资质"
      @upload-success="handleUploadSuccess"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { IconFile } from "@arco-design/web-vue/es/icon";
import { Message } from "@arco-design/web-vue";
import DocumentUpload from "../DocumentUpload/index.vue";
import {
  getQualificationList,
  addQualification,
} from "@/apis/system/qualification";

// 组件对外暴露方法
const visible = ref(false);
const currentUserId = ref<number | null>(null);

// 表格数据
const tableData = ref<any[]>([]);
const total = ref(0);
const pageSize = ref(10);
const currentPage = ref(1);

const uploadVisible = ref(false);
const documentUploadRef = ref();

// 表格列
const columns = [
  { title: "资质类别", dataIndex: "categoryName" }, // 添加资质类别列
  {
    title: "资质证明",
    dataIndex: "qualificationUrl",
    slotName: "qualificationUrl",
  },
  { title: "上传时间", dataIndex: "createTime" },
  { title: "更新时间", dataIndex: "updateTime" },
];

// ======== 公开方法：打开弹窗 ========
const open = (userId: number) => {
  currentUserId.value = userId;
  visible.value = true;
  loadQualification();
};

// ======== 关闭弹窗 ========
const close = () => {
  visible.value = false;
};

// ======== 加载列表 ========
const loadQualification = async () => {
  if (!currentUserId.value) return;
  const res = await getQualificationList({
    userId: currentUserId.value,
    page: currentPage.value,
    pageSize: pageSize.value,
  });

  // 确保数据结构正确
  tableData.value = res.data || []; // 直接赋值为后端返回的数组
  total.value = res.data.length || 0; // 设置总数为数组长度
};

// ======== 上传按钮 ========
const handleUploadClick = () => {
  if (!currentUserId.value) {
    Message.warning("用户 ID 未设置");
    return;
  }
  uploadVisible.value = true; // 打开上传弹窗
  documentUploadRef.value?.open(currentUserId.value); // 调用子组件的 open 方法
};

// 上传成功
const handleUploadSuccess = async (data: {
  typeId: number;
  docPath: string;
}) => {
  await addQualification({
    userId: currentUserId.value,
    categoryId: data.typeId,
    qualificationUrl: data.docPath,
  });
  Message.success("上传成功");
  uploadVisible.value = false; // 关闭上传弹窗
  loadQualification(); // 刷新资质列表
};

// 向父组件暴露方法
defineExpose({
  open,
});
</script>

<style scoped>
.pagination-wrapper {
  margin-top: 16px;
  text-align: right;
}
</style>
