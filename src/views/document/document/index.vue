<template>
  <div class="gi_table_page">
    <GiTable title="检验人员报名资料管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #previewImage="{ record }">
        <a-space v-if="record.docPath">
          <a-image v-for="(path, index) in record.docPath.split(',')" :key="index" width="80" height="60" :src="path"
            :preview-props="{ zoomRate: 1.5 }" class="preview-image" fit="cover"  />
        </a-space>
        <span v-else>-</span>
      </template>
      <template #toolbar-left>
        <!-- <a-input-search v-model="queryForm.docPath" placeholder="请输入存储路径(如/img/身份证正面.jpg)" allow-clear @search="search" /> -->
        <!-- <a-input-search v-model="queryForm.typeId" placeholder="请输入关联资料类型ID" allow-clear @search="search" /> -->
        <!-- <a-input-search v-model="queryForm.createUser" placeholder="请输入创建人ID" allow-clear @search="search" /> -->
        <GiForm :style="''" v-model="queryForm" search :columns="searchForm" size="medium" @search="search"
          @reset="reset" />
      </template>
      <template #status="{ record }">
        <template>
          <a-space size="large">
            <a-dropdown @select="handleSelect">
              <a-button>Click Me</a-button>
              <template #content>
                <a-doption>Option 1</a-doption>
                <a-doption disabled>Option 2</a-doption>
                <a-doption :value="{ value: 'Option3' }">Option 3</a-doption>
              </template>
            </a-dropdown>
          </a-space>
        </template>
        <a-tag :color="getStatusColor(record.status)">{{
          getStatusText(record.status)
        }}</a-tag>
      </template>
      <template #pendingCount="{ record }">
        {{record.documents.filter(d => d.status === 1).length}}
        /
        {{record.documents.filter(d => d.status === 0).length}}
      </template>
      <template #fixCount="{ record }">
        {{record.documents.filter(d => d.status === 2).length}}
        /
        {{record.documents.filter(d => d.status === 3).length}}
      </template>

      <template #action="{ record }">
        <a-space>
          <a-link title="查看" @click="onViewDocuments(record)" v-permission="['document:document:detail']">查看资料</a-link>
        </a-space>
      </template>
    </GiTable>
    <DocumentAddModal ref="DocumentAddModalRef" @save-success="search" @审核成功="search" />
    <DocumentDetailDrawer ref="DocumentDetailDrawerRef" />
    <DocumentListModal ref="DocumentListModalRef" />
  </div>
</template>

<script setup lang="ts">
import DocumentAddModal from "./DocumentAddModal.vue";
import DocumentDetailDrawer from "./DocumentDetailDrawer.vue";
import DocumentListModal from "./DocumentListModal.vue";
import {
  type DocumentResp,
  type DocumentQuery,
  deleteDocument,
  exportDocument,
  listDocument,
} from "@/apis/document/document";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import type { ColumnItem } from "@/components/GiForm";
import { useDocument } from "@/hooks/document/useDocument";

defineOptions({ name: "Document" });

const { typeNameList, getTypeNameList } = useDocument();

const queryForm = reactive<DocumentQuery>({
  docPath: undefined,
  typeId: undefined,
  createUser: undefined,
  sort: ["id,desc"],
});
// 默认加载下拉框内容
getTypeNameList();

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待审核";
    case 1:
      return "已生效";
    case 2:
      return "待补正";
    case 3:
      return "补正审核";
    default:
      return "";
  }
};
const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "red";
    case 1:
      return "green";
    case 2:
      return "orange";
    case 3:
      return "orange";
    default:
      return "default";
  }
};
const statusList = ref([
  { label: "待审核", value: 0 },
  { label: "已生效", value: 1 },
  { label: "待补正", value: 2 },
  { label: "补正审核", value: 3 },
]);
const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listDocument({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: "用户名称", dataIndex: "nickName", slotName: "nickName" },
  {
    title: "资料数",
    dataIndex: "documents.length",
    slotName: "documentsCount",
    align: "center",
  },
  {
    title: "已生效 / 待审核",
    dataIndex: "pendingCount",
    slotName: "pendingCount",
    align: "center",
  },
  {
    title: "待补正 / 补正审核",
    dataIndex: "fixCount",
    slotName: "fixCount",
    align: "center",
  },

  // {
  //   title: "资料图片",
  //   dataIndex: "docPath",
  //   slotName: "previewImage",
  //   align: "center",
  // },
  // { title: "审核状态", dataIndex: "status", slotName: "status" },
  // { title: "审核备注", dataIndex: "auditRemark", slotName: "auditRemark" },
  // {
  //   title: "创建时间",
  //   dataIndex: "createTime",
  //   slotName: "createTime",
  //   align: "center",
  // },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "document:document:examine",
      "document:document:detail",
    ]),
  },
]);

// 重置
const reset = () => {
  queryForm.typeId = undefined;
  queryForm.status = undefined;
  search();
};

const searchForm: ColumnItem[] = reactive([
  {
    type: "select",
    field: "typeId",
    formItemProps: {
      hideLabel: true,
    },
    props: {
      options: typeNameList,
      placeholder: "搜索资料种类",
      showWordLimit: false,
    },
  },
  {
    type: "select",
    field: "status",
    formItemProps: {
      hideLabel: true,
    },
    props: {
      options: statusList,
      placeholder: "搜索运营状态",
    },
  },
]);

// 删除
const onDelete = (record: DocumentResp) => {
  return handleDelete(() => deleteDocument(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportDocument(queryForm));
};

const DocumentAddModalRef = ref<InstanceType<typeof DocumentAddModal>>();
// 新增
const onAdd = () => {
  DocumentAddModalRef.value?.onAdd();
};
//审核
const onExamine = async (record: DocumentResp) => {
  DocumentAddModalRef.value?.onExamine(
    record.id,
    record.typeId,
    record.candidateId
  );
};
// 修改
const onUpdate = (record: DocumentResp) => {
  DocumentAddModalRef.value?.onUpdate(record.id);
};

const DocumentDetailDrawerRef =
  ref<InstanceType<typeof DocumentDetailDrawer>>();
// 详情
const onDetail = (record: DocumentResp) => {
  DocumentDetailDrawerRef.value?.onOpen(record.id);
};

const DocumentListModalRef = ref<InstanceType<typeof DocumentListModal>>();
// 查看相关资料
const onViewDocuments = (record: DocumentResp) => {
  console.log("DocumentListModalRef:", DocumentListModalRef.value);
  console.log("record.documents:", record.documents);

  if (DocumentListModalRef.value) {
    if (record.documents && record.documents.length > 0) {
      DocumentListModalRef.value.open(record.documents); // 调用 open 方法
    } else {
      console.warn("该考生没有相关资料");
    }
  } else {
    console.error("DocumentListModalRef 未正确绑定");
  }
};


// 确保每个 record 都有 documents 字段
dataList.value = dataList.value.map((item) => ({
  ...item,
  documents: item.documents || [],
}));
</script>


<style scoped lang="scss"></style>
