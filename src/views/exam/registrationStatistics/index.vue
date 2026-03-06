<template>
  <div class="gi_table_page">
    <GiTable
      title="报名统计报表"
      row-key="id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }"
      :pagination="pagination"
      :disabled-tools="['size']"
      :disabled-column-keys="['name']"
      @refresh="search"
    >
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.enrollStatus)">
          {{ getStatusText(record.enrollStatus) }}
        </a-tag>
      </template>

      <template #gender="{ record }">
        <span>{{ getGenderText(record.gender) }}</span>
      </template>

   <template #index="{ rowIndex }">
  {{ (pagination.current - 1) * pagination.pageSize + rowIndex + 1 }}
</template>

      <template #toolbar-left>
        <a-cascader
          v-model="queryForm.examProjectId"
          :options="examProjectOptions"
          placeholder="请选择考试项目"
          allow-clear
          allow-search
        />
        <a-cascader
          v-model="queryForm.examPlanId"
          :options="examPlanOptions"
          placeholder="请选择考试计划"
          allow-clear
          allow-search
          @change="search"
          :disabled="!examPlanOptions.length"
        />
        <!-- <a-button type="primary" class="ml-2" @click="search">
          <template #icon><icon-search /></template>
搜索
</a-button> -->
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
        <a-dropdown>
          <a-button type="primary">
            <template #icon><icon-download /></template>
            <template #default>导出Excel</template>
          </a-button>
          <template #content>
            <a-doption @click="downloadByProject">根据考试项目导出</a-doption>
            <a-doption @click="downloadByPlan">根据考试计划导出</a-doption>
          </template>
        </a-dropdown>
      </template>
      <template #toolbar-right> </template>
    </GiTable>
  </div>
</template>

<script setup lang="ts">
import {
  getExamCandidatesByPlanOrProject,
  exportExamCandidatesByPlanOrProject,
} from "@/apis/exam/enroll";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useTable, useExamPlanProject } from "@/hooks";
import { getCascaderPlanByProjectId } from "@/apis/exam/examPlan";

import { ref, reactive, onMounted, computed, watch } from "vue";
import { Message } from "@arco-design/web-vue";

defineOptions({ name: "SpecialCertificationApplicant" });

const { examProjectOptions, getExamProjectOptions } = useExamPlanProject();

interface EnrollQuery {
  examProjectId?: any;
  examPlanId?: any;
  sort?: string[];
}

const queryForm = reactive<EnrollQuery>({
  examProjectId: undefined,
  examPlanId: undefined,
  sort: ["id,desc"],
});

const examPlanOptions = ref<any[]>([]);

// 构建请求参数，剔除 undefined 字段，避免qs.stringify生成空参数
const buildQuery = () => {
  const obj: any = {};
  if (
    queryForm.examProjectId !== undefined &&
    queryForm.examProjectId !== null
  ) {
    let projectVal = queryForm.examProjectId;
    if (Array.isArray(projectVal)) {
      projectVal = projectVal.at(-1);
    }
    if (projectVal !== undefined && projectVal !== null) {
      obj.projectId = projectVal;
    }
  }
  if (queryForm.examPlanId !== undefined && queryForm.examPlanId !== null) {
    let planVal = queryForm.examPlanId;
    if (Array.isArray(planVal)) {
      planVal = planVal.at(-1);
    }
    if (planVal !== undefined && planVal !== null) {
      obj.planId = planVal;
    }
  }
  if (queryForm.sort !== undefined) obj.sort = queryForm.sort;
  return obj;
};

const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable(
  (page) => getExamCandidatesByPlanOrProject({ ...buildQuery(), ...page }),
  { immediate: true }
);

const getStatusColor = (status: number) => {
  switch (status) {
    case 1:
      return "green";
    default:
      return "default";
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 1:
      return "审核通过";
    default:
      return "未知状态";
  }
};

const getGenderText = (gender: number) => {
    switch (gender) {
      case 1:
        return "男";
      case 2:
        return "女";
      default:
        return "未知";
    }
  };

const columns = ref<TableInstanceColumns[]>([
  { title: "序号", dataIndex: "index", slotName: "index", width: 80, align: "center" },
  { title: "考生名称", dataIndex: "nickName" },
  { title: "身份证号", dataIndex: "username" },
  { title: "性别", dataIndex: "gender", slotName: "gender" },
  { title: "电话", dataIndex: "phone" },
  { title: "准考证号", dataIndex: "examNumber" },
  { title: "单位名称", dataIndex: "companyName" },
  { title: "项目种类", dataIndex: "categoryName" },
  { title: "考试项目", dataIndex: "examProjectName" },
  { title: "考试计划名称", dataIndex: "examPlanName" },
  { title: "报名结束时间", dataIndex: "enrollEndTime" },
  { title: "考试开始时间", dataIndex: "examStartTime" },
]);

// 重置
const reset = () => {
  queryForm.examProjectId = undefined;
  queryForm.examPlanId = undefined;
  examPlanOptions.value = [];
  search();
};

// 导出根据考试项目
const downloadByProject = async () => {
  if (!queryForm.examProjectId) {
    Message.warning("请选择考试项目");
    return;
  }

  const projectId = Array.isArray(queryForm.examProjectId)
    ? queryForm.examProjectId.at(-1)
    : queryForm.examProjectId;

  const res = await exportExamCandidatesByPlanOrProject({ projectId });

  downloadFile(res);
};

// 导出根据考试计划
const downloadByPlan = async () => {
  if (!queryForm.examPlanId) {
    Message.warning("请选择考试计划");
    return;
  }

  const planId = Array.isArray(queryForm.examPlanId)
    ? queryForm.examPlanId.at(-1)
    : queryForm.examPlanId;

  const res = await exportExamCandidatesByPlanOrProject({ planId });

  downloadFile(res);
};
//导出文件处理函数
const downloadFile = (res: any) => {
  const blob = new Blob([res.data]);

  let fileName = "导出数据.xlsx";

  const disposition = res.headers["content-disposition"];
  if (disposition) {
    const match = disposition.match(/filename=([^;]+)/);
    if (match) {
      fileName = decodeURIComponent(match[1]);
    }
  }

  const link = document.createElement("a");
  link.href = window.URL.createObjectURL(blob);
  link.download = fileName;
  link.click();

  window.URL.revokeObjectURL(link.href);
};

// 页面加载时获取考试项目选项
onMounted(async () => {
  await getExamProjectOptions(1); // 1 对应检验员类型，如需其他类型可修改此参数
});

// 当选择了考试项目后加载对应考试计划
watch(
  () => queryForm.examProjectId,
  async (val) => {
    // 每次更换项目都应清空之前的考试计划选择
    queryForm.examPlanId = undefined;

    if (!val) {
      examPlanOptions.value = [];
      search();
      return;
    }
    // 取最后一级ID
    const projectId = Array.isArray(val) ? val.at(-1) : val;
    try {
      const res = await getCascaderPlanByProjectId(projectId);
      // 接口可能直接返回数组或包含 data 字段
      examPlanOptions.value = res?.data || res;
    } catch (e) {
      console.error("加载考试计划失败", e);
      examPlanOptions.value = [];
    }
    // 选择项目后触发搜索，此时 examPlanId 已被清空
    search();
  }
);

</script>

<style scoped lang="scss"></style>
