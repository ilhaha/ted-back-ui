<template>
  <a-modal
    v-model:visible="visible"
    title="题库Excel导出"
    :mask-closable="false"
    :width="600"
    :footer="null"
  >
    <div class="export-modal-content">
      <!-- 提示信息：明确类型 -->
      <a-alert type="info">
        请选择分类，导出对应题库数据为 Excel，系统会自动填充分类信息到表格中
      </a-alert>

      <div class="cascader-container">
        <a-form layout="vertical">
          <a-form-item 
            label="题目分类" 
            field="categoryIds"
        
          >
            <a-cascader
              v-model="selectedCategory"
              :options="categoryOptions"
              placeholder="请选择分类"
              :style="{ width: '100%' }"
              change-on-select
            />
          </a-form-item>
        </a-form>
      </div>

      <div class="action-buttons">
        <!-- 下载按钮：添加加载状态 -->
        <a-button 
          type="outline" 
          @click="downloadQuestionsExcel"
          :loading="isDownloading"
        >
          <template #icon>
            <icon-download/>
          </template>
          下载Excel
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue'
import { Message, Spin } from '@arco-design/web-vue'
import { getOptions, exportQuestionsExcel } from '@/apis/examconnect/questionBank'
import { getAllPath } from '@/apis/exam/category'
import type { CategoryPathResp } from '@/apis/exam/category' // 引入分类详情类型

// 控制弹窗显示
const visible = ref(false)
// 选中的分类（级联选择值）
const selectedCategory = ref<string[]>([])
// 分类下拉选项
const categoryOptions = ref<any[]>([])
// 下载中状态（控制按钮加载动画）
const isDownloading = ref(false)

/**
 * 加载分类选项
 */
const loadOptions = async () => {
  try {
    const res = await getOptions()
    categoryOptions.value = res.data || []
  } catch (error) {
    Message.error('加载分类选项失败，请刷新重试')
    console.error('分类加载失败：', error)
  }
}

/**
 * 打开弹窗
 */
const onOpen = async () => {
  selectedCategory.value = [] // 打开时重置选中
  await loadOptions()
  visible.value = true
}

/**
 * 下载题库Excel
 */
const downloadQuestionsExcel = async () => {
  // 校验：必须选择分类
  if (!selectedCategory.value.length) {
    Message.error('请先选择分类')
    return
  }

  // 标记为“下载中”
  isDownloading.value = true

  try {
    // 1. 获取分类详情
    const { data: categoryInfo } = await getAllPath(selectedCategory.value) as { data: CategoryPathResp };
    if (!categoryInfo) {
      Message.error('分类信息为空，请重新选择')
      return
    }

    // 2. 调用后端导出接口（获取文件流）
    const res = await exportQuestionsExcel({
      categoryId: categoryInfo.categoryId,
      subCategoryId: categoryInfo.projectId,
      knowledgeTypeId: categoryInfo.knowledgeTypeId
    })

    // 3. 校验接口返回（确保是文件流）
    if (!res.data) {
      Message.error('导出数据为空')
      return
    }

    // 4. 生成动态文件名（示例：锅炉-司炉人员理论考试_基础知识.xlsx）
    const fileName = `${categoryInfo.categoryName || '题库'}-${categoryInfo.projectName || '考试项目'}_${categoryInfo.knowledgeTypeName || '知识类型'}.xlsx`

    // 5. 处理文件下载
    const blob = new Blob([res.data], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = fileName // 使用动态文件名
    document.body.appendChild(a)
    a.click() // 触发下载
    a.remove() // 清理DOM
    window.URL.revokeObjectURL(url) // 释放URL对象

    // 6. 下载成功提示
    Message.success('Excel导出成功，正在下载')

    // 7. 关闭弹窗
    visible.value = false

  } catch (error) {
    // 错误处理（不关闭弹窗，允许重试）
    Message.error(`导出失败：${(error as Error).message || '未知错误'}`)
    console.error('Excel导出错误：', error)
  } finally {
    // 无论成功/失败，都重置“下载中”状态
    isDownloading.value = false
  }
}

// 暴露打开弹窗的方法给父组件
defineExpose({ onOpen })
</script>

<style scoped>
.export-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 8px 0;
}

.cascader-container {
  margin: 12px 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 24px;
  padding-right: 8px;
}
</style>