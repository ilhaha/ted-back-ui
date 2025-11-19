<template>
  <div class="gi_table_page">
    <GiTable title="考试计划管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" :row-selection="rowSelection" @refresh="search" @select="test">
      <template #examType="{ record }">
        <a-tag :color="getExamTypeColor(record.examType)" bordered>{{
          getExamTypeText(record.examType)
        }}</a-tag>
      </template>
      <template #imageUrl="{ record }">
        <a-image width="100" height="100" :src="record.imageUrl">
          <template #loader>
            <img width="200"
              src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp"
              style="filter: blur(5px)" />
          </template>
        </a-image>
      </template>

      <template #toolbar-right>
        <a-button v-permission="['exam:examPlan:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          新增
        </a-button>
        <a-button @click="onImport" v-permission="['exam:examPlan:import']">
          <template #icon><icon-upload /></template>
          <template #default>导入</template>
        </a-button>
        <!-- <a-button v-permission="['exam:examPlan:export']" @click="onExport">
              <template #icon><icon-download /></template>
              导出
            </a-button> -->
      </template>

      <template #toolbar-left>
        <div class="search-container">
          <a-select v-model="queryForm.planType" placeholder="考试人员类型" allow-clear class="search-input ml-2"
            @change="search">
            <a-option :value="0">作业人员</a-option>
            <a-option :value="1">检验人员</a-option>
          </a-select>
          <a-input-search @search="search" v-model="queryForm.examPlanName" placeholder="搜索计划名称" allow-clear
            class="search-input ml-2" />
          <a-input-search @search="search" v-model="queryForm.projectName" placeholder="搜索项目名称" allow-clear
            class="search-input ml-2" />
          <!-- <a-year-picker
            v-model="queryForm.planYear"
            placeholder="选择年份"
            class="search-input ml-2"
            style="margin-left: 8px;"
          /> -->
          <!-- <a-input v-model="queryForm.locationName" placeholder="搜索考试地点" allow-clear class="search-input ml-2" /> -->
          <a-select v-model="queryForm.status" placeholder="计划状态" allow-clear class="search-input ml-2" @change="search"
            style="margin-left: 8px;">
            <a-option value="1">待主任审批</a-option>
            <a-option value="2">待市监局审批</a-option>
            <a-option value="3">已生效</a-option>
            <a-option value="4">未通过</a-option>
            <a-option value="5">已开考</a-option>
            <a-option value="6">已结束</a-option>
          </a-select>
          <a-space class="ml-2">
            <a-button type="primary" @click="search">
              <template #icon><icon-search /></template>
              搜索
            </a-button>
            <a-button class="ml-2" @click="reset">
              <template #icon><icon-refresh /></template>
              重置
            </a-button>
          </a-space>
        </div>
      </template>
      <template #startTime="{ record }">
        {{ formatDate(record.startTime) }} ~ {{ formatDate(record.endTime) }}
      </template>
      <template #enrollStartTime="{ record }">
        {{ formatDate(record.enrollStartTime) }} ~ {{ formatDate(record.enrollEndTime) }}
      </template>
      <template #planType="{ record }">
        <a-tag :color="getPlanTypeColor(record.planType)" bordered>
          {{ getPlanTypeText(record.planType) }}
        </a-tag>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)" bordered>
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template #isFinalConfirmed="{ record }">
        <a-tag :color="getIsFinalConfirmedColor(record.isFinalConfirmed)" bordered>
          {{ getIsFinalConfirmedText(record.isFinalConfirmed) }}
        </a-tag>
      </template>
      <template #examRoom="{ record }">
        <a-space>
          <a-link title="查看考场" style="text-align: center" @click="showExamRoom(record)">
            查看考场
          </a-link>
        </a-space>
      </template>
      <!-- <template #invigilate="{ record }">
        <a-space>
          <a-link v-permission="['exam:examPlan:option']" title="选择监考" style="text-align: center"
            @click="onOptionInvigilate(record)">
            选择监考
          </a-link>
        </a-space>
      </template> -->
      <template #action="{ record }">
        <a-space>
          <!-- <a-link v-permission="['exam:examPlan:detail']" title="详情" @click="onDetail(record)">详情</a-link> -->
          <div v-show="record.status == 1">
            <a-link v-permission="['exam:examPlan:zxzrreview']" title="审核" @click="onExamineA(record)">
              审核
            </a-link>
          </div>
          <div v-show="record.status == 2">
            <a-link v-permission="['exam:examPlan:sjjdgljreview']" title="审核" @click="onExamineA(record)">审核</a-link>
          </div>
          <div v-show="record.isFinalConfirmed > 0">
            <a-link v-permission="['exam:examPlan:queryInvigilator']" title="查看监考员" style="text-align: center"
              @click="onOptionInvigilateList(record.id, record.assignType)">
              监考列表
            </a-link>
          </div>
          <a-link v-permission="['exam:examPlan:delete']" v-if="record.status == 1 || record.status == 4"
            status="danger" :disabled="record.disabled" :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)">
            删除
          </a-link>
          <div v-if="(record.isFinalConfirmed == 0 || record.isFinalConfirmed == 3) && record.status == 3">
            <a-link v-permission="['exam:examPlan:adminconfirmed']" title="管理员确认考试"
              @click="onUpdate(record)">考试确认</a-link>
          </div>
          <div v-if="record.isFinalConfirmed == 1 && record.status == 3 && userInfo.id != 1">
            <a-link v-permission="['exam:examPlan:zxzrConfirmed']" title="中心主任确认考试"
              @click="openConform(record)">考试确认</a-link>
          </div>
        </a-space>
      </template>
    </GiTable>

    <!-- 查看考场弹窗 -->
    <a-modal v-model:visible="visible" title="计划考场信息" width="800px" :footer="null">
      <a-table :dataSource="locationList" :columns="locationColumns" :pagination="false" rowKey="locationId" bordered
        expandable="{ expandedRowRender }" />
    </a-modal>
    <!-- 中心主任确认考试 -->
    <a-modal v-model:visible="conformVisible" title="中心主任确认考试" :mask-closable="false" :esc-to-close="false"
      :width="width >= 600 ? 600 : '100%'" draggable @before-ok="conformExam" @close="resetForm">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item field="isFinalConfirmed" label="确认结果" :rules="[{ required: true, message: '请选择审核结果' }]">
          <a-radio-group v-model="form.isFinalConfirmed">
            <a-radio :value="2">确认通过</a-radio>
            <a-radio :value="3">驳回</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <ExamPlanAddModal ref="ExamPlanAddModalRef" @save-success="search" @update-reviewer="updateReviewer" />
    <ExamPlanDetailDrawer ref="ExamPlanDetailDrawerRef" />
    <ExamPlanOptionModal ref="ExamPlanOptionModalRef" />
    <ExamPlanLocaltionAndRoomModel ref="ExamPlanLocaltionAndRoomModelRef" />
    <ExamPlanImportModal ref="ExamPlanImportModalRef" @import-success="search" />
    <ExamPlanInvigilatorList ref="ExamPlanInvigilatorListRef" />
  </div>
