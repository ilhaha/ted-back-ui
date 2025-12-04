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
      <!-- 资质图片 -->
      <template #qualificationUrl="{ record }">
        <div class="image-list">
          <a-image
            v-for="(url, index) in record.qualificationUrls"
            :key="index"
            width="100"
            :src="url"
            :preview="true"
            :preview-props="{
              actions: ['rotateRight', 'zoomIn', 'zoomOut', 'originalSize'],
            }"
          />
        </div>
      </template>

      <!-- 操作列：删除 -->
      <template #actions="{ record }">
        <a-popconfirm
          content="确认删除该资质吗？"
          type="warning"
          @ok="handleDelete(record.id)"
        >
          <a-button size="small" status="danger">删除</a-button>
        </a-popconfirm>
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
  deleteQualification, // ✅ 删除接口
} from "@/apis/system/qualification";

// 弹窗控制
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
  
  { title: "资质类别", dataIndex: "categoryName" },
  {
    title: "资质证明",
    dataIndex: "qualificationUrl",
    slotName: "qualificationUrl",
  },
  { title: "上传时间", dataIndex: "createTime" },
  { title: "更新时间", dataIndex: "updateTime" },

  //删除
  { title: "操作", dataIndex: "actions", slotName: "actions", width: 120 },
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

  // 转换图片 URL 为数组
  tableData.value = res.data?.map((item) => ({
    ...item,
    qualificationUrls: item.qualificationUrl
      ? item.qualificationUrl.split(",")
      : [], // 将逗号分隔的字符串转换为数组
  })) || [];

  total.value = tableData.value.length || 0;
};

// ======== 上传按钮 ========
const handleUploadClick = () => {
  if (!currentUserId.value) {
    Message.warning("用户 ID 未设置");
    return;
  }
  uploadVisible.value = true;
  documentUploadRef.value?.open(currentUserId.value);
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
  uploadVisible.value = false;
  loadQualification();
};

// ======== 删除资质 ========
const handleDelete = async (qualificationId: number) => {
  try {
    await deleteQualification(qualificationId); 
    Message.success("删除成功");
    loadQualification(); // 刷新资质列表
  } catch (error) {
    console.error("删除资质失败:", error);
    Message.error("删除资质失败，请稍后重试");
  }
};

// 向父组件暴露
defineExpose({
  open,
});
</script>

<style scoped>
.pagination-wrapper {
  margin-top: 16px;
  text-align: right;
}

.image-list {
  display: flex; /* 使用 flex 布局 */
  gap: 8px; /* 图片之间的间距 */
  flex-wrap: wrap; /* 如果图片过多，自动换行 */
  align-items: center; /* 垂直居中图片 */
}
</style>
