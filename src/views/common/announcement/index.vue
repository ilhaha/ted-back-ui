<template>
  <div class="gi_table_page">
    <GiTable
      title="公告管理"
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
        <a-space>
          <a-tag :color="getStatusColor(record.status)" bordered>{{
            getStatusText(record.status)
          }}</a-tag>
          <a-switch
            v-model="record.status"
            :checked-value="1"
            :unchecked-value="0"
            @change="(newStatus) => handleStatusChange(record, newStatus)"
          />
        </a-space>
      </template>
      <template #content="{ record }">
        <div class="ellipsis-text" v-html="record.content"></div>
      </template>
      <template #toolbar-left>
        <a-input-search
          v-model="queryForm.title"
          placeholder="请输入公告标题"
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
          v-permission="['common:announcement:add']"
          type="primary"
          @click="onAdd"
        >
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['common:announcement:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link
            v-permission="['common:announcement:detail']"
            title="详情"
            @click="onDetail(record)"
            >详情</a-link
          >
          <a-link
            v-permission="['common:announcement:update']"
            title="修改"
            @click="onUpdate(record)"
            >修改</a-link
          >
          <a-link
            v-permission="['common:announcement:delete']"
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

    <AnnouncementAddModal
      ref="AnnouncementAddModalRef"
      @save-success="search"
    />
    <AnnouncementDetailDrawer ref="AnnouncementDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import AnnouncementAddModal from "./AnnouncementAddModal.vue";
import AnnouncementDetailDrawer from "./AnnouncementDetailDrawer.vue";
import {
  type AnnouncementResp,
  type AnnouncementQuery,
  deleteAnnouncement,
  exportAnnouncement,
  listAnnouncement,
  updateAnnouncementStatue,
} from "@/apis/common/announcement";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import { type CarouselResp } from "@/apis/common/carousel";
import { Message } from "@arco-design/web-vue";

defineOptions({ name: "Announcement" });
const statusEnum = ref("");

// 状态更新
const handleStatusChange = async (record: CarouselResp, newStatus: number) => {
  const originalStatus = record.status; // 保存原来的状态
  try {
    await updateAnnouncementStatue(record.id, newStatus); // 传递 id 和 newStatus
    Message.success("状态更新成功");
  } catch (error) {
    Message.error("状态更新失败");
    record.status = originalStatus; // 回滚状态
    await nextTick();
  }
};

const queryForm = reactive<AnnouncementQuery>({
  title: undefined,
  status: undefined,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listAnnouncement({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: "公告ID", dataIndex: "id", slotName: "id" },
  { title: "公告标题", dataIndex: "title", slotName: "title" },
  // { title: '公告内容', dataIndex: 'content', slotName: 'content' },
  { title: "公告状态", dataIndex: "status", slotName: "status" },
  { title: "创建人ID", dataIndex: "createUserString", slotName: "createUser" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "common:announcement:detail",
      "common:announcement:update",
      "common:announcement:delete",
    ]),
  },
]);

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "red";
    case 1:
      return "blue";
    default:
      return "default";
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "禁用";
    case 1:
      return "启用";
    default:
      return "default";
  }
};

// 重置
const reset = () => {
  queryForm.title = undefined;
  queryForm.status = undefined;
  search();
};

// 删除
const onDelete = (record: AnnouncementResp) => {
  return handleDelete(() => deleteAnnouncement(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportAnnouncement(queryForm));
};

const AnnouncementAddModalRef =
  ref<InstanceType<typeof AnnouncementAddModal>>();
// 新增
const onAdd = () => {
  AnnouncementAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: AnnouncementResp) => {
  AnnouncementAddModalRef.value?.onUpdate(record.id);
};

const AnnouncementDetailDrawerRef =
  ref<InstanceType<typeof AnnouncementDetailDrawer>>();
// 详情
const onDetail = (record: AnnouncementResp) => {
  AnnouncementDetailDrawerRef.value?.onOpen(record.id);
};
</script>

<style scoped lang="scss">
.ellipsis-text {
  display: -webkit-box;
  -webkit-line-clamp: 4; /* 显示两行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
