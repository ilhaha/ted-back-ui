<template>
    <div class="gi_table_page">
        <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
            :scroll="{ x: '100%', y: 'calc(100vh - 200px)' }" :pagination="pagination" :disabled-tools="['size']"
            :disabled-column-keys="['name']" @refresh="search" :key="JSON.stringify(columns)"
            :row-selection="rowSelection" @select="select" @select-all="selectAll">
            <template #toolbar-left>
                <a-input-search v-model="queryForm.candidateName" placeholder="请输入作业人员姓名" allow-clear
                    @search="search" />
                <!-- <a-select v-model="queryForm.status" placeholder="审核状态" allow-clear class="search-input ml-2"
                    @change="search">
                    <a-option value="0">未审核</a-option>
                    <a-option value="1">审核通过</a-option>
                    <a-option value="2">审核未通过</a-option>
                    <a-option value="3">虚假材料</a-option>
                </a-select> -->
                <a-select v-model="queryForm.applyType" placeholder="来源" allow-clear class="search-input ml-2"
                    @change="search">
                    <a-option :value="0">扫码报考</a-option>
                    <a-option :value="1">机构报考</a-option>
                </a-select>
                <a-button @click="reset">
                    <template #icon><icon-refresh /></template>
                    <template #default>重置</template>
                </a-button>
            </template>
            <template #toolbar-right>
                <a-button v-permission="['worker:workerApply:review']" type="primary" @click="batchReview"
                    :disabled="!selectedKeys.length">
                    <template #icon><icon-check /></template>
                    <template #default>批量审核</template>
                </a-button>
            </template>
            <template #projectName="{ record }">
                {{ record.categoryName + " / " + record.projectName }}
            </template>
            <template #idCardPhotoFront="{ record }">
                <a-space v-if="record.idCardPhotoFront">
                    <img width="80" height="60" :src="record.idCardPhotoFront" class="preview-image"
                        style="object-fit: cover; cursor: pointer;"
                        @click="openRowPreview(record, record.idCardPhotoFront)" />
                    <img width="80" height="60" :src="record.idCardPhotoBack" class="preview-image"
                        style="object-fit: cover; cursor: pointer;"
                        @click="openRowPreview(record, record.idCardPhotoBack)" />
                </a-space>
                <span v-else>-</span>
            </template>
            <template #facePhoto="{ record }">
                <a-space v-if="record.facePhoto">
                    <img width="80" height="60" :src="record.facePhoto" class="preview-image"
                        style="object-fit: cover; cursor: pointer;" @click="openRowPreview(record, record.facePhoto)" />
                </a-space>
                <span v-else>-</span>
            </template>
            <template #qualificationPath="{ record }">
                <!-- 文件存在 -->
                <template v-if="record.qualificationPath">
                    <!-- 图片显示缩略图 -->
                    <img v-if="isImage(record.qualificationPath)" width="80" height="60" :src="record.qualificationPath"
                        class="preview-image" style="object-fit: cover; cursor: pointer;"
                        @click="openRowPreview(record, record.qualificationPath)" />
                    <!-- PDF 显示预览按钮 -->
                    <a-link v-else title="预览报名资格申请表" @click="getPreviewUrl(record.qualificationPath)">
                        预览
                    </a-link>
                </template>
                <!-- 文件不存在 -->
                <span v-else>-</span>
            </template>

            <template v-for="col in docColumns" :key="col.title" #[`doc_${col.title}`]="{ record }">
                <span v-if="record.docMap && record.docMap[col.title]" class="preview-image">
                    <template v-for="(path, index) in record.docMap[col.title].split(',')" :key="index">
                        <!-- 如果是图片 -->
                        <img v-if="isImage(path)" width="80" height="60" :src="path"
                            style="margin-right: 6px; object-fit: cover; cursor: pointer;"
                            @click="openRowPreview(record, path)" />
                        <!-- 如果是PDF -->
                        <a-link v-else title="预览文件" @click="getPreviewUrl(path)" style="margin-right:8px">
                            PDF预览
                        </a-link>
                    </template>
                </span>
                <span v-else>-</span>
            </template>
            <template #uploadException="{ record }">
                <GiCellTag :value="record.uploadException" :dict="worker_exception" />
            </template>
            <template #status="{ record }">
                <a-tag :color="getStatusColor(record.status)">
                    {{ getStatusText(record.status) }}
                </a-tag>
            </template>
            <template #applyType="{ record }">
                <a-tag :color="getApplyTypeColor(record.applyType)">
                    {{ getApplyTypeText(record.applyType) }}
                </a-tag>
            </template>
            <template #action="{ record }">
                <a-space>
                    <a-link v-permission="['worker:workerApply:review']" title="审核" @click="openReview(record)"
                        v-if="record.status == 0">审核</a-link>
                </a-space>
            </template>
        </GiTable>

        <a-modal v-model:visible="reviewVisible" title="作业人员报考资料审核" :mask-closable="false" :esc-to-close="false"
            :width="width >= 600 ? 600 : '100%'" draggable @before-ok="conformReview" @close="resetForm">
            <a-form ref="formRef" :model="form" layout="vertical">
                <a-form-item field="status" label="审核结果" :rules="[{ required: true, message: '请选择审核结果' }]">
                    <a-radio-group v-model="form.status">
                        <a-radio :value="1">审核通过</a-radio>
                        <a-radio :value="2">退回补正</a-radio>
                        <a-radio :value="3">虚假资料</a-radio>
                    </a-radio-group>
                </a-form-item>
                <a-form-item v-if="form.status === 2 || form.status === 3" field="remark"
                    :label="form.status === 2 ? '退回原因' : '虚假资料原因'"
                    :rules="[{ required: true, message: form.status === 2 ? '请填写退回原因' : '请填写虚假资料原因' }]">
                    <a-textarea v-model="form.remark" :placeholder="form.status === 2 ? '请输入退回原因' : '请输入虚假资料原因'"
                        allow-clear />
                </a-form-item>
            </a-form>
        </a-modal>

        <!-- 图片组预览弹窗 -->
        <a-modal v-model:visible="previewVisible" :footer="false" width="50%" modal-class="image-preview-modal"
            @close="closePreview">
            <template #title>
                <span>图片预览 ({{ previewIndex + 1 }} / {{ previewList.length }})</span>
            </template>
            <div class="preview-wrapper">
                <div class="preview-actions">
                    <a-button v-if="previewList.length > 1" @click="prevImage" :disabled="previewIndex === 0">
                        <template #icon><icon-left /></template>
                        上一张
                    </a-button>
                    <a-button v-if="previewList.length > 1" @click="nextImage"
                        :disabled="previewIndex === previewList.length - 1">
                        下一张
                        <template #icon><icon-right /></template>
                    </a-button>
                </div>
                <div class="preview-scroll-area">
                    <a-image :src="previewList[previewIndex]" alt="预览图片" width="650" height="650" />
                </div>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { type WorkerApplyResp, type WorkerApplyQuery, listWorkerApply, review } from '@/apis/worker/workerApply'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { Message } from '@arco-design/web-vue'
