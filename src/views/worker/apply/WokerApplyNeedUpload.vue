<template>
    <div>
        <!-- 基本信息选择卡片 -->
        <div class="doc-card info-card">
            <div class="form-item">
                <span class="form-label">学历</span>
                <a-select v-model="form.education" :options="educationOptions" placeholder="请选择学历"
                    style="width: 100%;" />
            </div>
            <div class="form-item">
                <span class="form-label">工作单位</span>
                <a-input v-model="form.workUnit" placeholder="请输入工作单位" style="width: 100%;" />
            </div>
            <div class="form-item">
                <span class="form-label">工作区域</span>
                <a-select v-model="form.address" :options="workAreaOptions" placeholder="请选择工作区域"
                    style="width: 100%;" />
            </div>

            <div class="form-item">
                <span class="form-label">政治面貌</span>
                <a-select v-model="form.politicalStatus" :options="politicalStatusOptions" placeholder="请选择政治面貌"
                    style="width: 100%;" />
            </div>
            <div class="form-item" v-if="weldingProjectCodes && weldingProjectCodes.length">
                <span class="form-label">焊接资格项目</span>
                <a-select v-model="form.weldingProjectCode" :options="weldingProjectOptions" placeholder="请选择焊接资格项目"
                    multiple style="width: 100%;" />
            </div>
        </div>


        <div class="tips-card idCard-warning-tips">
            <div class="tips-icon">⚠️</div>
            <div class="tips-text">
                请上传身份证及二寸免冠照片，用于考试身份验证。<br>
                <span class="warning-tag">证件信息不符将影响正常考试。</span>
            </div>
        </div>
        <div class="doc-card-id">
            <div class="upload-item">
                <div class="doc-info">
                    <span class="doc-name">身份证人像面</span>
                </div>
                <div class="upload-wrapper">
                    <a-upload :action="`${uploadUrl}1`" list-type="picture-card" :file-list="frontFileList"
                        :show-upload-list="false" accept="image/jpeg,image/png,image/jpg" @success="handleFrontSuccess"
                        image-preview :max="1" :limit="1">
                        <img v-if="form.idCardPhotoFront" :src="form.idCardPhotoFront" alt="front"
                            style="width: 100%;height: auto;" />
                        <div v-else>
                            <plus-outlined />
                            <div style="margin-top: 8px;">上传正面</div>
                        </div>
                        <template #upload-button>
                            <div class="upload-btn">
                                <IconPlus class="upload-icon" />
                                <span class="upload-text">上传</span>
                            </div>
                        </template>
                    </a-upload>
                </div>
            </div>
            <div class="upload-item">
                <div class="doc-info">
                    <span class="doc-name">身份证国徽面</span>
                </div>
                <div class="upload-wrapper">
                    <a-upload :action="`${uploadUrl}0`" list-type="picture-card" :file-list="backFileList"
                        :show-upload-list="false" accept="image/jpeg,image/png,image/jpg" @success="handleBackSuccess"
                        image-preview :max="1" :limit="1">
                        <img v-if="form.idCardPhotoBack" :src="form.idCardPhotoBack" alt="back"
                            style="width: 100%;height: auto;" />
                        <div v-else>
                            <plus-outlined />
                            <div style="margin-top: 8px;">上传反面</div>
                        </div>
                        <template #upload-button>
                            <div class="upload-btn">
                                <IconPlus class="upload-icon" />
                                <span class="upload-text">上传</span>
                            </div>
                        </template>
                    </a-upload>
                </div>
            </div>

            <div class="upload-item">
                <div class="doc-info">
                    <span class="doc-name">二寸免冠照</span>
                </div>
                <div class="upload-wrapper">
                    <a-upload :action="`${uploadUrl}2`" list-type="picture-card" :file-list="faceFileList"
                        :show-upload-list="false" accept="image/jpeg,image/png,image/jpg" @success="handleFaceSuccess"
                        image-preview :max="1" :limit="1">
                        <img v-if="form.facePhoto" :src="form.facePhoto" alt="face" style="width: 100%;height: auto;" />
                        <div v-else>
                            <plus-outlined />
                            <div style="margin-top: 8px;">上传人脸照</div>
                        </div>
                        <template #upload-button>
                            <div class="upload-btn">
                                <IconPlus class="upload-icon" />
                                <span class="upload-text">上传</span>
                            </div>
                        </template>
                    </a-upload>
                </div>
            </div>
        </div>
        <div class="tips-card warning-tips">
            <div class="tips-icon">⚠️</div>
            <div class="tips-text">
                请上传报名资格申请表（<span class="format-tag">仅支持上传图片或PDF格式文件</span>），且不能提供虚假材料。<br>
                <span class="warning-tag">提供虚假资料者，资料退回后将不可再次申报！</span>
            </div>
        </div>
        <div class="doc-card form-card">
            <div class="doc-info">
                <span class="doc-name">报名资格申请表</span>
                <span class="upload-count">
                    {{ (formFileList || []).length }}/1
                </span>
            </div>

            <div class="upload-wrapper">
                <a-upload list-type="text" :file-list="formFileList"
                    :custom-request="(options) => handleFormUpload(options)" @before-remove="handleFormRemove"
                    :disabled="formFileList.length >= 1" accept=".pdf,.jpg,.jpeg,.png" draggable>
                </a-upload>
            </div>
        </div>
        <div v-if="projectNeedUploadDocs.length > 0 && form.idCardNumber">
            <div class="tips-card">
                <div class="tips-icon">💡</div>
                <div class="tips-text">
                    以下为您报考时<span class="highlight">缺少的资料</span>，请按类型补传：
                    每种资料至少1张、最多3张，仅支持图片格式。
                </div>
            </div>
            <div class="doc-card" v-for="item in projectNeedUploadDocs" :key="item.id"
                @mouseenter="cardHovered = item.id" @mouseleave="cardHovered = ''">
                <div class="doc-info">
                    <span class="doc-name">
                        {{ item.typeName }}
                        <span v-if="isUploadRequired(item.needUploadPerson, isBeijing)" class="required-star">*</span>
                    </span>
                    <span class="upload-count">
                        {{ (fileListMap[item.id] || []).length }}/3
                    </span>
                </div>

                <div class="upload-wrapper">
                    <a-upload list-type="picture-card" :file-list="fileListMap[item.id] || []"
                        :custom-request="(options) => handleUpload(options, item, 'image')"
                        @before-remove="(file) => handleRemove(file, item)" :accept="'image/*'" image-preview
                        :show-remove-icon="true" capture="environment" :max="3" :limit="3">
                        <template #upload-button>
                            <div class="upload-btn" :class="{
                                disabled: (fileListMap[item.id] || []).length >= 3,
                                hover: cardHovered === item.id && (fileListMap[item.id] || []).length < 3
                            }">
                                <IconPlus class="upload-icon" />
                                <span class="upload-text">上传</span>
                            </div>
                        </template>
                    </a-upload>
                </div>
            </div>
        </div>
        <a-modal v-model:visible="showDialog" title="身份验证" :mask-closable="false" :footer="false" width="90%"
            @close="verifyIdCardClose">
            <div style="text-align:center;">
                <a-input-password v-model="idCard" placeholder="请输入身份证" :max-length="18" allow-clear
                    style="width: 90%" />
            </div>
            <div style="text-align:right; margin-top: 20px;">
                <a-button type="dashed" status="danger" @click="restUploadIdCard">重新上传身份证</a-button>
                <a-button type="primary" @click="verifyIdCard" style="margin-left: 10px;">验证</a-button>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed, h } from 'vue'
