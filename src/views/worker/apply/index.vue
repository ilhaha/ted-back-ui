<template>
    <div class="upload-page">
        <div class="title-bar">
            <h2 class="page-title">{{ title }}</h2>
        </div>

        <div class="scroll-container">
            <WorkerApplySearch ref="workerApplySearchRef" :classId='classId' @verifiedResult=handVerifiedResult
                @switchPhoneVerify="handSwitchPhoneVerify" />

            <div class="info-card" v-if="projectInfo">
                <div class="info-header">
                    <span class="info-tag">报名信息</span>
                </div>
                <div class="info-content">
                    <p class="exam-info">
                        <span v-if="candidateName">{{ candidateName }}<br></span>
                        {{ projectInfo.categoryName || '' }} /
                        {{ projectInfo.projectName || '' }} /
                        <span class="project-code">{{ projectInfo.className || '' }}</span>
                    </p>
                </div>
            </div>

            <WokerApplyNeedUpload ref="WokerApplyNeedUploadRef" :projectNeedUploadDocs="projectNeedUploadDocs"
                :weldingProjectCodes="weldingProjectCodes" :classId="classId" @isAllUploaded="handIsAllUploaded"
                @switchPhoneVerify="handSwitchPhoneVerify" @updateIdCard="hanldUpdateIdCard"
                @submitAfter="handSubmitAfter" v-if="!workerUploadedDocs && projectInfo" />

            <WokerApplyUploaded ref="WokerApplyUploadedRef" :workerUploadedDocs="workerUploadedDocs"
                v-if="workerUploadedDocs" />
        </div>
    </div>
    <div class="footer">
        <a-button type="primary" size="large" class="confirm-btn" :disabled="isAllUploaded"
            @click="openPhoneVerifiedModel" v-if="projectInfo && !workerUploadedDocs">
            确认提交
        </a-button>
        <a-button type="primary" size="large" class="confirm-btn" @click="restUpload"
            v-if="workerUploadedDocs && workerUploadedDocs.status == 2">
            重新提交
        </a-button>
    </div>

    <a-modal v-model:visible="phoneVerifiedModel" :mask-closable="false" :width="400" draggable :footer="false"
        :closable="false">
        <template #title>
            身份认证
        </template>
        <div>
            <a-form ref="phoneVerifiedRef" class="login-form" :rules="phoneVerifiedRules" :model="phoneVerifiedForm"
                :style="{ width: '350px' }" @submit="phoneVerifiedSubmit">
                <a-form-item field="phone" label="手机号" validate-trigger="blur">
                    <a-input v-model="phoneVerifiedForm.phone" :max-length="11" placeholder="请输入手机号" allow-clear />
                </a-form-item>
                <a-form-item field="captcha" label="验证码">
                    <a-input v-model="phoneVerifiedForm.captcha" :max-length="4" placeholder="请输入验证码" allow-clear />
                    <a-button class="captcha-btn" :loading="captchaLoading" :disabled="captchaDisable" size="large"
                        style="margin-left: 10px;" @click="onCaptcha">
                        {{ captchaBtnName }}
                    </a-button>
                </a-form-item>
                <a-form-item>
                    <a-space>
                        <a-button @click="cancelPhoneVerified">取消</a-button>
                        <a-button type="primary" :loading="loading" html-type="submit">确认</a-button>
                    </a-space>
                </a-form-item>
                <Verify ref="verifyRef" :captcha-type="captchaType" :mode="captchaMode"
                    :img-size="{ width: '330px', height: '155px' }" @success="getCaptcha" />
            </a-form>
        </div>
    </a-modal>
</template>

