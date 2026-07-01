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
        <a-alert
          v-if="passCountList.length"
          class="grade-pass-count"
          type="info"
        >
          合格人数
          <a-tag
            v-for="item in passCountList"
            :key="item.projectId"
            color="arcoblue"
            bordered
            style="margin-left: 10px"
          >
            {{ item.projectCode }}：{{ item.passCount || 0 }}
          </a-tag>
        </a-alert>
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
      <template #toolbar-right>
        <a-upload
          :show-file-list="false"
          :custom-request="handleImportUpload"
          accept=".xls,.xlsx"
          :disabled="isGradePublished"
          v-permission="['notice:grade:import']"
        >
          <template #upload-button>
            <a-button :loading="importLoading" :disabled="isGradePublished">
              <template #icon><icon-upload /></template>
              导入成绩
            </a-button>
          </template>
        </a-upload>
      </template>
    </GiTable>
    <a-modal
      v-model:visible="importVisible"
      title="导入成绩解析结果"
      :width="1100"
      :mask-closable="false"
      @close="resetImport"
    >
      <a-space direction="vertical" fill>
        <a-alert v-if="importResult" type="info">
          可导入 {{ importResult.validList?.length || 0 }} 条，失败
          {{ importResult.failList?.length || 0 }} 条
        </a-alert>
        <a-tabs v-if="importResult" default-active-key="valid">
          <a-tab-pane key="valid" title="可导入成绩">
            <a-table
              row-key="__rowKey"
              :data="importValidTableData"
              :columns="importValidColumns"
              :span-method="importSpanMethod"
              :pagination="{ pageSize: 10 }"
              :scroll="{ x: 900 }"
            />
          </a-tab-pane>
          <a-tab-pane key="fail" title="导入失败成绩">
            <a-table
              row-key="__rowKey"
              :data="importFailTableData"
              :columns="importFailColumns"
              :span-method="importSpanMethod"
              :pagination="{ pageSize: 10 }"
              :scroll="{ x: 1000 }"
            />
          </a-tab-pane>
        </a-tabs>
      </a-space>
      <template #footer>
        <a-button @click="closeImportModal">取消</a-button>
        <a-button
          type="primary"
          :loading="confirmLoading"
          :disabled="!importResult?.validList?.length"
          @click="confirmImport"
        >
          确认导入成绩
        </a-button>
      </template>
    </a-modal>
  </a-modal>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useWindowSize } from "@vueuse/core";
import { Message } from "@arco-design/web-vue";
import {
  confirmGradeImport,
  getGradeDetailData,
  getGradeDetailHeader,
  getGradeProjectPassCount,
  parseGradeImport,
  type ExamNoticeResp,
  type GradeImportParseResp,
  type GradeImportScoreItemResp,
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

interface ImportTableRow extends GradeImportScoreItemResp {
  __rowKey: string;
  __mergeKey: string;
  __rowSpan: number;
}

const { width } = useWindowSize();

const visible = ref(false);
const loading = ref(false);
const title = ref("成绩详情");
const projectColumns = ref<ProjectColumn[]>([]);
const tableRows = ref<TableRow[]>([]);
const passCountList = ref<GradeProjectPassCountResp[]>([]);
const currentRecord = ref<ExamNoticeResp>();
const importVisible = ref(false);
const importLoading = ref(false);
const confirmLoading = ref(false);
const importResult = ref<GradeImportParseResp>();
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

const importValidColumns = [
  { title: "行号", dataIndex: "rowNum", width: 80 },
  { title: "身份证号", dataIndex: "idCard", width: 180 },
  { title: "姓名", dataIndex: "name", width: 120 },
  { title: "准考证号", dataIndex: "examNumber", width: 180 },
  { title: "项目", dataIndex: "projectCode", width: 100 },
  { title: "考核项", dataIndex: "assessmentName", width: 100 },
  { title: "成绩", dataIndex: "score", width: 100 },
];

const importFailColumns = [
  { title: "行号", dataIndex: "rowNum", width: 80 },
  { title: "身份证号", dataIndex: "idCard", width: 180 },
  { title: "姓名", dataIndex: "name", width: 120 },
  { title: "准考证号", dataIndex: "examNumber", width: 180 },
  { title: "项目", dataIndex: "projectCode", width: 100 },
  { title: "考核项", dataIndex: "assessmentName", width: 100 },
  { title: "失败原因", dataIndex: "reason", width: 220 },
];

const importMergeFields = new Set(["rowNum", "idCard", "name"]);

const tableKey = computed(() => {
  return projectColumns.value
    .map(
      (project) =>
        `${project.projectCode}:${project.subjects
          .map((subject) => subject.key)
          .join(",")}`
    )
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
        data[getScoreDataIndex(projectIndex, subject.key)] = formatScore(
          row.scores[project.projectCode]?.[subject.key]
        );
      });
    });
    return data;
  });
});