import { Modal, Message, Input } from '@arco-design/web-vue'
import { applyUpload } from '@/apis/file/personFile'
import { workerSumbitUpload, workerRestSumbitUpload } from '@/apis/worker/workerApply'
import { encryptByRsa } from '@/utils/encrypt'

const showDialog = ref(false)
const props = defineProps<{
    projectNeedUploadDocs: any[],
    weldingProjectCodes: any[]
    classId: string | number
}>()

const emit = defineEmits<{
    (e: 'isAllUploaded', payload: any): void
    (e: 'submitAfter', payload: string): void
    (e: 'switchPhoneVerify', payload: boolean): void
    (e: 'updateIdCard', payload: string): void
}>()

const uploadUrl = `${import.meta.env.VITE_API_PREFIX}/upload/file/idCard/`

// 报名资格申请表专属文件列表（最多1个）
const formFileList = ref<any[]>([])
const fileListMap = reactive<Record<string, any[]>>({})
const cardHovered = ref('')

const frontFileList = ref<any[]>([])
const backFileList = ref<any[]>([])
const faceFileList = ref<any[]>([])
const idCard = ref('')
const parentIdCard = ref('')
const flag = ref(true)
const form = ref({
    realName: '',
    gender: '',
    idCardAddress: '',
    idCardNumber: '',
    idCardPhotoFront: '',
    idCardPhotoBack: '',
    facePhoto: '',
    docFileList: [] as { typeId: string; urls: string[] }[],
    qualificationFileUrl: undefined,
    phone: '',
    classId: props.classId,
    qualificationName: '',
    address: '东城区',
    workUnit: '',
    education: '本科',
    politicalStatus: '群众',
    weldingProjectCode: []
})
const workAreaOptions = ref([
    { label: '东城区', value: '东城区' },
    { label: '西城区', value: '西城区' },
    { label: '朝阳区', value: '朝阳区' },
    { label: '丰台区', value: '丰台区' },
    { label: '石景山区', value: '石景山区' },
    { label: '海淀区', value: '海淀区' },
    { label: '顺义区', value: '顺义区' },
    { label: '通州区', value: '通州区' },
    { label: '大兴区', value: '大兴区' },
    { label: '房山区', value: '房山区' },
    { label: '门头沟区', value: '门头沟区' },
    { label: '昌平区', value: '昌平区' },
    { label: '大兴区', value: '大兴区' },
    { label: '平谷区', value: '平谷区' },
    { label: '密云区', value: '密云区' },
    { label: '延庆区', value: '延庆区' },
])
const educationOptions = ref([
    { label: '小学', value: '小学' },
    { label: '初中', value: '初中' },
    { label: '高中', value: '高中' },
    { label: '专科', value: '丰台区' },
    { label: '本科', value: '本科' },
    { label: '研究生', value: '研究生' },
])
const politicalStatusOptions = ref([
    { label: '中共党员', value: '中共党员' },
    { label: '共青团员', value: '共青团员' },
    { label: '群众', value: '群众' }
])
const temporary = ref('')
const isBeijing = ref(false)