<script setup lang="ts">
import WorkerApplySearch from './WorkerApplySearch.vue';
import WokerApplyNeedUpload from './WokerApplyNeedUpload.vue';
import WokerApplyUploaded from './WokerApplyUploaded.vue';
import { ref, onMounted, reactive, computed, h, inject } from 'vue'
import { type BehaviorCaptchaReq, getApplySmsCaptchaStatus, getApplySmsCaptcha } from '@/apis'
import * as Regexp from '@/utils/regexp'
import { useRoute } from 'vue-router'
import { Message, Modal } from '@arco-design/web-vue'
import { encryptByRsa } from '@/utils/encrypt'
const route = useRoute()
const title = ref('作业人员报考资料补全');
const classId = ref('')
const projectNeedUploadDocs = ref<any[]>([])
const weldingProjectCodes = ref<any[]>([])
const projectInfo = ref<any>()
const workerUploadedDocs = ref<any>()
const isAllUploaded = ref(true)
const phoneVerifiedModel = ref(false)
const loading = ref(false)
// 点击验证码动画
const captchaLoading = ref(false)
// 验证码按钮
const captchaDisable = ref(false)
const captchaTimer = ref()
// 下次获取验证码等待时间
const captchaTime = ref(60)
const verifyRef = ref<InstanceType<any>>()
const captchaType = ref('blockPuzzle')
const captchaMode = ref('pop')
const captchaBtnName = ref('获取验证码')
const phoneVerifiedRef = ref(null)
const idCard = ref('')
const isRestUpload = ref(false)
const candidateName = ref('')
// 手机号验证数据
const phoneVerifiedForm = reactive({
    phone: '',
    captcha: '',
})

// 表单验证规则
const phoneVerifiedRules = {
    phone: [
        { required: true, message: '请输入手机号' },
        { match: Regexp.Phone, message: '请输入正确的手机号' },
    ],
    captcha: [{ required: true, message: '请输入验证码' }],
}

const resetForm = () => {
    Object.assign(phoneVerifiedForm, {
        phone: '',
        captcha: '',
    })
}

// 重新提交
const restUpload = () => {
    Modal.confirm({
        title: '确认重新上传？',
        content: '重新上传将清空已提交的材料，是否继续？',
        okText: '确认',
        cancelText: '取消',
        onOk() {
            isRestUpload.value = true
            workerUploadedDocs.value = undefined
        },
    })
}
// 获取验证码
const getCaptcha = async (captchaReq: BehaviorCaptchaReq) => {
    try {
        captchaLoading.value = true
        captchaBtnName.value = '发送中...'
        // 这里需要调用接口获取验证码
        await getApplySmsCaptcha(phoneVerifiedForm.phone, captchaReq, encryptByRsa(WokerApplyNeedUploadRef.value?.getFormIdcard()))
        captchaLoading.value = false
        captchaDisable.value = true
        captchaBtnName.value = `获取验证码(${(captchaTime.value -= 1)}s)`
        Message.success('短信发送成功')
        captchaTimer.value = window.setInterval(() => {
            captchaTime.value -= 1
            captchaBtnName.value = `获取验证码(${captchaTime.value}s)`
            if (captchaTime.value <= 0) {
                resetCaptcha()
            }
        }, 1000)
    } catch (e) {
        resetCaptcha()
    } finally {
        captchaLoading.value = false
    }
}

// 重置验证码
const resetCaptcha = () => {
    window.clearInterval(captchaTimer.value)
    captchaTime.value = 60
    captchaBtnName.value = '获取验证码'
    captchaDisable.value = false
}

// 弹出行为验证码
const onCaptcha = async () => {
    if (captchaLoading.value) return
    const isInvalid = await phoneVerifiedRef.value?.validateField('phone')
    if (isInvalid) return
    // 重置行为参数
    verifyRef.value.instance.refresh()
    verifyRef.value.show()
}

// 取消上传
const cancelPhoneVerified = () => {
    resetForm()
    phoneVerifiedRef.value.resetFields()
    phoneVerifiedModel.value = false
}

