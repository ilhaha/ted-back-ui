<template>
    <a-modal v-model:visible="visible" title="复审人员导入" :mask-closable="false" :width="600" :footer="null">
        <div class="import-modal-content">
            <a-alert>下载模板后请严格按照模板规则填写</a-alert>
            <div class="action-buttons">
                <a-button type="dashed" @click="downloadTemplate">
                    <template #icon>
                        <icon-download />
                    </template>
                    下载导入模板
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
    <ExcelParsedResult ref="excelParsedResultRef" :improtFileName="improtFileName" @excel-parsed-close="handldExcelParsedClose"/>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { importExcel, analysisExcel } from '@/apis/exam/personQualification'
import ExcelParsedResult from './ExcelParsedResult.vue'

const visible = ref(false)
const improtFileName = ref<string>('')

const handldExcelParsedClose = () => {
    visible.value = false
    emit('import-success')
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
// 打开导入结果弹窗
const excelParsedResultRef = ref<InstanceType<typeof ExcelParsedResult>>()

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
            improtFileName.value = file.name
            const formData = new FormData()
            formData.append('file', file)
            try {
                const response = await analysisExcel(formData)
                const { successList, failList } = response.data
                excelParsedResultRef.value?.onOpen(successList, failList)
                Message.success('解析成功')
            } catch (error) {
            }
        },
    })
}

// 下载模板
const downloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/templates/复审导入表模板.xlsx'
    link.download = '复审导入表模板.xlsx'
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
    margin: 15px;
}
</style>
