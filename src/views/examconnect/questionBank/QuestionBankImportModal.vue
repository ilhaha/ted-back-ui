<template>
  <a-modal v-model:visible="visible" title="题目导入" :mask-closable="false" :width="600" :footer="false">
    <div class="import-modal-content">
      <a-alert>下载模板后请严格按照模板规则填写</a-alert>
      <!-- <div class="cascader-container">
        <a-form layout="vertical">
          <a-form-item label="题目分类" field="categoryIds">
            <a-cascader v-model="selectedCategory" :options="categoryOptions" placeholder="请选择分类" />
          </a-form-item>
        </a-form>
      </div> -->

      <div class="action-buttons">
        <a-button type="dashed" @click="downloadTemplate">
          <template #icon>
            <icon-download />
          </template>
          下载模板
        </a-button>
        <a-upload :show-file-list="false" :before-upload="beforeUpload" :custom-request="customRequest"
          accept=".xls,.xlsx">
          <a-button type="outline">
            <template #icon>
              <icon-upload />
            </template>
            上传文件
          </a-button>
        </a-upload>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Message, Modal } from "@arco-design/web-vue";
import XLSX from "xlsx-js-style";
import { computedAsync } from "@vueuse/core";
import { getOptions } from "@/apis/examconnect/questionBank";
import { getAllPath, verifyExcel } from "@/apis/exam/category";

const emit = defineEmits(['import-success'])

const visible = ref(false);
const selectedCategory = ref<string[]>([]);
const categoryOptions = ref<any[]>([]);
const selectedFile = ref<File | null>(null); // 新增：缓存选中的文件
const DEFAULT_EMPTY_CATEGORY = {
  categoryName: "",
  projectName: "",
  knowledgeTypeName: "",
};

const customRequest = async (options: any) => {

  // if (!selectedCategory.value.length) {
  //   Message.error("请先选择分类");
  //   return;
  // }
  const file = options.fileItem.file

  if (!beforeUpload(file)) return

  // 弹出确认框
  Modal.confirm({
    title: '确认上传',
    content: `确定要上传文件「${file.name}」吗？`,
    okText: '确认上传',
    cancelText: '取消',
    async onOk() {
      const formData = new FormData()
      formData.append('file', file)
      try {
        await verifyExcel(formData);
        Message.success('导入成功')
        visible.value = false
        emit('import-success')
      } catch (error) {
      }
    },
  })
}

// 上传前校验
const beforeUpload = (file: File) => {
  const isExcel =
    file.type === 'application/vnd.ms-excel' ||
    file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'

  if (!isExcel) {
    Message.error('只能上传 Excel 文件（.xls 或 .xlsx）')
    return false
  }

  return true
}


// 异步计算属性
// const parsedCategory = computedAsync(async () => {
//   if (!selectedCategory.value.length) return DEFAULT_EMPTY_CATEGORY;
//   try {
//     const { data } = await getAllPath(selectedCategory.value);
//     return data || DEFAULT_EMPTY_CATEGORY;
//   } catch (error) {
//     return DEFAULT_EMPTY_CATEGORY;
//   }
// }, DEFAULT_EMPTY_CATEGORY);

// 获取分类选项
// const loadOptions = async () => {
//   const res = await getOptions();
//   categoryOptions.value = res.data || [];
// };

// 生成模板文件
const generateTemplate = () => {
  // 1. 分类信息（用于 sheet 名称）
  // const categoryInfo = [
  //   parsedCategory.value.categoryId,
  //   parsedCategory.value.projectId,
  //   parsedCategory.value.knowledgeTypeId,
  // ].join(",");

  // 2. Excel 内容
  const templateData = [
    [
      "项目代码",
      "知识类型名称",
      "问题",
      "题型\n（0 单选1 判断2 多选）",
      "考试人员类型\n（1-作业人员2-检验人员）",
      "选项A",
      "选项B",
      "选项C",
      "选项D",
      "答案\n（多选用英文逗号分隔如：A,B）",
    ],
    [
      "AQGL",
      "法规知识",
      "示例题目",
      "0",
      "1",
      "答案A",
      "答案B",
      "答案C",
      "答案D",
      "A",
    ],
  ];

  // 3. 创建工作簿和表
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);

  // === 设置列宽（xlsx-js-style 支持）===
  const colWidths = templateData[0].map((_, colIndex) => {
    const maxLength = Math.max(
      ...templateData.map((row) => {
        const cellValue = row[colIndex]?.toString() || "";
        return cellValue.length;
      })
    );
    return { wch: Math.min(Math.max(maxLength + 20, 20), 50) };
  });
  worksheet["!cols"] = colWidths;

  // === 设置单元格样式（居中、标题加粗）===
  const range = XLSX.utils.decode_range(worksheet["!ref"]);

  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];

      if (!cell) continue;

      cell.s = cell.s || {};

      // 所有单元格居中
      cell.s.alignment = {
        horizontal: "center",
        vertical: "middle",
        wrapText: true
      };

      // 第一行标题加粗
      if (R === 0) {
        cell.s.font = {
          bold: true,
        };
      }
    }
  }

  // 4. 添加到 workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "题目导入模板");

  return workbook;
};

// 下载最新项目及知识类型数据
const downloadProjectData = async () => {
  const link = document.createElement('a')
  link.href = '/templates/最新项目及知识类型数据.xlsx'
  link.download = '最新项目及知识类型数据.xlsx'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
// 下载模板
const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/templates/题目导入模板.xlsx'
  link.download = '题目导入模板.xlsx'
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 下载模板
// const downloadTemplate = () => {
// if (!selectedCategory.value.length) {
//   Message.error("请先选择分类");
//   return;
// }
//   const workbook = generateTemplate();
//   XLSX.writeFile(
//     workbook,
//     `题目导入模板.xlsx`
//   );
// };


// 选择文件
const handleFileChange = (e: Event) => {
  const files = (e.target as HTMLInputElement).files;
  if (!files || !files.length) {
    selectedFile.value = null;
    return;
  }
  const file = files[0];
  // 校验类型
  if (
    file.type !==
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  ) {
    Message.error("只允许上传 .xlsx 格式的文件");
    selectedFile.value = null;
    return;
  }
  selectedFile.value = file;
};

// 点击确认上传
const handleConfirmUpload = async () => {
  if (!selectedCategory.value.length) {
    Message.error("请先选择分类");
    return;
  }
  if (!selectedFile.value) {
    Message.error("请先选择文件");
    return;
  }
  const formData = new FormData();
  formData.append("file", selectedFile.value);
  try {
    await verifyExcel(formData);
    Message.success("上传成功");
    visible.value = false;
    window.location.reload();
  } catch (error) {
    // Message.error("校验失败");
  }
};

// 打开弹窗
const onOpen = async () => {
  selectedCategory.value = []
  visible.value = true;
  // await loadOptions();
};

// 工具函数：根据ID获取标签
const getLabelById = (id: string) => {
  let label = "";
  categoryOptions.value.forEach((l1) => {
    l1.children.forEach((l2) => {
      l2.children.forEach((l3) => {
        if (l3.value === id) label = l3.label;
      });
    });
  });
  return label;
};

defineExpose({ onOpen });
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
  margin: 15px;
}
</style>