const WokerApplyNeedUploadRef = ref<InstanceType<typeof WokerApplyNeedUpload>>()
const workerApplySearchRef = ref<InstanceType<typeof WorkerApplySearch>>()
const WokerApplyUploadedRef = ref<InstanceType<typeof WokerApplyUploaded>>()

// 提交表单确认上传
const phoneVerifiedSubmit = async ({ values, errors }) => {
    try {
        if (errors) {
            return
        }
        loading.value = true
        const data = {
            phone: encryptByRsa(values.phone),
        }
        const res = await getApplySmsCaptchaStatus(data.phone, values.captcha)
        if (!res.data) {
            Message.error('验证码错误')
            return
        }
        WokerApplyNeedUploadRef.value?.submitUpload(phoneVerifiedForm.phone, idCard.value, isRestUpload.value)
    } finally {
        loading.value = false
    }
}
const openPhoneVerifiedModel = () => {
    phoneVerifiedModel.value = true
}

const handSubmitAfter = (res: any) => {
    workerApplySearchRef.value?.setIdCard(res, false)
}

const hanldUpdateIdCard = (res: any) => {
    idCard.value = res
    workerApplySearchRef.value?.setIdCard(res, true)
}

const handSwitchPhoneVerify = (res: any) => {
    phoneVerifiedModel.value = res
}

const handIsAllUploaded = (res: any) => {
    isAllUploaded.value = !res
}

const handVerifiedResult = (res: any) => {
    projectNeedUploadDocs.value = res.projectNeedUploadDocs
    workerUploadedDocs.value = res.workerUploadedDocs
    projectInfo.value = res.projectInfo
    candidateName.value = res.workerUploadedDocs ? res.workerUploadedDocs.candidateName : ''
    weldingProjectCodes.value = res.weldingProjectCodes
    idCard.value = res.idCard
}


onMounted(() => {
    classId.value = decodeURIComponent(String(route.query.classId || ''))
    if (classId.value == '') {
        Message.error('二维码错误，请重新获取')
    }
})

</script>

<style scoped>
.status-text {
    font-weight: 500;
    font-size: 14px;
}

/* 页面基础样式 */
.upload-page {
    display: flex;
    flex-direction: column;
    padding: 0;
    font-size: 14px;
    background-color: #f9fafb;
    min-height: 100vh;
    box-sizing: border-box;
    overflow: hidden;
    padding-top: env(safe-area-inset-top);
    padding-bottom: env(safe-area-inset-bottom);
}

/* 标题栏 */
.title-bar {
    width: 100%;
    padding: 16px 0;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    margin-bottom: 16px;
}

.page-title {
    font-size: 18px;
    font-weight: 600;
    text-align: center;
    color: #1d2129;
    margin: 0;
}

/* 滚动容器 */
.scroll-container {
    flex: 1;
    width: 100%;
    padding: 0 10px;
    overflow-y: auto;
    box-sizing: border-box;
    scroll-behavior: smooth;
    padding-bottom: 90px;
}

/* 滚动条美化 */
.scroll-container::-webkit-scrollbar {
    width: 4px;
}

.scroll-container::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 2px;
}

.scroll-container::-webkit-scrollbar-thumb {
    background: #c9c9c9;
    border-radius: 2px;
}

.scroll-container::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

/* 报考信息卡片 */
.info-card {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.info-header {
    margin-bottom: 12px;
}

.info-tag {
    font-size: 12px;
    color: #6e7191;
    font-weight: 500;
    padding: 2px 8px;
    background-color: #f2f3f5;
    border-radius: 8px;
}

.info-content {
    line-height: 1.6;
}

.user-name {
    color: #1d2129;
    font-weight: 500;
    margin: 0 0 8px 0;
}

.exam-info {
    color: #4e5969;
    margin: 0;
    word-break: break-all;
}

.project-code {
    color: #165dff;
    font-weight: 500;
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

/deep/ .arco-form-item-content-flex {
    justify-content: end
}
</style>