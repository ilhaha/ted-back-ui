<template>
  <a-modal
    v-model:visible="visible"
    title="题目导入"
    :mask-closable="false"
    :width="600"
    :footer="false"
  >
    <div class="import-modal-content">
      <a-alert>请先选择分类再下载模板，系统会自动填充分类信息到模板中</a-alert>
      <div class="cascader-container">
        <a-form layout="vertical">
          <a-form-item label="题目分类" field="categoryIds">
            <a-cascader
              v-model="selectedCategory"
              :options="categoryOptions"
              placeholder="请选择分类"
            />
          </a-form-item>
        </a-form>
      </div>

      <div class="action-buttons">
        <a-button type="outline" @click="downloadTemplate">
          <template #icon>
            <icon-download/>
          </template>
          下载模板
        </a-button>
        <!-- 手动选择文件 -->
        <input
          type="file"
          accept=".xlsx"
          @change="handleFileChange"
          style="display:inline-block"
        />
        <a-button
          type="primary"
          :disabled="!selectedFile"
          @click="handleConfirmUpload"
        >
          <template #icon>
            <icon-upload/>
          </template>
          确认上传
        </a-button>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import * as XLSX from 'xlsx'
import { computedAsync } from '@vueuse/core'
import { getOptions } from '@/apis/examconnect/questionBank'
import { getAllPath, verifyExcel } from '@/apis/exam/category'

const visible = ref(false)
const selectedCategory = ref<string[]>([])
const categoryOptions = ref<any[]>([])
const selectedFile = ref<File | null>(null) // 新增：缓存选中的文件
const DEFAULT_EMPTY_CATEGORY = {
  categoryName: '',
  projectName: '',
  knowledgeTypeName: '',
}

const customRequest = async (options) => {
  const formData = new FormData()
  formData.append('file', options.fileItem.file)
  try {
    const response = await verifyExcel(formData)
    Message.success('上传成功')
    visible.value = false         // 关闭上传框
    window.location.reload()      // 刷新页面
  } catch (error) {
    Message.error('校验失败')
  }
}

// 异步计算属性
const parsedCategory = computedAsync(async () => {
  if (!selectedCategory.value.length) return DEFAULT_EMPTY_CATEGORY
  try {
    const {data} = await getAllPath(selectedCategory.value)
    return data || DEFAULT_EMPTY_CATEGORY
  } catch (error) {
    console.error('分类解析失败:', error)
    return DEFAULT_EMPTY_CATEGORY
  }
}, DEFAULT_EMPTY_CATEGORY)

// 获取分类选项
const loadOptions = async () => {
  const res = await getOptions()
  categoryOptions.value = res.data || []
}

// 生成模板文件
// 生成模板文件
const generateTemplate = () => {
  // 1. 创建分类信息字符串（用于工作表名称）
  const categoryInfo = [
    parsedCategory.value.categoryId,
    parsedCategory.value.projectId,
    parsedCategory.value.knowledgeTypeId,
  ].join(',')

  // 2. 创建模板数据（新的格式）
  const templateData = [
    // 表头
    [
      '题目标题',
      '题目类型（0单选，1判断，2多选）',
      '选项',
      '是否正确答案(填是或否)',
      '选项',
      '是否正确答案(填是或否)',
      '选项',
      '是否正确答案(填是或否)',
      '选项',
      '是否正确答案(填是或否)',
      '（如果有更多选项按照前面格式往后叠加）',
    ],
    // 示例数据行
    [
      'TestA', // 题目标题
      '0', // 题目类型
      '选项A', // 选项
      '是', // 是否正确答案
      '选项B', // 选项
      '否', // 是否正确答案
      '选项C', // 选项
      '否', // 是否正确答案
      '选项D', // 选项
      '否', // 是否正确答案
      '第一行仅为参考格式，请勿填写',
    ],
  ]

  // 3. 创建工作簿和工作表
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet(templateData)
  // +++ 新增：设置列宽 +++
  // 计算每列的最佳宽度（字符数）
  const colWidths = templateData[0].map((_, colIndex) => {
    // 获取该列所有单元格内容的最大长度
    const maxLength = Math.max(
        ...templateData.map(row => {
          const cellValue = row[colIndex]?.toString() || '';
          return cellValue.length;
        })
    );
    // 设置宽度为最大字符数+5个字符的缓冲
    return { wch: Math.min(Math.max(maxLength + 15, 15), 50) }; // 限制在15-50字符宽度
  });

  // 应用列宽设置
  worksheet['!cols'] = colWidths;


  // +++ 新增：设置单元格样式（居中+标题加粗）+++
  const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1:Z100'); // 动态获取范围[8](@ref)

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      let cell = worksheet[cellAddress];

      // 确保单元格对象存在
      if (!cell) {
        cell = { t: 's', v: templateData[R]?.[C] || '' };
        worksheet[cellAddress] = cell;
      }

      // 初始化样式对象
      cell.s = cell.s || {};

      // 设置居中（关键修正）[1,8](@ref)
      cell.s.alignment = cell.s.alignment || {};
      cell.s.alignment.horizontal = 'center'; // 水平居中
      cell.s.alignment.vertical = 'middle';   // 垂直居中

      // 标题行加粗（第一行）[7](@ref)
      if (R === 0) {
        cell.s.font = cell.s.font || {};
        cell.s.font.bold = true;
      }
    }
  }
  // --- 新增结束 ---

  console.log(parsedCategory.value)
  console.log(categoryInfo)
  // 4. 将工作表添加到工作簿，并设置工作表名称为分类信息
  XLSX.utils.book_append_sheet(workbook, worksheet, categoryInfo)

  return workbook
}

// 下载模板
const downloadTemplate = () => {
  if (!selectedCategory.value.length) {
    Message.error('请先选择分类')
    return
  }

  const workbook = generateTemplate()
  XLSX.writeFile(workbook, `题目导入模板_${parsedCategory.value.categoryName}.xlsx`)
}

// 上传前校验
const beforeUpload = (file: File) => {
  if (!selectedCategory.value.length) {
    Message.error('请先选择分类')
    return false
  }
  // 文件类型校验，只允许 .xlsx
  const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  if (!isXlsx) {
    Message.error('只允许上传 .xlsx 格式的文件')
    return false
  }
  return true
}

// 选择文件
const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files
  if (!files || !files.length) {
    selectedFile.value = null
    return
  }
  const file = files[0]
  // 校验类型
  if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
    Message.error('只允许上传 .xlsx 格式的文件')
    selectedFile.value = null
    return
  }
  selectedFile.value = file
}

// 点击确认上传
const handleConfirmUpload = async () => {
  if (!selectedCategory.value.length) {
    Message.error('请先选择分类')
    return
  }
  if (!selectedFile.value) {
    Message.error('请先选择文件')
    return
  }
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  try {
    await verifyExcel(formData)
    Message.success('上传成功')
    visible.value = false
    window.location.reload()
  } catch (error) {
    Message.error('校验失败')
  }
}

// 打开弹窗
const onOpen = async () => {
  await loadOptions()
  visible.value = true
}

// 工具函数：根据ID获取标签
const getLabelById = (id: string) => {
  let label = ''
  categoryOptions.value.forEach((l1) => {
    l1.children.forEach((l2) => {
      l2.children.forEach((l3) => {
        if (l3.value === id) label = l3.label
      })
    })
  })
  return label
}

defineExpose({onOpen})
</script>

<style scoped>
.import-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.cascader-container {
  margin: 12px 0;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-top: 24px;
}
</style>
