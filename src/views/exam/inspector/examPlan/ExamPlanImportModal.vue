<template>
    <a-modal v-model:visible="visible" title="考试计划导入" :mask-closable="false" :width="600" :footer="null">
        <div class="import-modal-content">
            <div class="action-buttons">
                <a-button type="outline" @click="downloadTemplate">
                    <template #icon>
                        <icon-download />
                    </template>
                    下载导入模板
                </a-button>
                <a-upload :show-file-list="false" :before-upload="beforeUpload" :custom-request="customRequest">
                    <a-button type="primary">
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
import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import * as XLSX from 'xlsx-js-style'
import { getProjectsWithClassrooms } from '@/apis/exam/project'
import { importExcel } from '@/apis/exam/examPlan'

const visible = ref(false)

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

const emit = defineEmits(['import-success'])
// 自定义上传逻辑
const customRequest = async (options: any) => {
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
                const response = await importExcel(formData)
                Message.success('导入成功')
                visible.value = false
                emit('import-success')
            } catch (error) {
            }
        },
    })
}
// 生成项目数据的Excel并下载
async function exportProjectsExcel() {
    // 获取项目数据
    const res = await getProjectsWithClassrooms();
    const projectData = Array.isArray(res) ? res : res.data || [];

    // 构建Excel数据结构：标题→提示→表头→数据
    const templateData: string[][] = [];
    templateData.push(['考试项目参考数据']); // 标题行
    templateData.push(['该数据仅为考试项目已绑定了考场的项目数据，供批量导入考试计划使用']); // 提示行

    // ✅ 在“项目名称”后添加一列“项目考试地点”
    templateData.push([
        '序号', '考试种类', '项目代码', '项目名称', '项目类型', '项目考试地点', '项目考试考场', '项目考场编号'
    ]);

    let index = 1;
    let num = 0;

    interface MergeRange {
        s: { r: number; c: number };
        e: { r: number; c: number };
    }

    const mergeRanges: MergeRange[] = [];
    let currentDataRow = 3; // 数据起始行

    // 遍历项目生成数据行
    for (const project of projectData) {
        const locations = Array.isArray(project.locations) ? project.locations : [];
        num++;

        if (locations.length > 0) {
            const projectStartRow = currentDataRow + 1;

            for (const location of locations) {
                const classrooms = Array.isArray(location.classrooms) ? location.classrooms : [];
                const locationStartRow = currentDataRow + 1;

                if (classrooms.length > 0) {
                    for (const classroom of classrooms) {
                        templateData.push([
                            num,
                            project.categoryName || '无',
                            project.projectCode || '无',
                            project.projectName || '无',
                            project.projectType == null ? '无' : (project.projectType === 0 ? "理论考试" : "实操考试"),
                            location.locationName || '无',
                            classroom.classroomName || '无',
                            classroom.classroomId || '无',
                        ]);
                        currentDataRow++;
                    }

                    //  合并同一地点的“项目考试地点”列（第5列，index=4）
                    if (classrooms.length > 1) {
                        mergeRanges.push({
                            s: { r: locationStartRow - 1, c: 4 },
                            e: { r: currentDataRow - 1, c: 4 }
                        });
                    }
                } else {
                    // 地点下无考场兜底
                    templateData.push([
                        num,
                        project.projectCode || '无',
                        project.categoryName || '无',
                        project.projectName || '无',
                        location.locationName || '无',
                        '无', '无', '无'
                    ]);
                    currentDataRow++;
                }
            }

            // ✅ 合并项目级的前4列
            if (currentDataRow >= projectStartRow) {
                for (let col = 0; col < 4; col++) {
                    mergeRanges.push({
                        s: { r: projectStartRow - 1, c: col },
                        e: { r: currentDataRow - 1, c: col }
                    });
                }
            }
        } else {
            // 无地点数据的兜底
            templateData.push([
                index++,
                project.projectCode || '无',
                project.categoryName || '无',
                project.projectName || '无',
                '无', '无', '无', '无'
            ]);
            currentDataRow++;
        }
    }

    // 创建工作簿和工作表
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(templateData);

    // 设置行高
    worksheet['!rows'] = [
        { hpx: 30 },
        { hpx: 20 },
        { hpx: 25 }
    ];

    // ✅ 现在有 8 列（0~7）
    mergeRanges.unshift(
        { s: { r: 0, c: 0 }, e: { r: 0, c: 7 } },
        { s: { r: 1, c: 0 }, e: { r: 1, c: 7 } }
    );

    // 列宽配置
    worksheet['!cols'] = [
        { wch: 10 },  // 序号
        { wch: 20 },  // 考试种类
        { wch: 40 },  // 项目代码
        { wch: 50 },  // 项目名称
        { wch: 15 },  // 考场类型
        { wch: 50 },  // 项目考试地点
        { wch: 50 },  // 项目考试考场
        { wch: 15 }  // 项目考场编号
    ];

    // 应用合并区域
    worksheet['!merges'] = mergeRanges;

    // 样式配置（保持原有）
    const titleStyle = {
        alignment: { horizontal: 'center', vertical: 'center' },
        font: { bold: true, color: { rgb: '3366CC' }, name: '微软雅黑', sz: 16 },
        fill: { fgColor: { rgb: 'F5F7FA' } },
        border: { style: 'none' }
    };
    const tipStyle = {
        alignment: { horizontal: 'left', vertical: 'center', indent: 1 },
        font: { color: { rgb: '666666' }, name: '微软雅黑', sz: 10, italic: true },
        fill: { fgColor: { rgb: 'FCFCFC' } },
        border: { style: 'none' }
    };
    const headerStyle = {
        alignment: { horizontal: 'center', vertical: 'center' },
        font: { bold: true, color: { rgb: 'FFFFFF' }, name: '微软雅黑', sz: 12 },
        fill: { fgColor: { rgb: '3366CC' } },
        border: {
            top: { style: 'thin', color: { rgb: 'FFFFFF' } },
            bottom: { style: 'thin', color: { rgb: 'FFFFFF' } },
            left: { style: 'thin', color: { rgb: 'FFFFFF' } },
            right: { style: 'thin', color: { rgb: 'FFFFFF' } }
        }
    };
    const bodyStyle = {
        alignment: { horizontal: 'center', vertical: 'center' },
        font: { color: { rgb: '333333' }, name: '微软雅黑', sz: 11 },
        fill: { fgColor: { rgb: 'FFFFFF' } },
        border: {
            top: { style: 'thin', color: { rgb: 'E6E6E6' } },
            bottom: { style: 'thin', color: { rgb: 'E6E6E6' } },
            left: { style: 'thin', color: { rgb: 'E6E6E6' } },
            right: { style: 'thin', color: { rgb: 'E6E6E6' } }
        }
    };

    // 应用样式
    const range = XLSX.utils.decode_range(worksheet['!ref']);
    for (let R = range.s.r; R <= range.e.r; R++) {
        for (let C = range.s.c; C <= range.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
            const cell = worksheet[cellAddress];
            if (!cell) continue;
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


defineExpose({ onOpen })
</script>

<style scoped>
.import-modal-content {
    display: flex;
    flex-direction: column;
}

.cascader-container {
    margin: 12px 0;
}

.action-buttons {
    display: flex;
    gap: 16px;
    justify-content: center;
    /* margin-top: 24px; */
    /* margin-bottom: 18px; */
}
</style>
