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
              v-model="queryForm.title"
              placeholder="请输入通知内容"
              allow-clear
              @search="search"
            />
            <a-select
              v-model="queryForm.status"
              placeholder="通知状态"
              allow-clear
              class="search-input ml-2"
              @change="search"
              style="margin-left: 8px"
            >
              <a-option value="1">报名中</a-option>
              <a-option value="3">补报中</a-option>
              <a-option value="4">报名已结束</a-option>
            </a-select>
            <a-select
              v-model="queryForm.examLevel"
              placeholder="考试等级"
              allow-clear
              class="search-input ml-2"
              @change="search"
              style="margin-left: 8px"
            >
              <a-option value="1">Ⅰ级</a-option>
              <a-option value="2">Ⅱ级</a-option>
            </a-select>

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
                v-permission="['notice:otherTraining:detail']"
                title="培训"
                @click="onTraining(record)"
                >培训</a-link
              >
            </a-space>
          </template>
        </GiTable>
      </div>
      <!-- 右侧已培训人员列表 -->
      <div class="trained-list-wrapper">
        <div class="trained-header">
          <div class="trained-header-left">
            <span>培训交费列表 ({{ groupedTrainedList.length }})</span>
            <span class="total-fee"
              >人项数: {{ totalSelectedProjects }} 项</span
            >
            <span class="total-fee"
              >总培训费: {{ totalTrainingFee.toFixed(2) }} 元</span
            >
          </div>
          <a-button
            v-if="allConfirmedProjects.length > 0"
            type="text"
            size="small"
            @click="allConfirmedProjects = []"
          >
            下载
          </a-button>
        </div>
        <div class="trained-list">
          <template v-if="groupedTrainedList.length > 0">
            <div
              v-for="person in groupedTrainedList"
              :key="person.idCardNumber"
              class="trained-item"
            >
              <div class="person-info">
                <div class="person-left">
                  <span class="name" style="font-size:14px">{{ person.realName }}</span>
                  <span class="person-fee" >培训费: {{ person.trainingFee.toFixed(2) }} 元</span>
                </div>
                <a-link
                  class="delete-link"
                  @click="removePerson(person)"
                >
                  删除
                </a-link>
              </div>
              <div class="projects">
                <div
                  v-for="project in person.projects"
                  :key="project.applyRecordId"
                  class="project-tag"
                >
                  <a-tag color="arcoblue" >
                    {{ project.projectCode }}
                    {{ getExamAttemptTypeText(project.examAttemptType) }}
                    {{ project.practicalType }}
                  </a-tag>
                </div>
              </div>
            </div>
          </template>
          <a-empty v-else description="暂无培训人员" />
        </div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { Message, Modal } from "@arco-design/web-vue";
import {
  noticeAuditPassedPage,
  type NoticeAuditPassedVO,
  type ExamineeNoticeApplyQuery,
} from "@/apis/exam/examineeNoticeApply";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

const visible = ref(false);
const title = ref("");

defineOptions({ name: "ExamNotice" });

const queryForm = reactive<ExamineeNoticeApplyQuery>({
  examineeId: undefined,
  noticeId: undefined,
  status: undefined,
  sort: [],
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
} = useTable((page) => noticeAuditPassedPage({ ...queryForm, ...page }), {
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
  const map = new Map<string, any>();
  allConfirmedProjects.value.forEach((project) => {
    const key = project.idCardNumber;
    if (map.has(key)) {
      map.get(key).projects.push(project);
    } else {
      map.set(key, {
        idCardNumber: project.idCardNumber,
        realName: project.realName,
        projects: [project],
      });
    }
  });
  // 计算每个人的培训费
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

// 计算总培训费（按人员分组计算优惠）
const totalTrainingFee = computed(() => {
  const projects = allConfirmedProjects.value;
  if (!projects.length) {
    return 0;
  }

  // 按人员分组
  const grouped = new Map<string, any[]>();
  projects.forEach((p) => {
    const key = p.idCardNumber;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(p);
  });

  return Array.from(grouped.values()).reduce(
    (total, personProjects) => total + calculatePersonTrainingFee(personProjects),
    0
  );
});

const columns = ref<TableInstanceColumns[]>([
  // { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  { title: "序号", dataIndex: "sort", slotName: "sort", width: 80 },
  {
    title: "姓名",
    dataIndex: "realName",
    slotName: "realName",
    width: 120,
  },
  {
    title: "身份证号",
    dataIndex: "idCardNumber",
    slotName: "idCardNumber",
    width: 170,
  },
  {
    title: "单位名称",
    dataIndex: "companyName",
    slotName: "companyName",
    width: 150,
  },
  {
    title: "报考项目",
    dataIndex: "projectList",
    slotName: "projectList",
    width: 300,
  },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 80,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr(["notice:otherTraining:detail"]),
  },
]);

// 重置
const reset = () => {
  search();
};

const getExamAttemptTypeText = (type: number) => {
  return type === 1 ? "初试" : type === 2 ? "补考" : "未知";
};

// 点击培训
const onTraining = (record: NoticeAuditPassedVO) => {
  // 收集当前行选中的项目
  const selectedProjects = record.projectList
    .filter((project: any) => project.selected)
    .map((project: any) => ({
      ...project,
      realName: record.realName,
      idCardNumber: record.idCardNumber,
    }));
  // 先删除该人的所有项目
  allConfirmedProjects.value = allConfirmedProjects.value.filter(
    (p) => p.idCardNumber !== record.idCardNumber
  );
  // 添加新的选中项目
  allConfirmedProjects.value.push(...selectedProjects);
};

// 删除单个人员的所有项目
const removePerson = (person: any) => {
    allConfirmedProjects.value = allConfirmedProjects.value.filter(
        (p) => p.idCardNumber !== person.idCardNumber
      );
};

// 打开弹窗
const onOpen = (id: string, noticeTitle: string) => {
  allConfirmedProjects.value = [];
  queryForm.noticeId = id;
  title.value = noticeTitle + " - 详情";
  search();
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
