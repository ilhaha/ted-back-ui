<template>
  <a-modal
    :visible="visible"
    title="考生资料详情"
    :footer="false"
    @cancel="handleClose"
  >
    <div v-if="!localDocumentList.length" class="no-data">暂无资料</div>
    <div v-for="(doc, index) in localDocumentList" :key="index">
      <h4>{{ doc.documentName }}</h4>
      <img
        :src="doc.documentUrl"
        alt="申请资料"
        class="preview-image"
        @load="handleImageLoad"
      />
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const localDocumentList = ref<Array<{ documentName: string; documentUrl: string }>>([]) // 新增内部状态


const handleOpen = (documents: any[]) => {
  localDocumentList.value = documents || []
  visible.value = true
}
const handleClose = () => visible.value = false

defineExpose({ handleOpen })
</script>

<style scoped>
.preview-image {
  max-width: 100%;
  height: auto;
  border: 1px solid #eee;
  margin: 10px 0;
}
/* 在子组件样式中添加 */
.no-data {
  text-align: center;
  color: var(--color-text-3);
  padding: 20px 0;
}
</style>
