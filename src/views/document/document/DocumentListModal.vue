<template>
  <a-modal
    v-model:visible="visible"
    title="考生资料"
    :footer="null"
    width="75%"
  >
    <a-table :data="documents" :columns="columns" row-key="id">
      <!-- 资料图片 -->
      <template #docPath="{ record }">
        <a-space v-if="record.docPath">
          <a-image
            v-for="(path, index) in record.docPath.split(',')"
            :key="index"
            width="80"
            height="60"
            :src="path"
            fit="cover"
            
          />
        </a-space>
        <span v-else>-</span>
      </template>

      <!-- 审核状态 -->
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>

      <!-- 审核备注 -->
      <template #auditRemark="{ record }">
        <span>{{ record.auditRemark || "-" }}</span>
      </template>

      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <a-link title="审核" @click="onExamine(record)" v-permission="['document:document:examine']">审核</a-link>
        </a-space>
      </template>
    </a-table>

    <!-- 审核弹窗 -->
    <DocumentAddModal ref="DocumentAddModalRef" @save-success="onSaveSuccess" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Message } from "@arco-design/web-vue";
import DocumentAddModal from "./DocumentAddModal.vue";

const visible = ref(false);
const documents = ref([]);

// 定义表格列
const columns = [
  { title: "资料名称", dataIndex: "typeName", key: "typeName" },
  { title: "审核状态", dataIndex: "status", key: "status", slotName: "status" },
  {
    title: "审核备注",
    dataIndex: "auditRemark",
    key: "auditRemark",
    slotName: "auditRemark",
  },
  {
    title: "资料图片",
    dataIndex: "docPath",
    key: "docPath",
    slotName: "docPath",
  },
  { title: "创建时间", dataIndex: "createTime", key: "createTime" },
  { title: "操作", key: "action", slotName: "action" },
];

// 审核弹窗引用
const DocumentAddModalRef = ref<InstanceType<typeof DocumentAddModal>>();

// 打开列表弹窗
const open = (data: any[]) => {
  documents.value = data || [];
  visible.value = true;
};

// 点击审核按钮
const onExamine = (record: any) => {
  if (DocumentAddModalRef.value) {
    DocumentAddModalRef.value.onExamine(
      record.id,
      record.typeId,
      record.candidateId
    );
  } else {
    Message.error("审核组件未初始化");
  }
};

// 审核成功回调
const onSaveSuccess = () => {
  Message.success("审核成功");
  // 可以刷新列表或者触发父组件事件
};

// 审核状态文字
const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待审核";
    case 1:
      return "已生效";
    case 2:
      return "待补正";
    case 3:
      return "补正审核";
    default:
      return "-";
  }
};

// 审核状态颜色
const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "red";
    case 1:
      return "green";
    case 2:
      return "orange";
    case 3:
      return "orange";
    default:
      return "default";
  }
};



defineExpose({ open });
</script>

<style scoped lang="scss">
.preview-image {
  border-radius: 4px;
  object-fit: cover;
}
</style>
