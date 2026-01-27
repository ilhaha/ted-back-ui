<template>
    <a-modal v-model:visible="visible" title="考试计划报考情况" :mask-closable="false" width="85%" :footer="false"
        @close="handClose">
        <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
            :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
            :disabled-column-keys="['name']" @refresh="search">
            <template #toolbar-left>
                <a-select v-model="queryForm.classId" :options="projectClassOptions" placeholder="请选择班级" allow-clear
                    @change="search" />
                <a-input-search v-model="queryForm.nickName" placeholder="请输入考生名称" allow-clear @search="search" />

                <a-button @click="reset">
                    <template #icon><icon-refresh /></template>
                    <template #default>重置</template>
                </a-button>
            </template>
            <!-- <template #toolbar-right>
                <a-button v-permission="['worker:examineePaymentAudit:download']" @click="batchDownloadAuditNotice"
                    :disabled="!queryForm.classId || !dataList || dataList.length === 0"
                    :loading="batchDownloadLodding">
                    <template #icon><icon-download /></template>
                    <template #default>下载班级缴费通知单</template>
                </a-button>
                <a-button v-permission="['exam:download:ticket']" @click="batchDownloadTicket"
                    :disabled="!queryForm.classId || !dataList || dataList.length === 0"
                    :loading="batchDownloadTicketLodding">
                    <template #icon><icon-download /></template>
                    <template #default>下载班级准考证</template>
                </a-button>
            </template> -->
            <template #paymentProofUrl="{ record }">
                <div v-if="record.paymentProofUrl" class="image-list">
                    <a-image v-for="(path, index) in record.paymentProofUrl.split(',')" :key="index" width="80"
                        height="60" :src="path" :preview-props="{ zoomRate: 1.5 }" fit="cover" />
                </div>
                <span v-else>-</span>
            </template>
            <template #auditStatus="{ record }">
                <a-tag :color="getStatusColor(record.auditStatus)">{{
                    getStatusText(record.auditStatus)
                    }}</a-tag>
            </template>
            <!-- <template #auditNoticeUrl="{ record }">
                <a-link @click="getPreviewUrl(record.auditNoticeUrl)"
                    v-permission="['worker:examineePaymentAudit:download']">预览</a-link>
                <a-link v-permission="['worker:examineePaymentAudit:download']"
                    @click.prevent="downloadAuditNotice(record)" :loading="downloadLodding">下载</a-link>
            </template> -->
            <template #theoryScoreReused="{ record }">
                <a-tag :color="getTheoryScoreReusedColor(record.theoryScoreReused)">{{
                    getTheoryScoreReusedText(record.theoryScoreReused)
                    }}</a-tag>
            </template>
            <template #ticketUrl="{ record }">
                <div v-if="record.ticketUrl">
                    <a-link @click="getPreviewUrl(record.ticketUrl)" v-permission="['exam:download:ticket']">预览</a-link>
                    <a-link v-permission="['exam:download:ticket']" @click.prevent="downloadTicket(record)"
                        :loading="downloadTicketLodding">下载</a-link>
                </div>
                <div v-else>-</div>
            </template>
            <template #facePhoto="{ record }">
                <template v-if="record.facePhoto">
                    <a-image width="80" height="60" :src="record.facePhoto" fit="cover"
                        :preview-props="{ zoomRate: 1.5 }" class="preview-image" />
                </template>
                <span v-else>-</span>
            </template>
            <!-- <template #action="{ record }">
                <a-space>
                    <a-link v-permission="['exam:enroll:delete']" status="danger" :disabled="record.disabled"
                        v-if="canCancal" :title="record.disabled ? '不可取消报名' : '取消报名'" @click="onDelete(record)">
                        取消报名
                    </a-link>
                </a-space>
            </template> -->
        </GiTable>
    </a-modal>
</template>

<script setup lang="ts">
import {
    type EnrollResp,
    type EnrollQuery,
    deleteEnroll,
    listEnrollAdminQuery,
    downloadAuditNoticeSingle,
    downloadTicketSingle,
    downloadBatchAuditNotice,
    downloadBatchTicket
} from "@/apis/plan/enroll";
import { getSelectClassByProject } from '@/apis/training/orgClass'
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import { Message } from '@arco-design/web-vue'

