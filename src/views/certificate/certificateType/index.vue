<template>
  <div class="gi_table_page">
    <GiTable
      title="证件种类管理"
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
      <template #imageUrl="{ record }">
        <a-image width="100" height="100" :src="record.imageUrl">
          <template #loader>
            <img
              width="200"
              src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp"
              style="filter: blur(5px)"
            />
          </template>
        </a-image>
      </template>
      <template #toolbar-left>
        <a-input-search
          v-model="queryForm.projectName"
          placeholder="请输入所属项目名称"
          allow-clear
          @search="search"
        />
        <a-input-search
          v-model="queryForm.certificateName"
          placeholder="请输入证件名称"
          allow-clear
          @search="search"
        />
        <a-button type="primary" class="ml-2" @click="search">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button
          v-permission="['certificate:certificateType:add']"
          type="primary"
          @click="onAdd"
        >
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['certificate:certificateType:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link
            v-permission="['certificate:certificateType:update']"
            title="修改"
            @click="onUpdate(record)"
            >修改</a-link
          >
          <a-link
            v-permission="['certificate:certificateType:delete']"
            status="danger"
            :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'"
            @click="onDelete(record)"
          >
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <CertificateTypeAddModal
      ref="CertificateTypeAddModalRef"
      @save-success="search"
    />
    <CertificateTypeDetailDrawer ref="CertificateTypeDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import CertificateTypeAddModal from "./CertificateTypeAddModal.vue";
import CertificateTypeDetailDrawer from "./CertificateTypeDetailDrawer.vue";
import {
  type CertificateTypeResp,
  type CertificateTypeQuery,
  deleteCertificateType,
  exportCertificateType,
  listCertificateType,
} from "@/apis/certificate/certificateType";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { useDict } from "@/hooks/app";
import { isMobile } from "@/utils";
import has from "@/utils/has";

defineOptions({ name: "CertificateType" });

const queryForm = reactive<CertificateTypeQuery>({
  projectName: undefined,
  certificateName: undefined,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listCertificateType({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  // { title: '主键ID', dataIndex: 'id', slotName: 'id' },
  {
    title: "证书种类展示图",
    dataIndex: "imageUrl",
    slotName: "imageUrl",
    width: 150,
  },
  { title: "所属项目名称", dataIndex: "projectName", slotName: "projectName" },
  {
    title: "证件名称",
    dataIndex: "certificateName",
    slotName: "certificateName",
  },
  // { title: '创建人', dataIndex: 'createUserString', slotName: 'createUser' },
  // { title: '更新人', dataIndex: 'updateUserString', slotName: 'updateUser' },
  // { title: '是否删除，0:未删除，1:已删除', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "certificate:certificateType:update",
      "certificate:certificateType:delete",
    ]),
  },
]);

// 重置
const reset = () => {
  queryForm.certificateName = undefined;
  queryForm.projectName = undefined;
  search();
};

// 删除
const onDelete = (record: CertificateTypeResp) => {
  return handleDelete(() => deleteCertificateType(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportCertificateType(queryForm));
};

const CertificateTypeAddModalRef =
  ref<InstanceType<typeof CertificateTypeAddModal>>();
// 新增
const onAdd = () => {
  CertificateTypeAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: CertificateTypeResp) => {
  CertificateTypeAddModalRef.value?.onUpdate(record.id);
};

const CertificateTypeDetailDrawerRef =
  ref<InstanceType<typeof CertificateTypeDetailDrawer>>();
// 详情
const onDetail = (record: CertificateTypeResp) => {
  CertificateTypeDetailDrawerRef.value?.onOpen(record.id);
};
</script>

<style scoped lang="scss"></style>