const weldingProjectOptions = computed(() => {
    return props.weldingProjectCodes.map(code => ({
        label: code,
        value: code
    }));
});

// 提交上传
const submitUpload = async (phone: string, idCard: string, isRestUpload: boolean) => {
    if (!checkIdCard(form.value.idCardNumber, idCard)) {
        Message.error("上传的身份证与填写的身份证不匹配，请选择操作方式。");
        parentIdCard.value = idCard;
        // if (isRestUpload) {
        showDialog.value = true;
        // }
        emit('switchPhoneVerify', false)
        return;
    }
    form.value.phone = phone
    form.value.docFileList = Object.entries(fileListMap).map(([typeId, files]) => ({
        typeId,
        urls: files.map(f => f.url)
    }))
    temporary.value = form.value.idCardNumber
    form.value.idCardNumber = encryptByRsa((form.value.idCardNumber) || '')
    form.value.phone = encryptByRsa((form.value.phone) || '')
    try {
        const res = isRestUpload ? await workerRestSumbitUpload(form.value) : await workerSumbitUpload(form.value)
        if (res.data) {
            Message.success("提交成功")
            emit('switchPhoneVerify', false)
            emit('submitAfter', temporary.value)
            temporary.value = ''
        }
    } catch (error) {
        if (error.message == '您已提交过报名，请勿重复提交！') {
            emit('submitAfter', temporary.value)
            emit('switchPhoneVerify', false)
        }
    } finally {
        form.value.idCardNumber = temporary.value
    }
}

const ID_CARD_REGEX = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]?$/;

// 校验两个身份证是否是一个
const verifyIdCard = async () => {
    if (!ID_CARD_REGEX.test(idCard.value)) {
        Message.warning("身份证格式不正确")
        return
    }
    if (!checkIdCard(form.value.idCardNumber, idCard.value)) {
        Message.error("上传的身份证与填写的身份证不匹配，请选择操作方式。");
    } else {
        showDialog.value = false;
        emit('switchPhoneVerify', true)
        emit("updateIdCard", idCard.value)
    }
}

const restUploadIdCard = () => {
    frontFileList.value = []
    backFileList.value = []
    form.value.realName = ''
    form.value.gender = ''
    form.value.idCardNumber = ''
    form.value.idCardPhotoFront = ''
    form.value.idCardPhotoBack = ''
    showDialog.value = false
    flag.value = false
    emit('switchPhoneVerify', false)
}


