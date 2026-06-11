<template>
    <div class="gi_table_page">
        <GiTable title="网络课堂管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
            :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
            :disabled-column-keys="['name']" @refresh="search">
            <template #toolbar-left>
                <a-select v-model="queryForm.categoryId" placeholder="所属类别" allow-clear class="search-input ml-2"
                    @change="search" style="margin-left: 8px;" :options="categorySelect">

                </a-select>
                <a-input-search v-model="queryForm.title" placeholder="请输入通知内容" allow-clear @search="search" />
                <a-select v-model="queryForm.status" placeholder="通知状态" allow-clear class="search-input ml-2"
                    @change="search" style="margin-left: 8px;">
                    <a-option value="1">报名中</a-option>
                    <a-option value="3">补报中</a-option>
                    <a-option value="4">报名已结束</a-option>
                </a-select>
                <a-select v-model="queryForm.examLevel" placeholder="考试等级" allow-clear class="search-input ml-2"
                    @change="search" style="margin-left: 8px;">
                    <a-option value="1">Ⅰ级</a-option>
                    <a-option value="2">Ⅱ级</a-option>
                </a-select>

                <a-button @click="reset">
                    <template #icon><icon-refresh /></template>
                    <template #default>重置</template>
                </a-button>
            </template>
            <template #status="{ record }">
                <a-tag :color="getStatusColor(record.status)" bordered>
                    {{ getStatusText(record.status) }}
                </a-tag>
            </template>
            <template #examLevel="{ record }">
                <a-tag :color="getExamLevelColor(record.examLevel)" bordered>
                    {{ getExamLevelText(record.examLevel) }}
                </a-tag>
            </template>
            <template #action="{ record }">
                <a-space>
                    <a-link v-permission="['notice:training:applyList']" title="申请列表"
                        @click="onApplyList(record)">申请列表</a-link>
                </a-space>
            </template>
        </GiTable>
    </div>
    <ApplyOnlineCourseList ref="ApplyOnlineCourseListRef" />
</template>

<script setup lang="ts">

import { Message } from '@arco-design/web-vue'
import { type ExamNoticeResp, type ExamNoticeQuery, deleteExamNotice, exportExamNotice, onlineCourseNoticeAdminPage, auditExamNotice } from '@/apis/exam/examNotice'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { selectOptions } from "@/apis/exam/category";
import ApplyOnlineCourseList from './ApplyOnlineCourseList.vue'


defineOptions({ name: 'ExamNotice' })


const queryForm = reactive<ExamNoticeQuery>({
    title: undefined,
    applyDeadline: undefined,
    examLevel: undefined,
    status: undefined,
    categoryId: undefined,
    categoryType: 3,
})

const {
    tableData: dataList,
    loading,
    pagination,
    search,
    handleDelete,
    selectedKeys,
    select,
    selectAll
} = useTable((page) => onlineCourseNoticeAdminPage({ ...queryForm, ...page }), { immediate: true })

const rowSelection = reactive({
    type: 'checkbox',
    showCheckedAll: true,
    onlyCurrent: false,
    selectedRowKeys: selectedKeys,
    onChange: (keys: string[]) => {
        selectedKeys.value = keys
    }
})

const columns = ref<TableInstanceColumns[]>([
    // { title: '主键ID', dataIndex: 'id', slotName: 'id' },
    { title: '通知内容', dataIndex: 'title', slotName: 'title' },
    { title: '报名截止时间', dataIndex: 'applyDeadline', slotName: 'applyDeadline' },
    { title: '所属类别', dataIndex: 'categoryName', slotName: 'categoryName' },
    { title: '考试项目', dataIndex: 'projectCodes', slotName: 'projectCodes' },
    { title: '考试等级', dataIndex: 'examLevel', slotName: 'examLevel' },
    { title: '说明', dataIndex: 'remark', slotName: 'remark' },
    { title: '状态', dataIndex: 'status', slotName: 'status' },
    { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
    {
        title: '操作',
        dataIndex: 'action',
        slotName: 'action',
        width: 160,
        align: 'center',
        fixed: !isMobile() ? 'right' : undefined,
        show: has.hasPermOr(['notice:training:applyList'])
    }
]);

// 重置
const reset = () => {
    queryForm.title = undefined
    queryForm.applyDeadline = undefined
    queryForm.examLevel = undefined
    queryForm.status = undefined
    queryForm.categoryId = undefined
    queryForm.categoryType = 3
    search()
}


const getExamLevelColor = (status: number) => {
    switch (status) {
        case 0:
            return "green"; // 无
        case 1:
            return "blue"; // I级
        case 2:
            return "orange"; // II级
        default:
            return "default";
    }
};

const getExamLevelText = (status: number) => {
    switch (status) {
        case 0:
            return "无";
        case 1:
            return "I级";
        case 2:
            return "Ⅱ级";
        default:
            return "未知等级";
    }
};

const getStatusColor = (status: number) => {
    switch (status) {
        case 0: return 'blue'      // 待审核
        case 1: return 'green'      // 报名中
        case 2: return 'red'        // 审核未通过
        case 3: return 'blue'     // 补报中
        case 4: return 'gray'       // 报名结束
        case 5: return 'orange'      // 已开考
        case 6: return 'default'    // 已结束
        default: return 'default'
    }
};

const getStatusText = (status: number) => {
    switch (status) {
        case 0: return '待审'
        case 1: return '报名中'
        case 2: return '已驳回'
        case 3: return '补报中'
        case 4: return '报名已结束'
        case 5: return '考试中'
        case 6: return '已结束'
        default: return '未知状态'
    }
};
const categorySelect = ref([])
const initProjectSelect = async () => {
    const res = await selectOptions([3]);
    categorySelect.value = res.data || [];
}

onMounted(async () => {
    initProjectSelect()
})

const ApplyOnlineCourseListRef = ref<InstanceType<typeof ApplyOnlineCourseList>>()

const onApplyList = (record: ExamNoticeResp) => {
    ApplyOnlineCourseListRef.value?.onOpen(record.id)
}





</script>

<style scoped lang="scss"></style>