defineOptions({ name: "Enroll" });

const visible = ref(false)

const queryForm = reactive<EnrollQuery>({
    nickName: undefined,
    classId: undefined,
    planId: undefined,
    sort: ["te.id,desc"],
    isOrgQuery: false,
    planType: 0
});

const openPlanId = ref()
const openProjectId = ref()
const projectClassOptions = ref<any[]>([])
const batchDownloadLodding = ref(false)
const batchDownloadTicketLodding = ref(false)
const downloadLodding = ref(false)
const downloadTicketLodding = ref(false)
const canCancal = ref(false)
const {
    tableData: dataList,
    loading,
    pagination,
    search,
    handleDelete,
} = useTable((page) => listEnrollAdminQuery({ ...queryForm, ...page }), {
    immediate: false,
});

const columns = ref<TableInstanceColumns[]>([
    { title: "机构名称", dataIndex: "orgName", slotName: "orgName" },
    { title: "所属班级", dataIndex: "className", slotName: "className" },
    { title: "序号", dataIndex: "seatId", slotName: "seatId" },
    { title: "考生姓名", dataIndex: "nickName", slotName: "nickName" },
    { title: "报名时间", dataIndex: "createTime", slotName: "createTime" },
    { title: "照片", dataIndex: "facePhoto", slotName: "facePhoto" },
    { title: "理论考试状态", dataIndex: "theoryScoreReused", slotName: "theoryScoreReused" },

    // { title: "缴费通知单编号", dataIndex: "noticeNo", slotName: "noticeNo" },
    // { title: "缴费通知单", dataIndex: "auditNoticeUrl", slotName: "auditNoticeUrl" },
    // { title: "缴费凭证", dataIndex: "paymentProofUrl", slotName: "paymentProofUrl" },
    // { title: "缴费时间", dataIndex: "paymentTime", slotName: "paymentTime" },
    // { title: "缴费状态", dataIndex: "auditStatus", slotName: "auditStatus" },
    // { title: "准考证", dataIndex: "ticketUrl", slotName: "ticketUrl" },
    // {
    //     title: "操作",
    //     dataIndex: "action",
    //     slotName: "action",
    //     width: 160,
    //     align: "center",
    //     fixed: !isMobile() ? "right" : undefined,
    //     show: has.hasPermOr([
    //         "exam:enroll:delete",
    //     ]),
    // },
]);


// 重置
const reset = () => {
    queryForm.nickName = undefined;
    queryForm.classId = undefined
    queryForm.planId = openPlanId.value
    search();
};

// 关闭弹窗
const handClose = () => {
    reset();
    visible.value = false
}

// 删除
const onDelete = (record: EnrollResp) => {
    return handleDelete(() => deleteEnroll(record.id), {
        content: `是否确定取消报名该条数据？`,
        showModal: true,
        successTip: '已取消'
    });
};

