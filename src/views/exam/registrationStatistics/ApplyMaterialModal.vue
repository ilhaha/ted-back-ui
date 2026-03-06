<template>
  <a-modal
    v-model:visible="visible"
    title="报考资料"
    :footer="null"
    width="75%"
    @cancel="handleClose"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="text-center py-10">
      <a-spin />
    </div>

    <!-- 表格展示 -->
    <a-table
      v-else
      :data="materials"
      :columns="columns"
      row-key="id"
      :empty-text="emptyText"
    >
      <!-- 资料图片列插槽 -->
      <template #docPath="{ record }">
        <a-space v-if="record.documentUrl">
          <a-image
            v-for="(path, index) in getPaths(record.documentUrl)"
            :key="index"
            width="80"
            height="60"
            :src="path"
            :preview-props="{ zoomRate: 1.5 }"
            fit="cover"
            class="preview-image"
          />
        </a-space>
        <span v-else>-</span>
      </template>

      <!-- 审核状态列插槽 -->
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>

      <!-- 审核备注列插槽 -->
      <template #auditRemark="{ record }">
        <span>{{ record.auditRemark || "-" }}</span>
      </template>
    </a-table>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Message } from "@arco-design/web-vue";
import { listByCandidateId } from "@/apis/document/document";

defineOptions({ name: "ApplyMaterialModal" });

// 响应式数据
const visible = ref(false);
const loading = ref(false);
const materials = ref<any[]>([]);

// 表格列配置（对齐参考示例的结构）
const columns = [
  { title: "资料名称", dataIndex: "typeName", key: "typeName" },
  {
    title: "资料图片",
    dataIndex: "documentUrl",
    key: "docPath",
    slotName: "docPath",
  },
  { title: "审核状态", dataIndex: "status", key: "status", slotName: "status" },
  {
    title: "审核备注",
    dataIndex: "auditRemark",
    key: "auditRemark",
    slotName: "auditRemark",
  },
];

// 空数据提示文本
const emptyText = ref("暂无报考资料");

// 获取状态颜色（沿用原有逻辑，对齐参考示例的颜色映射）
const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "red"; // 参考示例：待审核-红色
    case 1:
      return "green"; // 参考示例：已生效-绿色
    case 2:
      return "orange"; // 参考示例：待补正-橙色
    case 3:
      return "orange"; // 参考示例：补正审核-橙色
    default:
      return "default";
  }
};

// 获取状态文本（对齐参考示例的文案）
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

// 处理多个图片路径拆分
const getPaths = (docPath: string | undefined): string[] => {
  if (!docPath) {
    return [];
  }
  return docPath.split(",").filter((path) => path.trim());
};

// 打开模态框并加载数据
const open = async (candidatesId: string, projectId: string) => {
  if (!candidatesId) {
    Message.warning("考生ID不存在");
    return;
  }
  if (!projectId) {
    Message.warning("项目ID不存在");
    return;
  }

  loading.value = true;
  try {
    const res = await listByCandidateId(candidatesId, projectId);
    materials.value = res.data || [];
    visible.value = true;
  } catch (error) {
    Message.error("获取报考资料失败");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// 关闭模态框
const handleClose = () => {
  visible.value = false;
  materials.value = [];
};

// 暴露方法给父组件调用
defineExpose({
  open,
});
</script>

<style scoped lang="scss">
// 图片预览样式
.preview-image {
  border-radius: 4px;
  cursor: pointer;
}

// 加载状态居中样式
.text-center {
  text-align: center;
}

.py-10 {
  padding-top: 2.5rem;
  padding-bottom: 2.5rem;
}
</style>