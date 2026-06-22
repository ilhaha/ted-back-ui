<template>
  <a-modal
    v-model:visible="visible"
    title="报名情况"
    width="75%"
    draggable
    :footer="null"
    modal-class="no-padding-modal"
  >
    <a-spin :loading="loading">
      <!-- 项目汇总卡片 -->
      <a-alert
        v-if="projectOverview.length > 0"
        type="info"
        style="padding: 10px"
      >
        <span>项目人项汇总：</span>
        <a-tag
          v-for="item in projectOverview"
          :key="item.projectId"
          style="margin-left: 8px"
          color="red"
          size="small"
        >
          {{ item.projectCode }}：{{ item.totalItemCount || 0 }}
        </a-tag>
      </a-alert>

      <!-- 筛选和表格 -->
      <div class="gi_table_page" style="padding: 0">
        <GiTable
          title=""
          row-key="id"
          :data="dataList"
          :columns="columns"
          :loading="loading"
          :scroll="{ x: '100%', y: '100%', minWidth: '95%' }"
          :pagination="pagination"
          :disabled-tools="['size']"
          :disabled-column-keys="['name']"
          @refresh="search"
        >
          <template #toolbar-left>
            <a-select
              v-model="queryForm.projectId"
              placeholder="报考项目"
              allow-clear
              class="search-input ml-2"
              @change="search"
            >
              <a-option
                v-for="item in projectOverview"
                :key="item.projectId"
                :value="item.projectId"
                >{{ item.projectCode }}</a-option
              >
            </a-select>
            <a-select
              v-model="queryForm.status"
              placeholder="报考状态"
              allow-clear
              class="search-input ml-2"
              @change="search"
            >
              <a-option :value="1">待审核</a-option>
              <a-option :value="2">已通过</a-option>
              <a-option :value="3">已驳回</a-option>
            </a-select>
            <a-input-search
              v-model="queryForm.nickname"
              placeholder="请输入考生姓名"
              allow-clear
              @search="search"
            />
            <a-input-search
              v-model="queryForm.username"
              placeholder="请输入身份证"
              allow-clear
              @search="search"
            />

            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              <template #default>重置</template>
            </a-button>
          </template>
          <template #noticeExamProjectList="{ record }">
            <a-tag
              v-if="
                !record.noticeExamProjectList ||
                record.noticeExamProjectList.length === 0
              "
              >-</a-tag
            >
            <a-space v-else>
              <a-tag
                v-for="item in record.noticeExamProjectList"
                :key="item.projectId"
                :color="getProjectColor(item.isApply, item.examAttemptType)"
              >
                {{ item.projectCode }}
              </a-tag>
            </a-space>
          </template>
          <template #status="{ record }">
            <a-tag :color="getStatusColor(record.status)">{{
              getStatusText(record.status)
            }}</a-tag>
          </template>
        </GiTable>
      </div>
    </a-spin>
  </a-modal>
</template>

<script setup lang="ts">
import {
  type ExamineeNoticeApplyResp,
  type ExamineeNoticeApplyQuery,
  getNoticeApplyCandidatePage,
} from "@/apis/exam/examineeNoticeApply";
import {
  type NoticeProjectApplyResp,
  getNoticeProjectApplyOverview,
} from "@/apis/exam/examNotice";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useTable } from "@/hooks";

defineOptions({ name: "InspectionOverviewRegistrationModal" });
const visible = ref(false);
const projectOverview = ref<NoticeProjectApplyResp[]>([]);

const queryForm = reactive<ExamineeNoticeApplyQuery>({
  noticeId: undefined,
  status: undefined,
  username: undefined,
  nickname: undefined,
  projectId: undefined,
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  refresh,
} = useTable((page) => getNoticeApplyCandidatePage({ ...queryForm, ...page }), {
  immediate: false,
});

const columns = ref<TableInstanceColumns[]>([
  { title: "序号", dataIndex: "sort", slotName: "sort", width: 80 },
  { title: "身份证号", dataIndex: "username", slotName: "username" },
  { title: "姓名", dataIndex: "nickname", slotName: "nickname", width: 120 },
  { title: "联系电话", dataIndex: "phone", slotName: "phone", width: 120 },
  {
    title: "报考项目",
    dataIndex: "noticeExamProjectList",
    slotName: "noticeExamProjectList",
    width: 200,
  },
  { title: "状态", dataIndex: "status", slotName: "status" },
  { title: "驳回原因", dataIndex: "remark", slotName: "remark" },
]);

/** 获取项目汇总数据 */
const fetchProjectOverview = async () => {
  if (!queryForm.noticeId) return;
  try {
    const res = await getNoticeProjectApplyOverview(queryForm.noticeId);
    projectOverview.value = res.data || [];
  } catch (error) {}
};

// 重置
const reset = () => {
  queryForm.status = undefined;
  queryForm.nickname = undefined;
  queryForm.username = undefined;
  queryForm.projectId = undefined;
  search();
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "default"; // 待报名
    case 1:
      return "arcoblue"; // 报名待审核
    case 2:
      return "green"; // 报名审核通过
    case 3:
      return "red"; // 报名审核未通过
    case 4:
      return "orange"; // 完成部分项目考试
    case 5:
      return "green"; // 已完成全部考试
    default:
      return "default";
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待报名";
    case 1:
      return "待审核";
    case 2:
      return "已通过";
    case 3:
      return "驳回";
    case 4:
      return "完成部分项目考试";
    case 5:
      return "已完成全部考试";
    default:
      return "未知状态";
  }
};

const getProjectColor = (isApply: boolean, examAttemptType: number | null) => {
  if (!isApply) return "gray";
  if (examAttemptType === 1) return "green";
  if (examAttemptType === 2) return "gold";
  return "green";
};

/** ================= 打开弹窗 ================= */
const onOpen = (id: string) => {
  queryForm.noticeId = id;
  visible.value = true;
  reset();
  fetchProjectOverview();
};

defineExpose({ onOpen });
</script>