</template>

<script setup lang="ts">
import dayjs from "dayjs";
import ExamPlanAddModal from "./ExamPlanAddModal.vue";
import ExamPlanDetailDrawer from "./ExamPlanDetailDrawer.vue";
import ExamPlanOptionModal from "./ExamPlanOptionModal.vue";
import ExamPlanImportModal from "./ExamPlanImportModal.vue";
import {
  type ExamPlanQuery,
  type ExamPlanResp,
  deleteExamPlan,
  exportExamPlan,
  listExamPlan,
  centerDirectorConform
} from "@/apis/exam/examPlan";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import type { ProjectResp } from "@/apis/exam/project";
import ExamPlanLocaltionAndRoomModel from "./ExamPlanLocaltionAndRoomModel.vue";
import ExamPlanInvigilatorList from "./ExamPlanInvigilatorList.vue";
import { useResetReactive } from '@/hooks'
import { useWindowSize } from '@vueuse/core'
import { useUserStore } from '@/stores'
import { Message } from '@arco-design/web-vue'

const userStore = useUserStore()
const userInfo = computed(() => userStore.userInfo)

defineOptions({ name: "ExamPlan" });

const queryForm = reactive<ExamPlanQuery>({
  planType: 0,
  sort: ["tep.id,desc"],
});


