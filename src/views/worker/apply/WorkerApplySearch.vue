<template>
    <div class="page-container">
        <!-- 身份验证弹窗 -->
        <a-modal v-model:visible="showDialog" title="身份验证" :closable="false" :mask-closable="false" :footer="false"
            width="400px">
            <div style="text-align:center;">
                <a-input-password v-model="idLast6" placeholder="请输入身份证后六位" :max-length="6" allow-clear
                    style="width: 250px" />
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
const loading = ref(false)
const props = defineProps<{
    classId: string | number
}>()
const emit = defineEmits<{
    (e: 'verifiedResult', payload: any): void
    (e: 'switchPhoneVerify', payload: boolean): void
}>()

const showDialog = ref(true)
const idLast6 = ref('')
const isUploadedFlag = ref(false)
const verifyAndGet = async () => {
    if (loading.value) return
    if (idLast6.value.trim().length !== 6) {
        Message.warning("请输入完整的身份证后六位")
        return
    }
    try {
        const res = await verify({ idLast6: idLast6.value, classId: props.classId })
        const projectNeedUploadDocs = res.data.projectNeedUploadDocs;
        const workerUploadedDocs = res.data.workerUploadedDocs
        const projectInfo = res.data.projectInfo

        if (isUploadedFlag.value && workerUploadedDocs) {
            Message.warning("您已提交过报名，不可重复提交！")
            emit('switchPhoneVerify', false)
        }
        emit('verifiedResult', { projectNeedUploadDocs, idLast6: idLast6.value, workerUploadedDocs, projectInfo })
        showDialog.value = false
    } catch (e) {
        console.log(e);

    } finally {
        loading.value = false
    }
}

const setIdLast6 = (val: string, isUploaded: boolean) => {
    idLast6.value = val
    isUploadedFlag.value = isUploaded
    verifyAndGet()
}

onMounted(() => {
    // 页面加载自动弹窗
    showDialog.value = true
})

defineExpose({
    setIdLast6
})
</script>

<style scoped></style>