const getPreviewUrl = (url: string) => {
    if (!url) {
        Message.warning("暂无文件可预览");
        return;
    }
    // 提取文件扩展名
    const ext = url.split(".").pop()?.toLowerCase();
    if (ext === "pdf") {
        //  PDF 直接在浏览器中预览
        window.open(url, "_blank");
    } else if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext)) {
        //  Office 文件使用微软在线预览
        const previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(
            url
        )}`;
        window.open(previewUrl, "_blank");
    } else {
        Message.warning("暂不支持此文件类型预览");
    }
};


const getTheoryScoreReusedText = (auditStatus: number) => {
    switch (auditStatus) {
        case 0:
            return "待考";
        case 1:
            return "免考";
        default:
            return "未知";
    }
};
const getTheoryScoreReusedColor = (auditStatus: number) => {
    switch (auditStatus) {
        case 0:
            return "blue";
        case 1:
            return "green";
        default:
            return "default";
    }
}


const getStatusText = (auditStatus: number) => {
    switch (auditStatus) {
        case 0:
            return "待上传";
        case 1:
            return "待审核";
        case 2:
            return "审核通过";
        case 3:
            return "待补正";
        case 4:
            return "补正审核";
        case 5:
            return "退款审核";
        case 6:
            return "已退款";
        case 7:
            return "退款驳回";
        default:
            return "";
    }
};
const getStatusColor = (auditStatus: number) => {
    switch (auditStatus) {
        case 0:
            return "red";
        case 1:
            return "red";
        case 2:
            return "green";
        case 3:
            return "orange";
        case 4:
            return "red";
        case 5:
            return "red";
        case 6:
            return "orange";
        case 7:
            return "green";
        default:
            return "default";
    }
};

// 批量下载准考证
const batchDownloadTicket = async () => {
    const classId = queryForm.classId
    if (!classId) {
        Message.warning("未选择班级")
    }
    try {
        batchDownloadTicketLodding.value = true

        const res = await downloadBatchTicket(classId, openPlanId.value)
        const blob = new Blob([res.data], { type: 'application/zip' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        // 根据classId获取班级名称
        const className = projectClassOptions.value.find(c => c.value === classId)?.label || "班级";
        link.download = className + "_准考证.zip";
        link.click();
        URL.revokeObjectURL(link.href);
        Message.success("下载成功")
    } catch (err) {
    } finally {
        batchDownloadTicketLodding.value = false
    }

}

// 下载某一个考生的准考证
const downloadTicket = async (record: any) => {
    downloadTicketLodding.value = true
    try {
        const res = await downloadTicketSingle(record.id)

        // 从 header 提取文件名
        let fileName = record.nickName + "_准考证.pdf"

        // 创建 blob 链接
        const blob = new Blob([res.data], { type: "application/pdf" })
        const url = window.URL.createObjectURL(blob)

        // 触发下载
        const link = document.createElement("a")
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        Message.success("下载成功")
    } catch (err) {
    } finally {
        downloadTicketLodding.value = false
    }
}

// 批量下载缴费通知单
const batchDownloadAuditNotice = async () => {
    const classId = queryForm.classId
    if (!classId) {
        Message.warning("未选择班级")
    }
    try {
        batchDownloadLodding.value = true
        const res = await downloadBatchAuditNotice(classId, openPlanId.value)
        const blob = new Blob([res.data], { type: 'application/zip' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        // 根据classId获取班级名称
        const className = projectClassOptions.value.find(c => c.value === classId)?.label || "班级";
        link.download = className + "_考试缴费通知.zip";
        link.click();
        URL.revokeObjectURL(link.href);
        Message.success("下载成功")
    } catch (err) {
    } finally {
        batchDownloadLodding.value = false
    }

}

// 下载某一个考生的缴费通知单
const downloadAuditNotice = async (record: any) => {
    downloadLodding.value = true
    try {
        const res = await downloadAuditNoticeSingle(record.id)

        // 从 header 提取文件名
        let fileName = record.nickName + "_考试缴费通知单.pdf"

        // 创建 blob 链接
        const blob = new Blob([res.data], { type: "application/pdf" })
        const url = window.URL.createObjectURL(blob)

        // 触发下载
        const link = document.createElement("a")
        link.href = url
        link.download = fileName
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        Message.success("下载成功")
    } catch (err) {
    } finally {
        downloadLodding.value = false
    }
}

const getProjectClass = async (projectId: string) => {
    const res = await getSelectClassByProject(projectId, 0)
    projectClassOptions.value = res.data
}

const onOpen = async (planId: string, projectId: string, isFinalConfirmed: number) => {
    queryForm.planId = planId
    openPlanId.value = planId
    openProjectId.value = projectId
    canCancal.value = isFinalConfirmed >= 1 ? false : true
    search()
    getProjectClass(projectId)
    visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
.image-list {
    display: flex;
    /* 横向排列 */
    flex-wrap: wrap;
    /* 空间不足自动换行 */
    gap: 8px;
    /* 图片间距，可调 */
}
</style>