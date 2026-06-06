<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :width="width >= 900 ? 900 : '90%'"
    :footer="null"
    :mask-closable="false"
  >
    <div class="detail-container">
      <!-- 左侧表格 -->
      <div class="table-wrapper">
        <GiTable
          title=""
          row-key="id"
          :data="dataList"
          :columns="columns"
          :loading="loading"
          :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
          :pagination="pagination"
          :disabled-tools="['size']"
          :disabled-column-keys="['name']"
          @refresh="search"
          :expandable="expandable"
        >
          <template #toolbar-left>
            <a-input-search
              v-model="queryForm.paymentOrderNo"
              placeholder="培训单号"
              allow-clear
              @search="search"
            />
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              <template #default>重置</template>
            </a-button>
          </template>
          <template #projectList="{ record }">
            <div class="project-list">
              <a-checkbox
                v-for="item in record.projectList"
                :key="item.projectId"
                v-model="item.selected"
                class="project-item"
              >
                {{ item.projectCode }}
                {{ getExamAttemptTypeText(item.examAttemptType) }}
                {{ item.practicalType }}
                {{
                  "【" +
                  (item.paymentOrderNo ? item.paymentOrderNo : "-") +
                  "】"
                }}
              </a-checkbox>
            </div>
          </template>
          <template #action="{ record }">
            <a-space>
              <a-link
                v-permission="['exam:trainingFeeNoticeDetail:detail']"
                title="详情"
                @click="onBillsDetail(record)"
                >详情</a-link
              >
            </a-space>
          </template>
        </GiTable>
      </div>
      <!-- 右侧已培训人员列表 -->
      <div class="trained-list-wrapper">
        <div class="trained-header">
          <div class="trained-header-left">
            <span
              >{{ paymentOrderNo }}单据列表 ({{
                groupedTrainedList.length
              }})</span
            >
            <span class="total-fee"
              >人项数: {{ totalSelectedProjects }} 项</span
            >
            <span class="total-fee"
              >总培训费: {{ totalTrainingFee.toFixed(2) }} 元</span
            >
          </div>
        </div>
        <div class="trained-list">
          <template v-if="groupedTrainedList.length > 0">
            <div
              v-for="person in groupedTrainedList"
              :key="person.applyId"
              class="trained-item"
            >
              <div class="person-info">
                <div class="person-left">
                  <span class="name" style="font-size: 14px">{{
                    person.realName
                  }}</span>
                  <span class="person-fee"
                    >培训费: {{ person.trainingFee.toFixed(2) }} 元</span
                  >
                </div>
              </div>
              <div class="projects">
                <div
                  v-for="project in person.projects"
                  :key="project.applyRecordId"
                  class="project-tag"
                >
                  <a-tag color="arcoblue">
                    {{ project.projectCode }}
                    {{ getExamAttemptTypeText(project.examAttemptType) }}
                    {{ project.practicalType }}
                  </a-tag>
                </div>
              </div>
            </div>
          </template>
          <a-empty v-else description="暂无培训信息" />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { Message, Modal } from "@arco-design/web-vue";
import {
  type TrainingFeeNoticeQuery,
  type TrainingFeeNoticeDetailResp,
  listTrainingFeeNotice,
  getTrainingFeeNotice,
} from "@/apis/exam/trainingFeeNotice";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

const visible = ref(false);
const title = ref("");
const paymentOrderNo = ref("");
defineOptions({ name: "ExamNotice" });

const queryForm = reactive<TrainingFeeNoticeQuery>({
  noticeId: undefined,
  paymentOrderNo: undefined,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
  selectedKeys,
  select,
  selectAll,
  refresh,
} = useTable((page) => listTrainingFeeNotice({ ...queryForm, ...page }), {
  immediate: false,
});

const rowSelection = reactive({
  type: "checkbox",
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedKeys,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys;
  },
});

// 表格行展开配置
const expandable = reactive({
  expandedRowKeys: [] as string[],
  defaultExpandAllRows: true,
});

// 所有确认的项目数组
const allConfirmedProjects = ref<any[]>([]);

// 按人员分组的数据
const groupedTrainedList = computed(() => {
  const map = new Map<number, any>();
  allConfirmedProjects.value.forEach((project) => {
    const key = project.applyId;
    if (map.has(key)) {
      map.get(key).projects.push(project);
    } else {
      map.set(key, {
        applyId: project.applyId,
        idCardNumber: project.idCardNumber,
        realName: project.realName,
        companyName: project.companyName,
        projects: [project],
      });
    }
  });
  return Array.from(map.values()).map((person: any) => ({
    ...person,
    trainingFee: calculatePersonTrainingFee(person.projects),
  }));
});