const importValidTableData = computed(() => {
  return buildImportTableData(importResult.value?.validList ?? []);
});

const importFailTableData = computed(() => {
  return buildImportTableData(importResult.value?.failList ?? []);
});

const isGradePublished = computed(() => {
  return currentRecord.value?.gradeReleaseStatus === 1;
});

const tableScrollX = computed(() => {
  const scoreColumnWidth = projectColumns.value.reduce(
    (total, item) => total + item.subjects.length * 92,
    0
  );
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

const buildImportTableData = (list: GradeImportScoreItemResp[]) => {
  const groupIndexMap = new Map<string, number>();
  const groups: GradeImportScoreItemResp[][] = [];
  list.forEach((item) => {
    const mergeKey = item.idCard || `row-${item.rowNum}-${item.name || ""}`;
    const groupIndex = groupIndexMap.get(mergeKey);
    if (groupIndex === undefined) {
      groupIndexMap.set(mergeKey, groups.length);
      groups.push([item]);
    } else {
      groups[groupIndex].push(item);
    }
  });
  return groups.flatMap((group) => {
    return group.map((item, index) => ({
      ...item,
      __rowKey: [
        item.scoreId,
        item.rowNum,
        item.idCard,
        item.examNumber,
        item.projectCode,
        item.assessmentName,
        index,
      ].join("_"),
      __mergeKey: item.idCard || `row-${item.rowNum}-${item.name || ""}`,
      __rowSpan: index === 0 ? group.length : 0,
    }));
  });
};

const importSpanMethod = ({
  record,
  column,
}: {
  record: ImportTableRow;
  column: any;
}) => {
  if (!importMergeFields.has(column.dataIndex)) {
    return;
  }
  return {
    rowspan: record.__rowSpan,
    colspan: record.__rowSpan === 0 ? 0 : 1,
  };
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
  return subjectList.map((subject) => {
    const label = String(
      getFieldValue(subject, ["assessmentName", "name", "label", "title"]) ?? ""
    ).trim();
    const key = String(
      getFieldValue(subject, ["assessmentKey", "key", "value", "code"]) ?? label
    ).trim();
    return {
      key,
      label,
    };
  });
};

const normalizeProjectColumns = (list: GradeProjectAssessmentResp[]) => {
  return list
    .map((item) => ({
      projectId: String(getFieldValue(item, ["projectId", "project_id"]) ?? ""),
      projectCode: String(
        getFieldValue(item, ["projectCode", "project_code", "code"]) ?? ""
      ).trim(),
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
    const [
      { data: headerData },
      { data: detailData },
      { data: passCountData },
    ] = await Promise.all([
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

const resetImport = () => {
  importResult.value = undefined;
};

const closeImportModal = () => {
  importVisible.value = false;
  resetImport();
};

const handleImportUpload = (options: any) => {
  const { fileItem, onSuccess, onError } = options;
  const file = fileItem.file as File;
  if (!currentRecord.value) {
    Message.error("通知信息不存在");
    onError(new Error("通知信息不存在"));
    return { abort() {} };
  }
  if (isGradePublished.value) {
    Message.warning("成绩已发布，不允许导入成绩");
    onError(new Error("成绩已发布，不允许导入成绩"));
    return { abort() {} };
  }
  const fileName = file.name.toLowerCase();
  if (!fileName.endsWith(".xls") && !fileName.endsWith(".xlsx")) {
    Message.error("只能上传 Excel 文件");
    onError(new Error("只能上传 Excel 文件"));
    return { abort() {} };
  }
  (async () => {
    importLoading.value = true;
    resetImport();
    const formData = new FormData();
    formData.append("file", file);
    try {
      const { data } = await parseGradeImport(
        currentRecord.value!.id,
        formData
      );
      importResult.value = data;
      importVisible.value = true;
      Message.success("解析成功");
      onSuccess(data);
    } catch (error) {
      onError(error);
    } finally {
      importLoading.value = false;
    }
  })();
  return { abort() {} };
};

const confirmImport = async () => {
  if (!currentRecord.value || !importResult.value?.validList?.length) return;
  confirmLoading.value = true;
  try {
    await confirmGradeImport(
      currentRecord.value.id,
      importResult.value.validList
    );
    Message.success("已导入")
    await loadDetail(currentRecord.value);
    importVisible.value = false;
  } finally {
    confirmLoading.value = false;
  }
};

const onOpen = async (record: ExamNoticeResp) => {
  visible.value = true;
  currentRecord.value = record;
  title.value = `${record.title ?? ""} - 成绩详情`;
  projectColumns.value = [];
  tableRows.value = [];
  passCountList.value = [];
  resetImport();
  queryForm.name = "";
  queryForm.idCard = "";
  pagination.current = 1;
  await loadDetail(record);
};

defineExpose({ onOpen });
</script>

<style scoped lang="scss">
.grade-pass-count {
  margin-bottom: 8px;
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
