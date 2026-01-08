<template>
  <div class="gi_table_page">
    <GiTable title="检验人员项目管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #isOperation="{ record }">
        <a-tag :color="getExamTypeColor(record.isOperation)" bordered>{{
          getExamTypeText(record.isOperation)
        }}</a-tag>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['inspector:project:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          新增
        </a-button>
        <!-- <a-button v-permission="['inspector:project:export']" class="ml-2" @click="onExport">
              <template #icon><icon-download /></template>
              导出
            </a-button> -->
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
      <template #projectStatus="{ record }">
        <a-tag :color="getStatusColor(record.projectStatus)" bordered>{{
          getStatusText(record.projectStatus)
        }}</a-tag>
      </template>

      <template #toolbar-left>
        <div class="search-container">
          <a-input-search @search="search" v-model="queryForm.projectName" placeholder="搜索项目名称" allow-clear
            class="search-input ml-2" />
          <a-input-search @search="search" v-model="queryForm.projectCode" placeholder="搜索项目代号" allow-clear
            class="search-input ml-2" />
          <!-- <a-input v-model="queryForm.createUser" placeholder="搜索创建人" allow-clear
            style="width: 100%; margin-left: 8px" /> -->
          <!-- <a-button type="primary" class="ml-2" @click="search">
            <template #icon><icon-search /></template>
搜索
</a-button> -->
          <a-button class="ml-2" @click="reset">
            <template #icon><icon-refresh /></template>
            重置
          </a-button>
          <!-- <div class="operation-btns">
            <a-button v-permission="['inspector:project:add']" type="primary" @click="onAdd">
              <template #icon><icon-plus /></template>
              新增
            </a-button>
            <a-button v-permission="['inspector:project:export']" class="ml-2" @click="onExport">
              <template #icon><icon-download /></template>
              导出
            </a-button>
          </div> -->
        </div>
      </template>
      <template #action="{ record }">
        <a-space :size="2">
          <div v-if="record.projectStatus === 1">
            <a-link v-permission="['inspector:project:examine']" title="审核" @click="onExamineA(record)">审核</a-link>
            <a-link v-permission="['inspector:project:detail']" title="详情" @click="onDetail(record)">详情</a-link>
            <a-link v-permission="['inspector:project:update']" title="修改" @click="onUpdate(record)">修改</a-link>

          </div>
          <!-- 状态2：仅显示详情 + 删除 -->
          <div v-else-if="record.projectStatus === 2">
            <a-link v-permission="['exam:project:detail']" title="详情" @click="onDetail(record)">详情</a-link>
            <a-link v-permission="['exam:project:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          </div>
          <div v-else>
            <a-link v-permission="['inspector:project:detail']" title="详情" @click="onDetail(record)">详情</a-link>
            <!-- <a-link v-permission="['inspector:project:update']" title="修改" @click="onUpdate(record)">修改</a-link> -->
            <!--            <a-link-->
            <!--                v-permission="['inspector:project:delete']"-->
            <!--                status="danger"-->
            <!--                :disabled="record.disabled"-->
            <!--                :title="record.disabled ? '不可删除' : '删除'"-->
            <!--                @click="onDelete(record)"-->
            <!--            >-->
            <!--              删除-->
            <!--            </a-link>-->
          </div>
          <a-link v-permission="['inspector:project:delete']" status="danger" :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'" @click="onDelete(record)">
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <ProjectAddModal ref="ProjectAddModalRef" @save-success="search" />
    <ProjectDetailDrawer ref="ProjectDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import ProjectAddModal from "./ProjectAddModal.vue";
import ProjectDetailDrawer from "./ProjectDetailDrawer.vue";
import {
  type ProjectResp,
  type ProjectQuery,
  deleteProject,
  exportProject,
  listProject,
} from "@/apis/exam/project";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import type { ColumnItem } from "@/components/GiForm";
import { DisEnableStatusList } from "@/constant/common";

defineOptions({ name: "Project" });

const queryForm = reactive<ProjectQuery>({
  projectType: 1,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listProject({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  // { title: "项目展示图", dataIndex: "imageUrl", slotName: "imageUrl" },
  { title: "项目名称", dataIndex: "projectName", slotName: "projectName", align: "center" },
  { title: "所属八大类", dataIndex: "categoryName", slotName: "categoryName", align: "center" },
  { title: "项目代码", dataIndex: "projectCode", slotName: "projectCode", align: "center" },
  { title: "考试时长（分钟）", dataIndex: "examDuration", slotName: "examDuration", align: "center" },
  { title: "项目状态", dataIndex: "projectStatus", slotName: "projectStatus", align: "center" },
  { title: "实操考试", dataIndex: "isOperation", slotName: "isOperation", align: "center" },
  { title: "项目收费标准（元）", dataIndex: "examFee", slotName: "examFee", align: "center" },
  {
    title: "创建人",
    dataIndex: "createUserString",
    slotName: "createUserString", align: "center"
  },
  { title: "创建时间", dataIndex: "createTime", slotName: "createTime", align: "center" },
  //{ title: "部门名称", dataIndex: "deptName", slotName: "deptName" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 180,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "inspector:project:detail",
      "inspector:project:update",
      "inspector:project:delete",
    ]),
  },
]);