const verifyIdCardClose = () => {
    idCard.value = ""
    showDialog.value = false;
    emit('switchPhoneVerify', (true && flag.value))
}
const checkIdCard = (uploadedId: string | undefined, inputIdCard: string) => {
    let checkRes = uploadedId == inputIdCard;
    return checkRes;
}

const isWeldingProjectCodeFilled = computed(() => {
    // 只有为焊接项目的才需要判断有没有选
    if (!props.weldingProjectCodes || props.weldingProjectCodes.length === 0) {
        return true;
    }
    // 多选字段必须至少选择一个
    return Array.isArray(form.value.weldingProjectCode) && form.value.weldingProjectCode.length > 0;
});

const isAllUploaded = computed(() => {
    // 1. 基本信息必填
    const isAddressFilled = !!form.value.address?.trim();
    const isWorkUnitFilled = !!form.value.workUnit?.trim();
    const isEducationFilled = !!form.value.education?.trim();
    const isPoliticalStatusFilled = !!form.value.politicalStatus?.trim();

    // 1. 项目资料：逐个判断是否需要上传
    const isImageAllUploaded = props.projectNeedUploadDocs.every(item => {
        const needUpload = isUploadRequired(item.needUploadPerson, isBeijing.value);

        // 不需要上传，直接通过
        if (!needUpload) return true;

        // 需要上传，必须至少 1 个文件
        return (fileListMap[item.id] || []).length >= 1;
    });

    // 2. 其他通用必传资料
    const isFormUploaded = formFileList.value.length >= 1;
    const isIdCardUploaded = frontFileList.value.length >= 1;
    const isBackUploaded = backFileList.value.length >= 1;
    const isFaceUploaded = faceFileList.value.length >= 1;

    return (
        isAddressFilled &&
        isWorkUnitFilled &&
        isEducationFilled &&
        isPoliticalStatusFilled &&
        isWeldingProjectCodeFilled.value &&
        isImageAllUploaded &&
        isFormUploaded &&
        isIdCardUploaded &&
        isBackUploaded &&
        isFaceUploaded
    );
});

const isUploadRequired = (needUploadPerson: number, isBeijing: boolean) => {
    switch (needUploadPerson) {
        case 0: // 全部需要
            return true;
        case 1: // 仅京籍
            return isBeijing;
        case 2: // 仅非京籍
            return !isBeijing;
        default:
            return false;
    }
};


// 计算是否所有资料（图片类+申请表）都已上传
// const isAllUploaded = computed(() => {
//     const isImageAllUploaded = props.projectNeedUploadDocs.every(item =>
//         (fileListMap[item.id] || []).length >= 1
//     )
//     const isFormUploaded = formFileList.value.length >= 1
//     const isIdCardUploaded = frontFileList.value.length >= 1
//     const isBackFileList = backFileList.value.length >= 1
//     const isFaceUploaded = faceFileList.value.length >= 1
//     return isImageAllUploaded && isFormUploaded && isIdCardUploaded && isFaceUploaded && isBackFileList
// })

// 报名资格申请表上传（单独处理）
const handleFormUpload = async (options: any) => {
    const file = options.fileItem.file

    const fileExt = file.name.split('.').pop()?.toLowerCase()

    // 允许的格式：PDF + 图片
    const allowedExt = ['pdf', 'jpg', 'jpeg', 'png']

    if (!allowedExt.includes(fileExt || '')) {
        Message.warning('仅支持上传 PDF 或 图片（JPG/PNG）格式')
        options.onError?.()
        return
    }

    const formData = new FormData()
    formData.append('file', file)

    const res = await applyUpload(formData)
    const fileUrl = res.data.url

    if (res.data) {
        Message.success('报名资格申请表 上传成功')
        options.onSuccess?.()

        formFileList.value.push({
            uid: options.fileItem.uid,
            name: file.name,
            url: fileUrl,
        })

        form.value.qualificationName = file.name
        form.value.qualificationFileUrl = fileUrl
    } else {
        options.onError?.()
    }
}

// 报名资格申请表删除
const handleFormRemove = (file: any) => {
    // 直接过滤掉要删除的文件，重新赋值触发响应式
    formFileList.value = formFileList.value.filter(f => f.uid !== file.uid)
}