const { width } = useWindowSize()

const conformVisible = ref(false);

const rowSelection = reactive({
  type: "checkbox",
  showCheckedAll: true,
  onlyCurrent: false,
});

const [form, resetForm] = useResetReactive({
  isFinalConfirmed: 2,
  id: undefined
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listExamPlan({ ...queryForm, ...page }), {
  immediate: true,
});

const columns = ref<TableInstanceColumns[]>([
  { title: "计划名称", dataIndex: "examPlanName", slotName: "examPlanName" },
  { title: "考试项目", dataIndex: "projectName", slotName: "examProjectId" },
  {
    title: "考场",
    dataIndex: "examRoom",
    slotName: "examRoom",
    width: 100,
    align: "center",
    show: true,
  },
  // { title: "计划年份", dataIndex: "planYear", slotName: "planYear" },
  { title: "报名时间", dataIndex: "enrollStartTime", slotName: "enrollStartTime" },
  { title: "考试时间", dataIndex: "startTime", slotName: "startTime" },
  //{ title: "考试地点", dataIndex: "locationName", slotName: "locationId" },
  {
    title: "容纳考试人数",
    dataIndex: "maxCandidates",
    slotName: "maxCandidates",
  },
  {
    title: "考试人员类型",
    dataIndex: "planType",
    slotName: "planType",
  },
  { title: "计划状态", dataIndex: "status", slotName: "status" },
  { title: "计划确认状态", dataIndex: "isFinalConfirmed", slotName: "isFinalConfirmed" },
  { title: "审批人", dataIndex: "approvedUser", slotName: "approvedUser" },
  { title: "审批时间", dataIndex: "approvalTime", slotName: "approvalTime" },
  // {
  //   title: "监考人员名单",
  //   dataIndex: "invigilate",
  //   slotName: "invigilate",
  //   width: 100,
  //   align: "center",
  //   fixed: !isMobile() ? "right" : undefined,
  //   show: has.hasPermOr(["exam:examPlan:option"]),
  // },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 200,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "exam:examPlan:detail",
      "exam:examPlan:update",
      "exam:examPlan:delete",
    ]),
  },
]);

const formRef = ref()

const ExamPlanImportModalRef =
  ref<InstanceType<typeof ExamPlanImportModal>>();

const onImport = () => {
  ExamPlanImportModalRef.value?.onOpen();
};


// 中心主任确认考试
const conformExam = async () => {
  try {
    console.log("开始校验")
    await formRef.value?.validate()
    console.log("校验通过")

    const res = await centerDirectorConform(form.id, form.isFinalConfirmed)
    console.log("接口结果", res.data)

    if (!res.data) return false

    Message.success("已确定")
    conformVisible.value = false
    search()
    return true
  } catch (e) {
    console.log("校验或请求失败", e)
    return false
  }
}


// 打开中心主任确认考试弹窗
const openConform = (record: ExamPlanResp) => {
  conformVisible.value = true
  form.id = record.id
}


const getPlanTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return "orange";
    case 1:
      return "cyan";
    default:
      return "default";
  }
};

const getPlanTypeText = (status: number) => {
  switch (status) {
    case 0:
      return "作业人员";
    case 1:
      return "检验人员";
    default:
      return "未知类型";
  }
};

const getIsFinalConfirmedColor = (status: number) => {
  switch (status) {
    case 0:
      return "orange";  // 待管理员确定
    case 1:
      return "blue";    // 待中心主任确定
    case 2:
      return "purple"; // 中心主任确定
    case 3:
      return "red";     // 中心主任驳回
    default:
      return "default";
  }
};