import { useResetReactive } from '@/hooks'
import { useWindowSize } from '@vueuse/core'

const { worker_exception } = useDict('worker_exception')

const emit = defineEmits<{
    (e: 'showModel', payload: any): void
}>()

defineOptions({ name: 'WorkerApply' })
const { width } = useWindowSize()
const isWelding = ref(false)

const queryForm = reactive<WorkerApplyQuery>({
    candidateName: undefined,
    applyType: undefined,
    isOrgQuery: false,
    classId: undefined
})


const {
    tableData: dataList,
    loading,
    pagination,
    search,
    select,
    selectAll,
    selectedKeys
} = useTable((page) => listWorkerApply({ ...queryForm, ...page }), { immediate: false })

const baseColumns = ref<TableInstanceColumns[]>([
    { title: '序号', dataIndex: 'sort', slotName: 'sort', },
    { title: '姓名', dataIndex: 'candidateName', slotName: 'candidateName', },
    // { title: '性别', dataIndex: 'gender', slotName: 'gender' },
    { title: '身份证号', dataIndex: 'idCardNumber', slotName: 'idCardNumber' },
    { title: '学历', dataIndex: 'education', slotName: 'education' },
    // { title: '联系电话', dataIndex: 'phone', slotName: 'phone' },
    { title: '工作单位', dataIndex: 'workUnit', slotName: 'workUnit' },
    // { title: '工作区域', dataIndex: 'address', slotName: 'address' },
    // { title: '政治面貌', dataIndex: 'politicalStatus', slotName: 'politicalStatus' },
    // { title: '报考项目', dataIndex: 'projectName', slotName: 'projectName' },
    // { title: '来源', dataIndex: 'applyType', slotName: 'applyType' },
    // { title: '身份证住址', dataIndex: 'idCardAddress', slotName: 'idCardAddress' },
    { title: '身份证信息', dataIndex: 'idCardPhotoFront', slotName: 'idCardPhotoFront', width: 200, align: 'center' },
    { title: '二寸免冠照', dataIndex: 'facePhoto', slotName: 'facePhoto', width: 100, align: 'center', },
    { title: '资格申请表', dataIndex: 'qualificationPath', slotName: 'qualificationPath', width: 100, align: 'center', },
])