// 上传成功 - 正面
const handleFrontSuccess = (file: any) => {
    const res = file.response
    if (res?.code !== "0") {
        Message.error(res?.msg || '上传失败')
        form.value.idCardPhotoFront = ''
        frontFileList.value = []
        return
    }
    form.value.idCardPhotoFront = res.data.url
    frontFileList.value = [file]
    const data = res.data
    form.value.realName = data.realName || ''
    form.value.gender = data.gender || ''
    form.value.idCardNumber = data.idCardNumber || ''
    form.value.idCardAddress = data.address || ''
    isBeijing.value = data.address?.startsWith('北京市');
    Message.success('身份证正面 上传成功')
}

// 上传成功 - 反面
const handleBackSuccess = (file: any) => {
    const res = file.response
    if (res?.code !== "0") {
        Message.error(res?.msg || '上传失败')
        form.value.idCardPhotoBack = ''
        backFileList.value = []
        return
    }
    form.value.idCardPhotoBack = res.data.url
    backFileList.value = [file]
    Message.success('身份证反面 上传成功')
}

// 上传成功 - 人脸证件照
const handleFaceSuccess = (file: any) => {
    const res = file.response
    if (res?.code !== "0") {
        Message.error(res?.msg || '上传失败')
        form.value.facePhoto = ''
        faceFileList.value = []
        return
    }
    form.value.facePhoto = res.data.url
    faceFileList.value = [file]
    Message.success('二寸免冠照 上传成功')
}

// 图片类资料上传
const handleUpload = async (options: any, item: any, type: string) => {
    const file = options.fileItem.file
    // 格式校验（图片类）
    if (type === 'image' && !file.type.startsWith('image/')) {
        Message.warning(`${item.typeName} 仅支持图片格式`)
        options.onError?.()
        return
    }
    // 数量校验
    if ((fileListMap[item.id] || []).length >= 3) {
        Message.warning(`${item.typeName} 最多只能上传3张文件`)
        options.onError?.()
        return
    }

    const formData = new FormData()
    formData.append('file', file)
    const res = await applyUpload(formData);
    if (res.data) {
        Message.success(`${item.typeName} 上传成功`)
        options.onSuccess?.()
        if (!fileListMap[item.id]) fileListMap[item.id] = []
        fileListMap[item.id].push({
            uid: options.fileItem.uid,
            url: res.data.url,
            name: file.name,
        })
    } else {
        options.onError?.()
    }
}
// 图片类资料删除
const handleRemove = (file: any, item: any) => {
    fileListMap[item.id] = (fileListMap[item.id] || []).filter(
        (f) => f.uid !== file.uid
    )
}

// 监听计算结果变化，通知父组件
watch(isAllUploaded, (newVal) => {
    emit('isAllUploaded', newVal)
})

function getFormIdcard() {
    return form.value.idCardNumber
}
defineExpose({ submitUpload, getFormIdcard })
</script>

<style scoped>
.doc-card.info-card {
    background: #f0f8ff;
    /* 淡蓝色背景 */
    border-left: 4px solid #1890ff;
    /* 深蓝色左边框 */
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.doc-card.info-card .form-item {
    display: flex;
    align-items: center;
    gap: 12px;
}

.doc-card.info-card .form-label {
    width: 80px;
    font-weight: 500;
    color: #1d2129;
}



.tips-card {
    background: #edf2ff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
}

/* 申请表提示用橙色背景，增强警示 */
.tips-card.warning-tips {
    background: #fff8f0;
    border-left: 4px solid #ff7d00;
}

.tips-card.idCard-warning-tips {
    background: #f0f8ff;
    border-left: 4px solid #1890ff;
}

.tips-icon {
    font-size: 18px;
    margin-top: 1px;
}

.tips-card.warning-tips .tips-icon {
    color: #ff7d00;
}

.tips-text {
    color: #1d2129;
    line-height: 1.5;
    flex: 1;
}

.tips-text .highlight {
    color: #165dff;
    font-weight: 500;
}

.tips-text .format-tag {
    color: #165dff;
    font-weight: 500;
}

.tips-text .warning-tag {
    color: #f53f3f;
    font-weight: 500;
}

/* 资料上传卡片（通用） */
.doc-card {
    background: #fff;
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.3s ease, transform 0.2s ease;
}

.doc-card-id {
    background: #fff;
    border-radius: 16px;
    padding: 18px;
    margin-bottom: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.3s ease, transform 0.2s ease;
    display: flex;
    justify-content: space-around;
    align-items: flex-start;
    gap: 24px;
    flex-wrap: nowrap;
}

.upload-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.doc-info-id {
    margin-bottom: 8px;
    text-align: center;
}

.doc-name-id {
    font-size: 14px;
    color: #1d2129;
    font-weight: 500;
}

.upload-wrapper-id {
    width: 100%;
}

.upload-btn-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 120px;
    border: 1px dashed #c0c4cc;
    border-radius: 8px;
    transition: all 0.3s ease;
}

