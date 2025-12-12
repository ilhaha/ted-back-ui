<template>
  <div class="gi_table_page">
    <GiTable
      title="考试劳务费配置管理"
      :row-key="(record) => record.id"
      :data="dataList"
      :columns="columns"
      :loading="loading"
      :pagination="pagination"
      @refresh="search"
    >
      <!-- 左侧工具栏 -->
      <template #toolbar-left>
        <a-select
          v-model="queryForm.isEnabled"
          :options="isEnabledOptions"
          placeholder="请选择是否启用"
          allow-clear
          style="width: 150px"
          @change="search"
        />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>

      <!-- 右侧工具栏 -->
      <template #toolbar-right>
        <a-button
          v-permission="['invigilate:laborFee:add']"
          type="primary"
          @click="onAdd"
        >
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <a-button
          v-permission="['invigilate:laborFee:export']"
          @click="onExport"
        >
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button>
      </template>

      <!-- 是否启用列 -->
      <template #isEnabled="{ record }">
        <a-switch
          v-model="record.isEnabled"
          @change="(val) => onToggleEnabled(record, val)"
        >
          <template #checked>启用</template>
          <template #un-checked>禁用</template>
        </a-switch>
      </template>

      <!-- 操作列 -->
      <template #action="{ record }">
        <a-space>
          <!-- <a-link
            v-permission="['invigilate:laborFee:detail']"
            @click="onDetail(record)"
            >详情</a-link
          > -->
          <a-link
            v-permission="['invigilate:laborFee:update']"
            @click="onUpdate(record)"
            >修改</a-link
          >
          <a-link
            v-permission="['invigilate:laborFee:delete']"
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

    <!-- 弹窗 -->
    <LaborFeeAddModal ref="addModalRef" @save-success="search" />
    <LaborFeeDetailDrawer ref="detailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import { useTable, useDownload } from "@/hooks";
import LaborFeeAddModal from "./LaborFeeAddModal.vue";
import LaborFeeDetailDrawer from "./LaborFeeDetailDrawer.vue";
import { Message } from "@arco-design/web-vue";
import {
  type LaborFeeResp,
  type LaborFeeQuery,
  listLaborFee,
  deleteLaborFee,
  exportLaborFee,
  toggleLaborFeeEnabled,
} from "@/apis/invigilate/laborFee";

const queryForm = reactive<LaborFeeQuery>({
  isEnabled: undefined,
  sort: ["id,desc"],
});

// 是否启用枚举
const isEnabledOptions = [
  { label: "启用", value: true },
  { label: "禁用", value: false },
];

// 表格数据
const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listLaborFee({ ...queryForm, ...page }), {
  immediate: true,
});

// 表格列
const columns = ref([
  {
    title: "实操考试劳务费单价（元）",
    dataIndex: "practicalFee",
    slotName: "practicalFee",
  },
  {
    title: "理论考试劳务费单价（元）",
    dataIndex: "theoryFee",
    slotName: "theoryFee",
  },
  { title: "备注", dataIndex: "remark", slotName: "remark" },
  { title: "是否启用", dataIndex: "isEnabled", slotName: "isEnabled" },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 160,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "invigilate:laborFee:detail",
      "invigilate:laborFee:update",
      "invigilate:laborFee:delete",
    ]),
  },
]);

// 重置筛选
const reset = () => {
  queryForm.isEnabled = undefined;
  search();
};

// 新增、修改、详情弹窗引用
const addModalRef = ref<InstanceType<typeof LaborFeeAddModal>>();
const detailDrawerRef = ref<InstanceType<typeof LaborFeeDetailDrawer>>();

const onAdd = () => addModalRef.value?.onAdd();
const onUpdate = (record: LaborFeeResp) =>
  addModalRef.value?.onUpdate(record.id);
const onDetail = (record: LaborFeeResp) =>
  detailDrawerRef.value?.onOpen(record.id);

// 切换启用/禁用
const onToggleEnabled = async (record, val) => {
  try {
    await toggleLaborFeeEnabled({ id: record.id, isEnabled: val });
    record.isEnabled = val;
    search();
    Message.success(val ? "已启用" : "已禁用");
  } catch (e) {
    // 回滚状态
    record.isEnabled = !val;
  }
};

// 删除
const onDelete = (record: LaborFeeResp) => {
  return handleDelete(() => deleteLaborFee(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true,
  });
};

// 导出
const onExport = () => useDownload(() => exportLaborFee(queryForm));
</script>

<style scoped lang="scss"></style>