const columns = computed(() => {
    const columnsTemp: TableInstanceColumns[] = [...baseColumns.value]
    if (isWelding.value) {
        columnsTemp.push({
            title: '焊接资格项目',
            dataIndex: 'weldingProjectCode',
            slotName: 'weldingProjectCode',
        })
    }
    return [
        ...columnsTemp,
        ...docColumns.value,
        // { title: '状态', dataIndex: 'status', slotName: 'status' },
        {
            title: '审核意见',
            dataIndex: 'remark',
            slotName: 'remark'
        }, { title: '资料异常', dataIndex: 'uploadException', slotName: 'uploadException' },
        {
            title: '操作',
            dataIndex: 'action',
            slotName: 'action',
            width: 160,
            align: 'center',
            fixed: !isMobile() ? 'right' : undefined,
            show: has.hasPermOr(['worker:workerApply:review'])
        }
    ]
})

const rowSelection = reactive({
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false,
    selectedRowKeys: selectedKeys,
    onChange: (keys: string[]) => {
        selectedKeys.value = keys
    }
})

const reviewIds = ref<any[]>([]);
const reviewVisible = ref(false);
const formRef = ref()

// 图片预览相关
const previewVisible = ref(false)
const previewList = ref<string[]>([])
const previewIndex = ref(0)
const previewRecord = ref<any>(null)
const rotation = ref(0)

// 旋转图片
const rotateImage = () => {
    rotation.value = (rotation.value + 90) % 360
}

// 重置旋转
const resetRotation = () => {
    rotation.value = 0
}

// 打开行图片预览
const openRowPreview = (record: WorkerApplyResp, currentImage: string) => {
    // 收集该行所有图片
    const images: string[] = []
    if (record.idCardPhotoFront && isImage(record.idCardPhotoFront)) images.push(record.idCardPhotoFront)
    if (record.idCardPhotoBack && isImage(record.idCardPhotoBack)) images.push(record.idCardPhotoBack)
    if (record.facePhoto && isImage(record.facePhoto)) images.push(record.facePhoto)
    if (record.qualificationPath && isImage(record.qualificationPath)) images.push(record.qualificationPath)

    // 收集 docMap 中的图片
    if (record.docMap) {
        Object.values(record.docMap).forEach((paths: any) => {
            const pathList = String(paths).split(',')
            pathList.forEach((p: string) => {
                if (isImage(p) && !images.includes(p)) images.push(p)
            })
        })
    }

    if (images.length === 0) {
        Message.warning('暂无图片可预览')
        return
    }

    previewRecord.value = record
    previewList.value = images
    previewIndex.value = images.indexOf(currentImage)
    if (previewIndex.value === -1) previewIndex.value = 0
    previewVisible.value = true
}

// 上一张
const prevImage = () => {
    if (previewIndex.value > 0) {
        previewIndex.value--
    }
}

// 下一张
const nextImage = () => {
    if (previewIndex.value < previewList.value.length - 1) {
        previewIndex.value++
    }
}

// 关闭预览
const closePreview = () => {
    previewVisible.value = false
    previewRecord.value = null
}
const [form, resetForm] = useResetReactive({
    status: 1,
    remark: undefined,
    reviewIds: undefined
})

