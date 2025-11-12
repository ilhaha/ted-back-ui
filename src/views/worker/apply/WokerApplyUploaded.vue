<template>
    <div>
        <!-- 温馨提示2：报名资格申请表指引 -->
        <div class="tips-card warning-tips" v-if="workerUploadedDocs.status == 0">
            <div class="tips-icon">ℹ️</div>
            <div class="tips-text">
                您的报考资料已成功提交，正在审核中，请耐心等待审核结果。
            </div>
        </div>

        <div class="tips-card warning-tips" v-if="workerUploadedDocs.status == 1">
            <div class="tips-icon">✅</div>
            <div class="tips-text">
                您提交的报考资料审核已通过，请关注考试内容及安排，按时准备考试。
            </div>
        </div>

        <div class="tips-card warning-tips" v-if="workerUploadedDocs.status == 2">
            <div class="tips-icon">⚠️</div>
            <div class="tips-text">
                您提交的报考资料审核未通过，具体原因如下：<br>
                <span>{{ workerUploadedDocs.remark }}</span>
            </div>
        </div>

        <div class="tips-card warning-tips" v-if="workerUploadedDocs.status == 3">
            <div class="tips-icon">❌</div>
            <div class="tips-text">
                您的报考资料被认定为虚假，无法继续报名。原因：<br>
                <span>{{ workerUploadedDocs.remark }}</span>
            </div>
        </div>

        <div class="doc-card-id">
            <div class="upload-item">
                <div class="doc-info">
                    <span class="doc-name">身份证人像面</span>
                </div>
                <div class="upload-wrapper">
                    <a-image :src="workerUploadedDocs.idCardPhotoFront" width="80" height="80"
                        style="object-fit: cover;" :preview="{ visible: true }" />
                </div>
            </div>
            <div class="upload-item">
                <div class="doc-info">
                    <span class="doc-name">身份证国徽面</span>
                </div>
                <div class="upload-wrapper">
                    <a-image :src="workerUploadedDocs.idCardPhotoBack" width="80" height="80" style="object-fit: cover;"
                        :preview="{ visible: true }" />
                </div>
            </div>

            <div class="upload-item">
                <div class="doc-info">
                    <span class="doc-name">一寸免冠照</span>
                </div>
                <div class="upload-wrapper">
                    <a-image :src="workerUploadedDocs.facePhoto" width="80" height="80" style="object-fit: cover;"
                        :preview="{ visible: true }" />
                </div>
            </div>
        </div>

        <!-- 单独上传：报名资格申请表（PDF/Word专属） -->
        <div class="doc-card form-card">
            <div class="doc-info">
                <span class="doc-name">报名资格审核表</span>
                <span class="upload-count">
                    {{ (workerUploadedDocs.qualificationPath ? 1 : 0) }}/1
                </span>
            </div>
            <div class="doc-info" style="margin-bottom: 0;">
                <span class="doc-name" style=" color: #1890ff;"><a :href="workerUploadedDocs.qualificationPath"
                        target="_blank">{{ workerUploadedDocs.qualificationName }}</a></span>
            </div>
        </div>
        <!-- 资料上传卡片：图片类资料 -->
        <div class="doc-card" v-for="([typeId, files]) in Object.entries(fileListMap)" :key="typeId"
            @mouseenter="cardHovered = typeId" @mouseleave="cardHovered = ''">
            <div class="doc-info">
                <span class="doc-name">{{ files[0]?.name || '' }}</span>
                <span class="upload-count">{{ files.length }}/3</span>
            </div>

            <div class="upload-wrapper" style="display: flex; gap: 10px; flex-wrap: wrap;">
                <a-image v-for="file in files" :key="file.uid" :src="file.url" width="80" height="80"
                    style="object-fit: cover;" :preview="{ visible: true }" />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const props = defineProps<{
    workerUploadedDocs: any,
}>()
const fileListMap = reactive<Record<string, any[]>>({})
const cardHovered = ref('')
onMounted(() => {
    const docs = props.workerUploadedDocs?.workerApplyDocuments || []
    docs.forEach((item) => {
        // 若该 typeId 没有初始化，则先创建空数组
        if (!fileListMap[item.typeId]) {
            fileListMap[item.typeId] = []
        }

        // 每条记录只包含一个 docPaths，不需要 split(',')
        fileListMap[item.typeId].push({
            uid: `${item.typeId}-${fileListMap[item.typeId].length}-${Date.now()}`,
            url: item.docPaths,
            name: item.typeName
        })
    })
})
</script>

<style scoped>
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

.status-text {
    font-weight: 500;
    font-size: 14px;
}

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
    padding: 0 16px;
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

/* 温馨提示卡片 */
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