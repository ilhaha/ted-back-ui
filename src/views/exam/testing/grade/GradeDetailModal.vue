<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :width="width >= 1400 ? 1400 : '100%'"
    :footer="false"
    :mask-closable="false"
  >
    <GiTable
      :key="tableKey"
      class="grade-detail-table"
      row-key="key"
      :data="tableData"
      :columns="tableColumns"
      :loading="loading"
      :pagination="pagination"
      :disabled-tools="['size']"
      :scroll="{ x: tableScrollX, y: 'calc(100vh - 320px)' }"
      @refresh="refresh"
    >
      <template #top>
        <div v-if="passCountList.length" class="grade-pass-count">
          <span class="grade-pass-count__label">项目及格人数：</span>
          <a-space wrap>
            <a-tag
              v-for="item in passCountList"
              :key="item.projectId"
              color="green"
              bordered
            >
              {{ item.projectCode }}：{{ item.passCount || 0 }}
            </a-tag>
          </a-space>
        </div>
      </template>
      <template #toolbar-left>
        <a-input-search
          v-model="queryForm.name"
          placeholder="请输入姓名"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.idCard"
          placeholder="请输入身份证号"
          allow-clear
          @search="search"
        />
        <a-button type="primary" @click="search">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          重置
        </a-button>
      </template>
    </GiTable>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useWindowSize } from "@vueuse/core";
import {
  getGradeDetailData,
  getGradeDetailHeader,
  getGradeProjectPassCount,
  type ExamNoticeResp,
  type GradeProjectPassCountResp,
  type GradeProjectAssessmentResp,
} from "@/apis/exam/examNotice";
import type { TableInstanceColumns } from "@/components/GiTable/type";

interface SubjectColumn {
  key: string;
  label: string;
}

interface ProjectColumn {
  projectId?: string;
  projectCode: string;
  planId?: string;
  subjects: SubjectColumn[];
}

interface TableRow {
  key: string;
  sort: string | number;
  idCard: string;
  name: string;
  scores: Record<string, any>;
}

const { width } = useWindowSize();

const visible = ref(false);
const loading = ref(false);
const title = ref("成绩详情");
const projectColumns = ref<ProjectColumn[]>([]);
const tableRows = ref<TableRow[]>([]);
const passCountList = ref<GradeProjectPassCountResp[]>([]);
const currentRecord = ref<ExamNoticeResp>();
const queryForm = reactive({
  name: "",
  idCard: "",
});

const pagination = reactive({
  showPageSize: true,
  showTotal: true,
  current: 1,
  pageSize: 10,
  pageSizeOptions: [10, 20, 30, 40, 50],
  total: 0,
  onChange: (current: number) => {
    pagination.current = current;
    refresh();
  },
  onPageSizeChange: (pageSize: number) => {
    pagination.current = 1;
    pagination.pageSize = pageSize;
    refresh();
  },
});

const tableColumns = computed<TableInstanceColumns[]>(() => {
  return [
    {
      title: "序号",
      dataIndex: "sort",
      align: "center",
      fixed: "left",
      width: 90,
    },
    {
      title: "身份证号",
      dataIndex: "idCard",
      align: "center",
      fixed: "left",
    },
    {
      title: "姓名",
      dataIndex: "name",
      align: "center",
      fixed: "left",
    },
    ...projectColumns.value.map((project, projectIndex) => ({
      title: project.projectCode,
      align: "center",
      children: project.subjects.map((subject) => ({
        title: subject.label,
        dataIndex: getScoreDataIndex(projectIndex, subject.key),
        width: 100,
        align: "center",
      })),
    })),
  ];
});

const tableKey = computed(() => {
  return projectColumns.value
    .map((project) => `${project.projectCode}:${project.subjects.map((subject) => subject.key).join(",")}`)
    .join("|");
});

const tableData = computed(() => {
  return tableRows.value.map((row) => {
    const data: Record<string, unknown> = {
      key: row.key,
      sort: row.sort,
      idCard: row.idCard,
      name: row.name,
    };
    projectColumns.value.forEach((project, projectIndex) => {
      project.subjects.forEach((subject) => {
        data[getScoreDataIndex(projectIndex, subject.key)] = formatScore(row.scores[project.projectCode]?.[subject.key]);
      });
    });
    return data;
  });
});

