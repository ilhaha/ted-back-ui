<template>
    <div class="page-container">
        <!-- 身份验证弹窗 -->
        <a-modal v-model:visible="showDialog" title="身份验证" :closable="false" :mask-closable="false" :footer="false"
            width="90%">
            <div style="text-align:center;">
                <a-input v-model="idCard" placeholder="请输入身份证" :max-length="18" allow-clear style="width: 90%" />
            </div>

            <div style="text-align:center; margin-top: 20px;">
                <a-button type="primary" @click="verifyAndGet" :loading="loading">确认</a-button>
            </div>
        </a-modal>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { verify } from '@/apis/worker/workerApply'
import { Message } from '@arco-design/web-vue'
import { encryptByRsa } from '@/utils/encrypt'

const loading = ref(false)
const props = defineProps<{
    classId: string | number
}>()
const emit = defineEmits<{
    (e: 'verifiedResult', payload: any): void
    (e: 'switchPhoneVerify', payload: boolean): void
}>()
const ID_CARD_REGEX = /^[1-9]\d{5}(19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9X]?$/;

const showDialog = ref(true)
const idCard = ref('')
const isUploadedFlag = ref(false)
const verifyAndGet = async () => {
    if (loading.value) return
    if (!ID_CARD_REGEX.test(idCard.value)) {
        Message.warning("身份证格式不正确")
        return
    }
    try {
        const encryptIdCard = encryptByRsa((idCard.value) || '')
        const res = await verify({ idCard: encryptIdCard, classId: props.classId })
        const projectNeedUploadDocs = res.data.projectNeedUploadDocs;
        const workerUploadedDocs = res.data.workerUploadedDocs
        const projectInfo = res.data.projectInfo

        if (isUploadedFlag.value && workerUploadedDocs) {
            Message.warning("您已提交过报名，不可重复提交！")
            emit('switchPhoneVerify', false)
        }
        emit('verifiedResult', { projectNeedUploadDocs, idCard: idCard.value, workerUploadedDocs, projectInfo })
        showDialog.value = false
    } catch (e) {

    } finally {
        loading.value = false
    }
}

const setIdCard = (val: string, isUploaded: boolean) => {
    idCard.value = val
    isUploadedFlag.value = isUploaded
    verifyAndGet()
}

onMounted(() => {
    // 页面加载自动弹窗
    showDialog.value = true
})

defineExpose({
    setIdCard
})
</script>

<style scoped></style>