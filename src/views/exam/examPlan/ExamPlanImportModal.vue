<template>
  <a-modal
      v-model:visible="visible"
      title="考试计划导入"
      :mask-closable="false"
      :width="600"
  >
    <div class="import-modal-content">
      <a-alert>批量导入考试计划需要填写考试项目数据，如不清楚请先下载考试项目数据。
        考试项目会发生变化，建议每次导入前都下载最新的考试项目数据进行参照。
      </a-alert>
      <div class="action-buttons">
        <a-button type="outline" @click="downloadtProjectsExcel">
          <template #icon>
            <icon-download/>
          </template>
          下载考试项目数据
        </a-button>
        <a-button type="outline" @click="downloadTemplate">
          <template #icon>
            <icon-download/>
          </template>
          下载导入模板
        </a-button>
        <a-upload
            :show-file-list="false"
            :before-upload="beforeUpload"
            :custom-request="customRequest"
        >
          <a-button type="primary">
            <template #icon>
              <icon-upload/>
            </template>
            导入
          </a-button>
        </a-upload>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {Message} from '@arco-design/web-vue'
import * as XLSX from 'xlsx-js-style'
import {getProjectsWithClassrooms} from '@/apis/exam/project'

const visible = ref(false)


const customRequest = async (options) => {
  const formData = new FormData()
  formData.append('file', options.fileItem.file)
  try {
    // const response = await verifyExcel(formData)
    Message.success('上传成功')
  } catch (error) {
    Message.error('校验失败')
  }
}
// 生成项目数据的Excel并下载
async function exportProjectsExcel() {
  // 获取项目数据
  const res = await getProjectsWithClassrooms();
  const projectData = Array.isArray(res) ? res : res.data || [];

  // 构建Excel数据结构：标题→提示→表头→数据
  const templateData = [];
  templateData.push(['考试项目参考数据']); // 标题行（合并7列）
  templateData.push(['该数据仅为考试项目已绑定了考场的项目数据，供批量导入考试计划使用']); // 提示行（合并7列）
  templateData.push([
    '序号', '项目代码', '考试种类', '项目名称', '项目考试考场', '项目考场编号', '考场类型'
  ]); // 表头行（7列）

  let index = 1;
  let num = 0;
  const mergeRanges = [];
  let currentDataRow = 3; // 数据行起始索引（0=标题，1=提示，2=表头）

  // 遍历项目生成数据行（每个考场1行）
  for (const project of projectData) {
    const classrooms = Array.isArray(project.classrooms) ? project.classrooms : [];
    num++;
    if (classrooms.length > 0) {
      const startRow = currentDataRow + 1;
      // 生成每个考场的独立数据行
      for (const classroom of classrooms) {        
        templateData.push([
          num,
          project.projectCode || '无',
          project.categoryName || '无',
          project.projectName || '无',
          classroom.classroomName || '无',
          classroom.classroomId || '无',
          // 考场类型枚举转换（0=理论，非0=实操）
          classroom.examType == null ? '无' : (classroom.examType === 0 ? "理论考试" : "实操考试")
        ]);
        currentDataRow++;
      }
      // 合并多考场项目的前4列（避免重复）
      if (currentDataRow > startRow) {
        for (let col = 0; col < 4; col++) {
          mergeRanges.push({
            s: { r: startRow - 1, c: col },
            e: { r: currentDataRow - 1, c: col }
          });
        }
      }
    } else {
      // 无考场项目的兜底数据行（7列对齐）
      templateData.push([index++, project.projectCode || '无', project.categoryName || '无', project.projectName || '无', '无', '无', '无']);
      currentDataRow++;
    }
  }

  // 生成Excel工作簿和工作表
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(templateData);

  // 关键：设置标题行（第1行，对应Excel行号1）的行高（30像素，可根据需求调整）
  worksheet['!rows'] = [
    { hpx: 30 }, // 第1行（标题行）：行高30像素（加高后更舒展）
    { hpx: 20 }, // 第2行（提示行）：行高20像素（适配小字体）
    { hpx: 25 }, // 第3行（表头行）：行高25像素（适配表头字体）
    // 数据行无需单独设置，默认适配内容
  ];

  // 合并标题和提示行（7列全合并）
  mergeRanges.unshift(
    { s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }, // 标题合并
    { s: { r: 1, c: 0 }, e: { r: 1, c: 6 } }  // 提示合并
  );

  // 列宽配置（适配内容长度，避免截断）
  worksheet['!cols'] = [
    { wch: 10 },  // 序号
    { wch: 50 },  // 项目代码（适配长编码）
    { wch: 22 },  // 考试种类
    { wch: 50 },  // 项目名称（适配长名称）
    { wch: 60 },  // 项目考试考场（适配详细地址）
    { wch: 22 },  // 项目考场编号
    { wch: 16 }   // 考场类型
  ];

  // 应用合并配置
  worksheet['!merges'] = mergeRanges;

  // 样式配置（增强视觉层次）
  const titleStyle = { // 标题样式：醒目、居中
    alignment: { horizontal: 'center', vertical: 'center' },
    font: { bold: true, color: { rgb: '3366CC' }, name: '微软雅黑', sz: 16 },
    fill: { fgColor: { rgb: 'F5F7FA' } }, // 浅蓝背景增强质感
    border: { style: 'none' }
  };
  const tipStyle = { // 提示样式：弱化、左对齐
    alignment: { horizontal: 'left', vertical: 'center', indent: 1 }, // 首行缩进1字符
    font: { color: { rgb: '666666' }, name: '微软雅黑', sz: 10, italic: true },
    fill: { fgColor: { rgb: 'FCFCFC' } }, // 浅灰背景区分
    border: { style: 'none' }
  };
  const headerStyle = { // 表头样式：深色、清晰
    alignment: { horizontal: 'center', vertical: 'center' },
    font: { bold: true, color: { rgb: 'FFFFFF' }, name: '微软雅黑', sz: 12 },
    fill: { fgColor: { rgb: '3366CC' } }, // 深蓝背景
    border: { // 细白边框增强对比
      top: { style: 'thin', color: { rgb: 'FFFFFF' } },
      bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
      left: { style: 'thin', color: { rgb: 'FFFFFF' } },
      right: { style: 'thin', color: { rgb: 'FFFFFF' } }
    }
  };
  const bodyStyle = { // 数据样式：规整、易读
    alignment: { horizontal: 'center', vertical: 'center' },
    font: { color: { rgb: '333333' }, name: '微软雅黑', sz: 11 },
    fill: { fgColor: { rgb: 'FFFFFF' } },
    border: { // 浅灰边框区分单元格
      top: { style: 'thin', color: { rgb: 'E6E6E6' } },
      bottom: { style: 'thin', color: { rgb: 'E6E6E6' } },
      left: { style: 'thin', color: { rgb: 'E6E6E6' } },
      right: { style: 'thin', color: { rgb: 'E6E6E6' } }
    }
  };

  // 批量应用样式
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let R = range.s.r; R <= range.e.r; R++) {
    for (let C = range.s.c; C <= range.e.c; C++) {
      const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
      const cell = worksheet[cellAddress];
      if (!cell) continue;
      // 按行分配样式
      cell.s = R === 0 ? titleStyle : R === 1 ? tipStyle : R === 2 ? headerStyle : bodyStyle;
    }
  }

  // 导出Excel
  XLSX.utils.book_append_sheet(workbook, worksheet, '考试项目参照数据');
  XLSX.writeFile(workbook, '考试项目参照数据.xlsx');
}

const downloadtProjectsExcel = () => {
  const workbook = exportProjectsExcel()
  XLSX.writeFile(workbook, `考试项目参照数据.xlsx`)
}
// 下载模板
const downloadTemplate = () => {
  const link = document.createElement('a')
  link.href = '/templates/批量导入考试计划数据模板.xlsx'  
  link.download = '批量导入考试计划数据模板.xlsx'        
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// 打开弹窗
const onOpen = async () => {
  visible.value = true
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