// 搜索
const reset = () => {
  queryForm.projectName = undefined;
  queryForm.projectCode = undefined;
  queryForm.createUser = undefined;
  queryForm.projectStatus = undefined;
  search();
};

const searchForm: ColumnItem[] = reactive([
  {
    type: "input",
    field: "projectName",
    span: { xs: 12, sm: 8, xxl: 3 },
    formItemProps: {
      hideLabel: true,
    },
    props: {
      placeholder: "搜索项目名称",
      showWordLimit: false,
    },
  },
  {
    type: "input",
    field: "projectCode",
    span: { xs: 12, sm: 6, xxl: 3 },
    formItemProps: {
      hideLabel: true,
    },
    props: {
      options: DisEnableStatusList,
      placeholder: "搜索项目代号",
    },
  },
  {
    type: "input",
    field: "createUser",
    span: { xs: 12, sm: 10, xxl: 3 },
    formItemProps: {
      hideLabel: true,
    },
    props: {
      options: DisEnableStatusList,
      placeholder: "搜索创建人",
    },
  },
  {
    type: "select",
    field: "projectStatus",
    span: { xs: 12, sm: 10, xxl: 3 },
    formItemProps: {
      hideLabel: true,
    },
    props: {
      options: DisEnableStatusList,
      placeholder: "项目状态",
    },
  },
  {
    type: "button",
    span: { xs: 12, sm: 10, xxl: 1 },
    formItemProps: {
      hideLabel: true,
    },
    props: {
      type: "primary",
      onClick: search,
    },
    slots: {
      default: "搜索",
    },
  },
  {
    type: "button",
    span: { xs: 12, sm: 10, xxl: 1 },
    formItemProps: {
      hideLabel: true,
    },
    props: {
      type: "primary",
      onClick: reset,
    },
    slots: {
      default: "重置",
    },
  },
]);

const clearReset = () => {
  searchForm.forEach((item) => {
    if (item.type === "input") {
      item.props.value = "";
    }
  });
  reset();
};

// 删除
const onDelete = (record: ProjectResp) => {
  return handleDelete(() => deleteProject(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportProject(queryForm));
};

const ProjectAddModalRef = ref<InstanceType<typeof ProjectAddModal>>();

// 新增
const onAdd = () => {
  ProjectAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: ProjectResp) => {
  ProjectAddModalRef.value?.onUpdate(record.id);
};

const ProjectDetailDrawerRef = ref<InstanceType<typeof ProjectDetailDrawer>>();
// 详情
const onDetail = (record: ProjectResp) => {
  ProjectDetailDrawerRef.value?.onOpen(record.id);
};

//审核
const onExamineA = (record: ProjectResp) => {
  ProjectAddModalRef.value?.onExamineA(record.id);
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "gray"; // 未上架
    case 1:
      return "blue"; // 已上架
    case 2:
      return "green"; // 进行中
    case 3:
      return "red"; // 已停用
    default:
      return "default";
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "未上架";
    case 1:
      return "待审核";
    case 2:
      return "进行中";
    case 3:
      return "已停用";
    default:
      return "未知状态";
  }
};

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
      return "无";
    case 1:
      return "有";
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

  >.arco-input-wrapper,
  >.arco-select {
    width: 200px;
  }

  .operation-btns {
    margin-left: auto;
    display: flex;
    align-items: center;
  }
}

.ml-2 {
  margin-left: 8px;
}
</style>