const getIsFinalConfirmedText = (status: number) => {
  switch (status) {
    case 0:
      return "待管理员确定";
    case 1:
      return "待中心主任确定";
    case 2:
      return "中心主任已确定";
    case 3:
      return "中心主任已驳回";
    default:
      return "未知状态";
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 1:
      return "blue"; // 待主任审核
    case 2:
      return "blue"; // 待市监局审批
    case 3:
      return "purple"; // 已生效
    case 4:
      return "red"; // 未通过
    case 5:
      return "green"; // 已开考
    case 6:
      return "gray"; // 已结束
    default:
      return "default";
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return "待主任审批";
    case 2:
      return "待市监局审批";
    case 3:
      return "已生效";
    case 4:
      return "未通过";
    case 5:
      return "已开考";
    case 6:
      return "已结束";
    default:
      return "未知状态";
  }
};

const formatDate = (date: string) => {
  return date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "-";
};
const reset = () => {
  queryForm.examPlanName = undefined;
  queryForm.projectName = undefined;
  queryForm.planYear = undefined;
  queryForm.locationName = undefined;
  queryForm.status = undefined;
  queryForm.planType = 0
  search();
};

// 删除
const onDelete = (record: ExamPlanResp) => {
  return handleDelete(() => deleteExamPlan(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportExamPlan(queryForm));
};

const ExamPlanAddModalRef = ref<InstanceType<typeof ExamPlanAddModal>>();
// 新增
const onAdd = () => {
  ExamPlanAddModalRef.value?.onAdd();
};

const ExamPlanDetailDrawerRef =
  ref<InstanceType<typeof ExamPlanDetailDrawer>>();

// 审核
const onExamineA = (record: ExamPlanResp) => {
  ExamPlanAddModalRef.value?.onExamineA(record.id);
};
// 详情
const onDetail = (record: ExamPlanResp) => {
  ExamPlanDetailDrawerRef.value?.onOpen(record.id);
};

// 修改
const onUpdate = (record: CandidateCertificateResp) => {
  ExamPlanAddModalRef.value?.onUpdate(record.id)
}

// todo上传
const test = (selectedRows: ProjectResp[]) => {
  console.log("已选择的行", selectedRows);
};

const ExamPlanInvigilatorListRef = ref<InstanceType<typeof ExamPlanInvigilatorList>>();
// 查看监考员列表
const onOptionInvigilateList = (planId: number, assignType: number) => {
  ExamPlanInvigilatorListRef.value?.onOption(planId, assignType);
};

const ExamPlanOptionModalRef = ref<InstanceType<typeof ExamPlanOptionModal>>();
// 选择监考
const onOptionInvigilate = (record: ExamPlanResp) => {
  ExamPlanOptionModalRef.value?.onOption(record);
};

const visible = ref(false)

const locationList = ref<any[]>([])


const ExamPlanLocaltionAndRoomModelRef = ref<InstanceType<typeof ExamPlanLocaltionAndRoomModel>>();
// 查看考场信息
const showExamRoom = async (record: ExamPlanResp) => {
  ExamPlanLocaltionAndRoomModelRef.value?.onOption(record)
};

const updateReviewer = (record) => {
  console.log('abc ', record)
}

const getExamTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue"; // 理论考试
    case 1:
      return "orange"; // 实操考试
    default:
      return "default";
  }
};

const getExamTypeText = (status: number) => {
  switch (status) {
    case 0:
      return "理论考试";
    case 1:
      return "实操考试";
    default:
      return "未知状态";
  }
};
</script>

<style scoped lang="scss">
.search-container {
  display: flex;
  align-items: center;
  width: 100%;

  .search-input {
    width: 180px !important;
  }

  :deep(.arco-picker) {
    width: 180px !important;
  }

  :deep(.arco-select) {
    width: 180px !important;
  }
}

.ml-2 {
  margin-left: 8px;
}

:deep(.arco-space) {
  display: flex;
  align-items: center;
}

.gi_table_page {
  position: relative;
}
</style>