// 计算单个人员的培训费（考虑优惠）
const calculatePersonTrainingFee = (projects: any[]) => {
  if (!projects.length) {
    return 0;
  }

  const hasProject = (code: string) =>
    projects.some((p) => p.projectCode === code);

  const mt = hasProject("MT");
  const pt = hasProject("PT");
  const rt = hasProject("RT");
  const ut = hasProject("UT");

  const getFee = (p: any) => {
    let fee = Number(p.trainingFee || 0);
    if (p.examAttemptType === 2 && p.practicalType) {
      const typeStr = String(p.practicalType).replace(/^\[|\]$/g, "");
      const types = typeStr ? typeStr.split("、") : [];
      if (types.length > 0 && types.length < 2) {
        fee = fee * 0.5;
      }
    }
    return fee;
  };

  // 只有 MT 或 PT：原价
  if ((mt && !pt) || (pt && !mt)) {
    return projects.reduce((sum, p) => sum + getFee(p), 0);
  }

  // MT + PT + RT + UT：MT + PT + MAX(RT, UT)
  if (mt && pt && rt && ut) {
    const mtPtSum = projects
      .filter((p) => p.projectCode === "MT" || p.projectCode === "PT")
      .reduce((sum, p) => sum + getFee(p), 0);
    const rtUtMax = Math.max(
      ...projects
        .filter((p) => p.projectCode === "RT" || p.projectCode === "UT")
        .map((p) => getFee(p))
    );
    return mtPtSum + rtUtMax;
  }

  // MT + PT + (RT 或 UT 其中一个）：只收 MT + PT 的总和
  if (mt && pt && (rt || ut)) {
    return projects
      .filter((p) => p.projectCode === "MT" || p.projectCode === "PT")
      .reduce((sum, p) => sum + getFee(p), 0);
  }

  // MT + PT：取两者中最大价格
  if (mt && pt) {
    const fees = projects
      .filter((p) => p.projectCode === "MT" || p.projectCode === "PT")
      .map((p) => getFee(p));
    return Math.max(...fees);
  }

  // 其他情况：原价总和
  return projects.reduce((sum, p) => sum + getFee(p), 0);
};

// 已选项目总数
const totalSelectedProjects = computed(() => {
  return allConfirmedProjects.value.length;
});

// 计算单个项目的费用（考虑补考折扣）
const getProjectFee = (p: any) => {
  let fee = Number(p.trainingFee || 0);
  if (p.examAttemptType === 2 && p.practicalType) {
    // 补考：去掉首尾的[]后用逗号分隔
    const typeStr = String(p.practicalType).replace(/^\[|\]$/g, "");
    const types = typeStr ? typeStr.split("、") : [];
    if (types.length > 0 && types.length < 2) {
      fee = fee * 0.5;
    }
  }
  return fee;
};

// 计算总培训费
const totalTrainingFee = computed(() =>
  groupedTrainedList.value.reduce((sum, p) => sum + p.trainingFee, 0)
);

const columns = ref<TableInstanceColumns[]>([
  {
    title: "培训单号",
    dataIndex: "paymentOrderNo",
    slotName: "paymentOrderNo",
  },
  {
    title: "培训总金额",
    dataIndex: "totalAmount",
    slotName: "totalAmount",
  },
  {
    title: "培训人项总数",
    dataIndex: "totalPersonItemCount",
    slotName: "totalPersonItemCount",
  },
  {
    title: "创建日期",
    dataIndex: "createTime",
    slotName: "createTime",
  },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr(["exam:trainingFeeNoticeDetail:detail"]),
  },
]);

// 重置
const reset = () => {
  queryForm.paymentOrderNo = undefined;
  search();
};

const getExamAttemptTypeText = (type: number) => {
  return type === 1 ? "初试" : type === 2 ? "补考" : "未知";
};

// 点击详情
const onBillsDetail = async (record: TrainingFeeNoticeDetailResp) => {
  paymentOrderNo.value = record.paymentOrderNo + " - ";
  const res = await getTrainingFeeNotice(record.id);
  const detail = res.data;
  allConfirmedProjects.value = [];
  // 展开每个人的 projectList，每个人一个卡片
  const selectedProjects = (detail.noticeAuditPassedVOList || []).flatMap(
    (person: any) =>
      (person.projectList || []).map((p: any) => ({
        ...p,
        applyId: person.applyId,
        realName: person.realName,
        idCardNumber: person.idCardNumber,
        companyName: person.companyName,
      }))
  );
  // 移除已在列表中的人员（按 applyId 去重），再合并新的
  const existIds = new Set(selectedProjects.map((sp: any) => sp.applyId));
  allConfirmedProjects.value = allConfirmedProjects.value.filter(
    (p: any) => !existIds.has(p.applyId)
  );
  allConfirmedProjects.value.push(...selectedProjects);
};

// 打开弹窗
const onOpen = (id: string, noticeTitle: string) => {
  allConfirmedProjects.value = [];
  queryForm.noticeId = id;
  reset();
  title.value = noticeTitle + " - 单据记录";
  visible.value = true;
};

defineExpose({ onOpen });
</script>

<style scoped lang="scss">
.detail-container {
  display: flex;
  gap: 16px;
  height: 500px;
}

.table-wrapper {
  flex: 1;
  min-width: 0;
}

.trained-list-wrapper {
  width: 280px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background: #fafafa;
}

.trained-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--color-border);
  font-weight: 500;
  background: #fff;
}

.trained-header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;

  .total-fee {
    color: #ff4d4f;
    font-size: 12px;
    font-weight: normal;
  }
}

.trained-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.trained-item {
  padding: 12px;
  margin-bottom: 8px;
  background: #fff;
  border-radius: 4px;
  font-size: 12px;

  .person-info {
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .person-left {
      display: flex;
      align-items: center;
      gap: 25px;
    }

    .name {
      font-weight: 600;
    }

    .idcard {
      color: #666;
    }

    .person-fee {
      // color: #ff4d4f;
      font-weight: 500;
    }

    .delete-link {
      color: #ff4d4f;
      cursor: pointer;

      &:hover {
        color: #ff7875;
      }
    }
  }

  .projects {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
}

.project-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.project-item {
  margin-bottom: 2px;
}
</style>
