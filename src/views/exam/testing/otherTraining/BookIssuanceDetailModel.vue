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
          :row-selection="rowSelection"
          @select="select"
          @select-all="selectAll"
        >
          <template #toolbar-left>
            <a-input-search
              v-model="queryForm.username"
              placeholder="身份证号"
              allow-clear
              @search="search"
            />
            <a-input-search
              v-model="queryForm.nickname"
              placeholder="姓名"
              allow-clear
              @search="search"
            />
            <a-input-search
              v-model="queryForm.companyName"
              placeholder="单位名称"
              allow-clear
              @search="search"
            />
            <a-select
              v-model="queryForm.bookIssuanceStatus"
              placeholder="发书状态"
              allow-clear
              @change="search"
            >
              <a-option value="0">待发书</a-option>
              <a-option value="1">已发书</a-option>
            </a-select>
            <a-button @click="reset">
              <template #icon><icon-refresh /></template>
              <template #default>重置</template>
            </a-button>
          </template>
          <template #toolbar-right>
            <a-button
              v-permission="['bookIssuance:trainingFee:oper']"
              type="primary"
              :disabled="selectedKeys.length === 0"
              @click="onBatchBookIssuance"
            >
              <template #icon><icon-send /></template>
              <template #default>批量发书</template>
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
          <template #bookIssuanceStatus="{ record }">
            <a-tag
              :color="getBookIssuanceStatusColor(record.bookIssuanceStatus)"
            >
              {{ getBookIssuanceStatusText(record.bookIssuanceStatus) }}
            </a-tag>
          </template>
          <template #action="{ record }">
            <a-space>
              <a-link
                v-if="record.bookIssuanceStatus == 0"
                v-permission="['bookIssuance:trainingFee:oper']"
                title="发书"
                @click="onBookIssuance(record)"
                >发书</a-link
              >
            </a-space>
          </template>
        </GiTable>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { Message, Modal } from "@arco-design/web-vue";
import {
  getBookIssuanceRecordPage,
  bookIssuance,
} from "@/apis/exam/examineeNoticeApply";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";

const visible = ref(false);
const title = ref("");
defineOptions({ name: "ExamNotice" });

interface BookIssuanceQuery {
  noticeId: string | undefined;
  username: string | undefined;
  nickname: string | undefined;
  companyName: string | undefined;
  bookIssuanceStatus: string | undefined;
  sort: Array<string>;
}

const queryForm = reactive<BookIssuanceQuery>({
  noticeId: undefined,
  username: undefined,
  nickname: undefined,
  companyName: undefined,
  bookIssuanceStatus: undefined,
  sort: ["id,desc"],
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
  refresh,
} = useTable((page) => getBookIssuanceRecordPage({ ...queryForm, ...page }), {
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

// 发书
const onBookIssuance = (record: any) => {
  Modal.confirm({
    title: "发书",
    content: `确定要为考生「${record.nickname}」发书吗？`,
    onOk: async () => {
      await bookIssuance([record.id]);
      Message.success("发书成功");
      refresh();
    },
  });
};

// 批量发书
const onBatchBookIssuance = () => {
  if (selectedKeys.value.length === 0) {
    Message.warning("请先选择要发书的学员");
    return;
  }
  // 过滤出未发书的学员
  const notIssuedRecords = dataList.value.filter(
    (item: any) =>
      selectedKeys.value.includes(item.id) && item.bookIssuanceStatus == 0
  );
  if (notIssuedRecords.length === 0) {
    Message.warning("所选学员均为已发书状态，无法继续操作");
    return;
  }
  const notIssuedIds = notIssuedRecords.map((item: any) => item.id);
  const alreadyIssuedCount = selectedKeys.value.length - notIssuedIds.length;
  Modal.confirm({
    title: "批量发书",
    content:
      alreadyIssuedCount > 0
        ? `选中学员包含 ${alreadyIssuedCount} 名已发书人员，将为其余 ${notIssuedIds.length} 名学员发书，确定继续吗？`
        : `确定要为选中的 ${notIssuedIds.length} 名学员发书吗？`,
    onOk: async () => {
      await bookIssuance(notIssuedIds);
      Message.success("发书成功");
      selectedKeys.value = [];
      refresh();
    },
  });
};

const columns = ref<TableInstanceColumns[]>([
  {
    title: "身份证号",
    dataIndex: "username",
    slotName: "username",
  },
  {
    title: "姓名",
    dataIndex: "nickname",
    slotName: "nickname",
  },
  {
    title: "单位名称",
    dataIndex: "companyName",
    slotName: "companyName",
  },
  {
    title: "培训项目",
    dataIndex: "projectCodes",
    slotName: "projectCodes",
  },
  {
    title: "发书状态",
    dataIndex: "bookIssuanceStatus",
    slotName: "bookIssuanceStatus",
  },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr(["bookIssuance:trainingFee:oper"]),
  },
]);

// 重置
const reset = () => {
  queryForm.username = undefined;
  queryForm.nickname = undefined;
  queryForm.companyName = undefined;
  queryForm.bookIssuanceStatus = undefined;
  search();
};

const getBookIssuanceStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待发书";
    case 1:
      return "已发书";
  }
};
const getBookIssuanceStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue";
    case 1:
      return "green";
  }
};

// 打开弹窗
const onOpen = (id: string, noticeTitle: string) => {
  queryForm.noticeId = id;
  reset();
  title.value = noticeTitle + " - 已交费学员列表";
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