// 批量审核
const batchReview = () => {
    if (selectedKeys.value.length === 0) {
        Message.warning("请选择需要审核的记录");
        return;
    }
    // 先清空
    reviewIds.value = [];
    for (const row of dataList.value) {
        if (selectedKeys.value.includes(row.id)) {
            if (row.status !== 0) {
                Message.warning("选中的记录中包含非未审核状态的数据，请重新选择");
                return;
            }
            reviewIds.value.push(row.id);
        }
    }
    // 打开批量审核弹窗
    reviewVisible.value = true;
};

// 确认审核
const conformReview = async () => {
    const isInvalid = await formRef.value?.validate()
    if (isInvalid) return false
    //构造请求参数
    form.reviewIds = reviewIds.value
    form.classId = queryForm.classId
    const res = await review(form)
    if (res.data) {
        Message.success('审核成功');
        reviewVisible.value = false;
        reviewIds.value = [];
        selectedKeys.value = []
        resetForm();
        search();
    }

};

// 打开审核弹窗
const openReview = (record: WorkerApplyResp) => {
    reviewIds.value.push(record.id);
    reviewVisible.value = true;
}

const isImage = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg|ico|tif|tiff|jfif|avif|heic|heif)(\?.*)?$/i.test(url)
}


const onOpen = async (classId: string, projectId: string) => {
    queryForm.classId = classId
    isWelding.value = projectId == '110' || projectId == '111'
    reset()

}

// 重置
const reset = () => {
    queryForm.candidateName = undefined
    queryForm.applyType = undefined
    queryForm.status = undefined
    search()
}


const getPreviewUrl = (url: string) => {
    if (!url) {
        Message.warning('暂无文件可预览');
        return;
    }

    // 提取文件扩展名
    const ext = url.split('.').pop()?.toLowerCase();

    if (ext === 'pdf') {
        //  PDF 直接在浏览器中预览
        window.open(url, '_blank');
    } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
        //  Office 文件使用微软在线预览
        const previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
        window.open(previewUrl, '_blank');
    } else {
        Message.warning('暂不支持此文件类型预览');
    }
};





const getApplyTypeColor = (status: number) => {
    switch (status) {
        case 0:
            return 'blue'
        case 1:
            return 'orange'
        default:
            return 'gray'
    }
}

const getApplyTypeText = (status: number) => {
    switch (status) {
        case 0:
            return '扫码报考'
        case 1:
            return '机构报考'
        default:
            return ''
    }
}

const getStatusText = (status: number) => {
    switch (status) {
        case 0:
            return '未审核'
        case 1:
            return '审核通过'
        case 2:
            return '审核不通过'
        case 3:
            return '虚假材料'
        case 4:
            return '待提交资料'
        case 5:
            return '资料已上传'
        default:
            return ''
    }
}


const getStatusColor = (status: number) => {
    switch (status) {
        case 0:
            return 'blue'
        case 1:
            return 'green'
        case 2:
            return 'orange'
        case 3:
            return 'red'
        case 4:
            return 'purple'
        case 5:
            return 'blue'
        default:
            return 'gray'
    }
}
const docColumns = computed(() => {
    const allDocNames = new Set<string>()
    dataList.value.forEach(item => {
        if (item.docMap) {
            Object.keys(item.docMap).forEach(key => allDocNames.add(key))
        }
    })
    return Array.from(allDocNames).map(name => ({
        title: name,
        dataIndex: name,
        slotName: `doc_${name}`,
        align: 'center'
    }))
})


defineExpose({ onOpen })
</script>

<style scoped>
.arco-modal-body {
    padding: 0;
}

.preview-image {
    display: flex;
    /* 横向排列 */
    flex-wrap: wrap;
    /* 空间不足自动换行 */
    gap: 8px;
    /* 图片间距，可调 */
}

/* 图片预览弹窗样式 */
.preview-wrapper {
    display: flex;
    flex-direction: column;
    height: 680px;
}

.preview-actions {
    display: flex;
    gap: 16px;
    padding: 12px 0;
    justify-content: center;
    flex-shrink: 0;
}

.preview-scroll-area {
    flex: 1;
    overflow: auto;
    display: flex;
    justify-content: center;
    align-items: flex-start;
}

.preview-main-image {
    object-fit: contain;
    display: block;
}
</style>