.upload-btn-icon:hover {
    border-color: #3b82f6;
    background-color: #f0f7ff;
}

.icon {
    font-size: 24px;
    color: #9ca3af;
    margin-bottom: 6px;
}

.upload-tip {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
}


/* 申请表卡片单独样式 */
.doc-card.form-card {
    margin-top: 8px;
}

.doc-card:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
}

.doc-info {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
}

.doc-name {
    font-weight: 500;
    font-size: 15px;
    color: #1d2129;
}

.upload-count {
    font-size: 12px;
    color: #6e7191;
    background-color: #f2f3f5;
    padding: 3px 10px;
    border-radius: 12px;
    transition: background-color 0.3s;
}

.doc-card:hover .upload-count {
    background-color: #e8ebf0;
}

/* 上传区域（通用） */
.upload-wrapper {
    width: 100%;
}

.upload-component {
    --upload-item-margin-right: 12px;
    --upload-item-margin-bottom: 12px;
}

/* 图片类上传按钮 */
.upload-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #86909c;
    width: 80px;
    height: 80px;
    background-color: #f7f8fa;
    border-radius: 12px;
    transition: all 0.3s ease;
}

.upload-btn.hover {
    background-color: #edf2ff;
    color: #165dff;
    transform: translateY(-2px);
}

.upload-btn.disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: #f7f8fa;
    color: #86909c;
    transform: none;
}

.upload-icon {
    font-size: 20px;
    margin-right: 6px;
}

.upload-text {
    font-size: 12px;
}

/* 申请表上传按钮 */
.form-upload-btn {
    background-color: #f7f8fa;
    color: #86909c;
    border-color: #e5e6eb;
    border-radius: 8px;
    padding: 8px 16px;
    transition: all 0.3s;
}

.form-upload-btn:hover:not(:disabled) {
    background-color: #edf2ff;
    color: #165dff;
    border-color: #c9d5ff;
}

/* 申请表文件列表样式 */
.form-file-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background-color: #f7f8fa;
    border-radius: 8px;
    margin-top: 8px;
    gap: 12px;
}

.form-file-item .file-icon {
    color: #165dff;
    font-size: 18px;
}

.form-file-item .file-name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #1d2129;
}

.form-file-item .file-size {
    color: #6e7191;
    font-size: 12px;
}

.form-file-item .file-remove {
    color: #86909c;
    cursor: pointer;
    transition: color 0.3s;
}

.form-file-item .file-remove:hover {
    color: #f53f3f;
}

/* 底部按钮 */
.footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: #f9fafb;
    padding: 12px 16px;
    box-sizing: border-box;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
    border-top: 1px solid #f0f0f0;
}

.confirm-btn {
    width: 100%;
    height: 48px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 500;
    background-color: #165dff;
    border-color: #165dff;
    transition: all 0.3s;
}

.confirm-btn:hover:not(:disabled) {
    background-color: #0e4bdb;
    border-color: #0e4bdb;
    transform: translateY(-1px);
}

.confirm-btn:disabled {
    background-color: #c9d1e0;
    border-color: #c9d1e0;
    color: #fff;
    cursor: not-allowed;
}

.required-star {
    color: red;
    margin-left: 2px;
}

/* 小屏手机适配 */
@media (max-width: 375px) {
    .upload-btn {
        width: 70px;
        height: 70px;
    }

    .form-file-item {
        flex-wrap: wrap;
        gap: 8px;
    }

    .form-file-item .file-size {
        width: 100%;
        margin-top: -4px;
    }

    .confirm-btn {
        height: 44px;
        font-size: 15px;
    }

    .tips-text {
        font-size: 13px;
    }
}
</style>