const tableScrollX = computed(() => {
  const scoreColumnWidth = projectColumns.value.reduce((total, item) => total + item.subjects.length * 92, 0);
  return 550 + scoreColumnWidth;
});

const getScoreDataIndex = (projectIndex: number, subjectKey: string) => {
  return `score_${projectIndex}_${subjectKey}`;
};

const getFieldValue = (data: any, fieldNames: string[]) => {
  for (const field of fieldNames) {
    const value = data?.[field];
    if (value !== undefined && value !== null && value !== "") {
      return value;
    }
  }
  return undefined;
};

const normalizeSubjects = (item: any) => {
  const subjectList = getFieldValue(item, [
    "assessmentList",
    "assessmentContentList",
    "examContentList",
    "subjectList",
    "children",
  ]);
  if (!Array.isArray(subjectList)) return [];
  return subjectList
    .map((subject) => {
      const label = String(getFieldValue(subject, ["assessmentName", "name", "label", "title"]) ?? "").trim();
      const key = String(getFieldValue(subject, ["assessmentKey", "key", "value", "code"]) ?? label).trim();
      return {
        key,
        label,
      };
    }
    );
};

const normalizeProjectColumns = (list: GradeProjectAssessmentResp[]) => {
  return list
    .map((item) => ({
      projectId: String(getFieldValue(item, ["projectId", "project_id"]) ?? ""),
      projectCode: String(getFieldValue(item, ["projectCode", "project_code", "code"]) ?? "").trim(),
      subjects: normalizeSubjects(item),
    }))
    .filter((item) => item.projectCode && item.subjects.length);
};

const formatScore = (value: unknown) => {
  if (value === undefined || value === null) return "\\";
  if (value === "") return 0;
  return value;
};

const search = () => {
  pagination.current = 1;
  refresh();
};

const reset = () => {
  queryForm.name = "";
  queryForm.idCard = "";
  search();
};

const loadDetail = async (record: ExamNoticeResp) => {
  loading.value = true;
  try {
    const [{ data: headerData }, { data: detailData }, { data: passCountData }] = await Promise.all([
      getGradeDetailHeader(record.id),
      getGradeDetailData(record.id, {
        page: pagination.current,
        size: pagination.pageSize,
        name: queryForm.name || undefined,
        idCard: queryForm.idCard || undefined,
      }),
      getGradeProjectPassCount(record.id),
    ]);
    projectColumns.value = normalizeProjectColumns(headerData ?? []);
    passCountList.value = passCountData ?? [];
    pagination.total = detailData?.total ?? 0;
    tableRows.value = (detailData?.list ?? []).map((item) => ({
      key: String(item.candidateId),
      sort: item.sort,
      idCard: item.idCard,
      name: item.name,
      scores: item.scores ?? {},
    }));
  } finally {
    loading.value = false;
  }
};

const refresh = () => {
  if (currentRecord.value) {
    loadDetail(currentRecord.value);
  }
};

const onOpen = async (record: ExamNoticeResp) => {
  visible.value = true;
  currentRecord.value = record;
  title.value = `${record.title ?? ""} - 成绩详情`;
  projectColumns.value = [];
  tableRows.value = [];
  passCountList.value = [];
  queryForm.name = "";
  queryForm.idCard = "";
  pagination.current = 1;
  await loadDetail(record);
};

defineExpose({ onOpen });
</script>

<style scoped lang="scss">
.grade-pass-count {
  display: flex;
  align-items: center;
  padding: 8px 0;

  &__label {
    margin-right: 8px;
    color: var(--color-text-2);
    white-space: nowrap;
  }
}

.grade-detail-table {
  color: #000;

  // :deep(.arco-table-td) {
  //   height: 78px;
  //   color: #000;
  //   font-size: 28px;
  //   line-height: 1.2;
  //   word-break: keep-all;
  // }
}
</style>
