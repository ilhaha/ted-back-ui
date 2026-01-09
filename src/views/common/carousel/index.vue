  <template>
    <div class="gi_table_page">
      <GiTable title="轮播图管理管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
        :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
        :disabled-column-keys="['name']" @refresh="search">
        <template #previewImage="{ record }">
          <a-image v-if="record.imageMinUrl" width="80" height="60" :src="record.imageMinUrl"
            :preview-props="{ zoomRate: 1.5 }" class="preview-image" fit="cover" />
          <span v-else>-</span>
        </template>
        <template #imageMinUrl="{ record }">
          <a-image width="100" height="100" :src="record.imageUrl">
            <template #loader>
              <img width="200"
                src="https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/a8c8cdb109cb051163646151a4a5083b.png~tplv-uwbnlip3yd-webp.webp"
                style="filter: blur(5px)" />
            </template>
          </a-image>
        </template>
        <template #toolbar-left>
          <a-select v-model="queryForm.status" :options="status" placeholder="请选择轮播图状态" allow-clear style="width: 150px"
            @change="search" />
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
          <a-button v-permission="['common:carousel:add']" type="primary" @click="onAdd">
            <template #icon><icon-plus /></template>
            <template #default>新增</template>
          </a-button>
          <!-- <a-button v-permission="['common:carousel:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
        </template>
        <template #action="{ record }">
          <a-space>
            <a-link v-permission="['common:carousel:detail']" title="详情" @click="onDetail(record)">详情</a-link>
            <a-link v-permission="['common:carousel:update']" title="修改" @click="onUpdate(record)">修改</a-link>
            <a-link v-permission="['common:carousel:delete']" status="danger" :disabled="record.disabled"
              :title="record.disabled ? '不可删除' : '删除'" @click="onDelete(record)">
              删除
            </a-link>
          </a-space>
        </template>
        <template #imageUrl="{ record }">
          <img :src="record.imageUrl" style="width: 70px; height: auto; border-radius: 8px" />
        </template>
        <template #status="{ record }">
          <a-space>
            <a-tag :color="getStatusColor(record.status)" bordered>{{
              getStatusText(record.status)
              }}</a-tag>
            <a-switch v-model="record.status" :checked-value="1" :unchecked-value="0"
              @change="(newStatus) => handleStatusChange(record, newStatus)" />
          </a-space>
        </template>
      </GiTable>
      <CarouselAddModal ref="CarouselAddModalRef" @save-success="search" />
      <CarouselDetailDrawer ref="CarouselDetailDrawerRef" />
    </div>
  </template>

<script setup lang="ts">
import CarouselAddModal from "./CarouselAddModal.vue";
import CarouselDetailDrawer from "./CarouselDetailDrawer.vue";
import {
  type CarouselResp,
  type CarouselQuery,
  deleteCarousel,
  exportCarousel,
  listCarousel,
  updateCarousel,
} from "@/apis/common/carousel";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useDownload, useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import { Message } from "@arco-design/web-vue";

defineOptions({ name: "Carousel" });

const status = [
  { label: "启用", value: 1 },
  { label: "禁用", value: 0 },
];
// 状态变更
const handleStatusChange = async (record: CarouselResp, newStatus: number) => {
  const originalStatus = record.status; // 保存原来的状态
  try {
    await updateCarousel({ status: newStatus }, record.id);
    Message.success("状态更新成功");
  } catch (error) {
    Message.error("状态更新失败");
    record.status = originalStatus;
    await nextTick();
  }
};

const queryForm = reactive<CarouselQuery>({
  status: undefined,
  sort: ["id,desc"],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listCarousel({ ...queryForm, ...page }), {
  immediate: true,
});
const columns = ref<TableInstanceColumns[]>([
  { title: "图片描述", dataIndex: "description", slotName: "description" },
  {
    title: "轮播图",
    dataIndex: "imageMinUrl",
    slotName: "previewImage", // 使用 slotName
  },
  // { title: '跳转链接', dataIndex: 'linkUrl', slotName: 'linkUrl' },
  { title: "排序", dataIndex: "sortOrder", slotName: "sortOrder" },
  { title: " 轮播图状态", dataIndex: "status", slotName: "status" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "common:carousel:detail",
      "common:carousel:update",
      "common:carousel:delete",
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
  queryForm.status = undefined;
  search();
};

// 删除
const onDelete = (record: CarouselResp) => {
  return handleDelete(() => deleteCarousel(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportCarousel(queryForm));
};

const CarouselAddModalRef = ref<InstanceType<typeof CarouselAddModal>>();
// 新增
const onAdd = () => {
  CarouselAddModalRef.value?.onAdd();
};

// 修改
const onUpdate = (record: CarouselResp) => {
  CarouselAddModalRef.value?.onUpdate(record.id);
};

const CarouselDetailDrawerRef =
  ref<InstanceType<typeof CarouselDetailDrawer>>();
// 详情
const onDetail = (record: CarouselResp) => {
  CarouselDetailDrawerRef.value?.onOpen(record.id);
};


</script>

<style scoped lang="scss"></style>
