<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['nickname']" @refresh="search">
      <template #top>
        <GiForm v-model="queryForm" search :columns="queryFormColumns" size="medium" @search="search" @reset="reset">
        </GiForm>
      </template>
      <template #toolbar-left>
        <a-button v-permission="['examAffair:invigilation:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button @click="openBatchExport" v-permission="['examAffair:invigilation:exportFee']">
          <template #icon><icon-download /></template>
          <template #default>批量导出劳务费</template>
        </a-button>
      </template>
      <template #nickname="{ record }">
        <GiCellAvatar :avatar="record.avatar" :name="record.nickname" />
      </template>
      <template #gender="{ record }">
        <GiCellGender :gender="record.gender" />
      </template>
      <template #roleNames="{ record }">
        <GiCellTags :data="record.roleNames" />
      </template>
      <template #status="{ record }">
        <GiCellStatus :status="record.status" />
      </template>
      <template #examSupervisionType="{ record }">
        <a-tag :color="getExamSupervisionTypeColor(record.examSupervisionType)" bordered>{{
          getExamSupervisionTypeText(record.examSupervisionType)
        }}</a-tag>
      </template>
      <template #isSystem="{ record }">
        <a-tag v-if="record.isSystem" color="red" size="small">是</a-tag>
        <a-tag v-else color="arcoblue" size="small">否</a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['examAffair:invigilation:addQualification']" title="资质列表"
            @click="onAddQualification(record)">
            资质上传
          </a-link>
          <a-link v-permission="['examAffair:invigilation:exportFee']" @click="openSingleExport(record)">
            劳务费导出
          </a-link>
          <a-dropdown>
            <a-button
              v-if="has.hasPermOr(['examAffair:invigilation:resetPwd', 'examAffair:invigilation:delete', 'examAffair:invigilation:update'])"
              type="text" size="mini" title="更多">
              <template #icon>
                <icon-more :size="16" />
              </template>
            </a-button>
            <template #content>
              <a-doption v-permission="['system:user:update']" :disabled="record.isSystem" title="修改"
                @click="onUpdate(record)">修改</a-doption>
              <a-doption v-permission="['examAffair:invigilation:delete']" :disabled="record.isSystem"
                :title="record.isSystem ? '系统内置数据不能删除' : '删除'" @click="onDelete(record)">删除</a-doption>
              <a-doption v-permission="['system:user:resetPwd']" title="重置密码"
                @click="onResetPwd(record)">重置密码</a-doption>
            </template>
          </a-dropdown>
        </a-space>
      </template>
    </GiTable>

    <a-modal :visible="singleVisible" :title="singleTitle" width="30%" :footer="false" @cancel="onCancelSingle">
      <div class="import-modal-content">
        <a-alert>请选择开始月份和结束月份，系统将按所选月份区间生成报表数据。</a-alert>
        <div class="cascader-container">
          <a-form layout="vertical">
            <a-form-item label="所需导出月份">
              <a-month-picker v-model="singleRange" mode="month" />
            </a-form-item>
          </a-form>
        </div>
        <div class="action-buttons">
          <a-button type="dashed" @click="singleExport" :loading="exproLoadding">
            <template #icon>
              <icon-download />
            </template>
            导出
          </a-button>
        </div>
      </div>
    </a-modal>

    <a-modal :visible="batchVisible" title="劳务费导出" width="30%" :footer="false" @cancel="onCancelBatch">
      <div class="import-modal-content">
        <a-alert>请选择开始月份和结束月份，系统将按所选月份区间生成报表数据。</a-alert>
        <div class="cascader-container">
          <a-form layout="vertical">
            <a-form-item label="所需导出月份">
              <a-month-picker v-model="batchRange" mode="month" />
            </a-form-item>
          </a-form>
        </div>
        <div class="action-buttons">
          <a-button type="dashed" @click="batchExport" :loading="exproLoadding">
            <template #icon>
              <icon-download />
            </template>
            导出
          </a-button>
        </div>
      </div>
    </a-modal>

    <UserAddDrawer ref="UserAddDrawerRef" @save-success="search" />
    <UserImportDrawer ref="UserImportDrawerRef" @save-success="search" />
    <UserDetailDrawer ref="UserDetailDrawerRef" />
    <UserResetPwdModal ref="UserResetPwdModalRef" />
    <UserUpdateRoleModal ref="UserUpdateRoleModalRef" @save-success="search" />
    <QualificationModal ref="qualificationModalRef" />
  </div>
</template>

<script setup lang="ts">
import UserAddDrawer from "./UserAddDrawer.vue";

import UserImportDrawer from "./UserImportDrawer.vue";
import UserDetailDrawer from "./UserDetailDrawer.vue";
import UserResetPwdModal from "./UserResetPwdModal.vue";
import UserUpdateRoleModal from "./UserUpdateRoleModal.vue";
import QualificationModal from "./QualificationModal.vue";
import {
  type UserResp,
  exportUser,
  listExamStaff,
  deleteExamStaff,
  exportExamStaffFee,
  batchExportExamStaffFee
} from "@/apis/system/user";
import type { TableInstanceColumns } from "@/components/GiTable/type";
import { DisEnableStatusList } from "@/constant/common";
import { useDownload, useResetReactive, useTable } from "@/hooks";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import type { ColumnItem } from "@/components/GiForm";
import { Message, Modal } from "@arco-design/web-vue";

defineOptions({ name: "SystemUser" });

const [queryForm, resetForm] = useResetReactive({
  sort: ["t1.id,desc"],
});
const queryFormColumns: ColumnItem[] = reactive([
  {
    type: "input",
    field: "description",
    span: { xs: 24, sm: 8, xxl: 8 },
    formItemProps: {
      hideLabel: true,
    },
    props: {
      placeholder: "搜索昵称",
      showWordLimit: false,
    },
  },
  {
    type: "select",
    field: "status",
    span: { xs: 24, sm: 6, xxl: 8 },
    formItemProps: {
      hideLabel: true,
    },
    props: {
      options: DisEnableStatusList,
      placeholder: "请选择状态",
    },
  },
  // {
  //   type: 'range-picker',
  //   field: 'createTime',
  //   span: { xs: 24, sm: 10, xxl: 8 },
  //   formItemProps: {
  //     hideLabel: true,
  //   },
  // },
]);

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listExamStaff({ ...queryForm, ...page }), {
  immediate: true,
});
const columns: TableInstanceColumns[] = [
  {
    title: "序号",
    width: 66,
    align: "center",
    render: ({ rowIndex }) =>
      h(
        "span",
        {},
        rowIndex + 1 + (pagination.current - 1) * pagination.pageSize
      ),
    fixed: !isMobile() ? "left" : undefined,
  },
  {
    title: "昵称",
    dataIndex: "nickname",
    slotName: "nickname",
    minWidth: 140,
    ellipsis: true,
    tooltip: true,
    fixed: !isMobile() ? "left" : undefined,
  },
  {
    title: "用户名",
    dataIndex: "username",
    slotName: "username",
    minWidth: 140,
    ellipsis: true,
    tooltip: true,
  },
  { title: "监考考试类型", dataIndex: "examSupervisionType", slotName: "examSupervisionType", align: "center" },
  { title: "状态", dataIndex: "status", slotName: "status", align: "center" },
  { title: "性别", dataIndex: "gender", slotName: "gender", align: "center" },
  {
    title: "角色",
    dataIndex: "roleNames",
    slotName: "roleNames",
    minWidth: 165,
  },
  {
    title: "手机号",
    dataIndex: "phone",
    minWidth: 170,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: "邮箱",
    dataIndex: "email",
    minWidth: 170,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: "系统内置",
    dataIndex: "isSystem",
    slotName: "isSystem",
    width: 100,
    align: "center",
    show: false,
  },
  {
    title: "描述",
    dataIndex: "description",
    minWidth: 130,
    ellipsis: true,
    tooltip: true,
  },
  {
    title: "创建人",
    dataIndex: "createUserString",
    width: 140,
    ellipsis: true,
    tooltip: true,
    show: false,
  },
  { title: "创建时间", dataIndex: "createTime", width: 180 },
  {
    title: "修改人",
    dataIndex: "updateUserString",
    width: 140,
    ellipsis: true,
    tooltip: true,
    show: false,
  },
  { title: "修改时间", dataIndex: "updateTime", width: 180, show: false },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 220,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
    show: has.hasPermOr([
      "examAffair:invigilation:exportFee",
      "system:user:detail",
      "system:user:resetPwd",
      "examAffair:invigilation:delete",
      "system:user:update",
      "examAffair:invigilation:addQualification",
    ]),
  },
];

const forbiddenRoleIds = [
  "547888897925840930",
  "547888897925840949",
  "547888897925840935",
];

const singleVisible = ref(false);
const singleTitle = ref("");
const singleRecord = ref<UserResp>();
// 绑定月份范围
const singleRange = ref('')
const exproLoadding = ref(false);

const batchVisible = ref(false);
const batchRange = ref('')


const canShowUpdate = computed(() => {
  return (roleIds: string[]) => {
    return roleIds?.every((id) => !forbiddenRoleIds.includes(id));
  };
});

const getExamSupervisionTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue"; // 理论考试
    case 1:
      return "orange"; // 实操考试
    default:
      return "default";
  }
};

const getExamSupervisionTypeText = (status: number) => {
  switch (status) {
    case 0:
      return "理论考试";
    case 1:
      return "实操考试";
    default:
      return "未知状态";
  }
};

// 重置
const reset = () => {
  resetForm();
  search();
};

// 删除
const onDelete = (record: UserResp) => {
  return handleDelete(() => deleteExamStaff(record.id), {
    content: `是否确定删除用户「${record.nickname}」？`,
    showModal: true,
  });
};

// 导出
const onExport = () => {
  useDownload(() => exportUser(queryForm));
};


const openSingleExport = (record: UserResp) => {
  singleRecord.value = record;
  singleTitle.value = `${record.nickname}-劳务费导出`;
  singleVisible.value = true;
};


const openBatchExport = () => {
  batchVisible.value = true;
};


const singleExport = () => {

  if (!singleRange.value) {
    Message.error("请选择导出月份");
    return;
  }

  onExportFee(singleRecord.value!, singleRange.value);

};
const batchExport = async () => {

  if (!batchRange.value) {
    Message.error("请选择导出月份");
    return;
  }

  try {
    exproLoadding.value = true;
    const res = await batchExportExamStaffFee(batchRange.value);

    // 文件名
    const fileName = `劳动费支出表（检验检测人员）${batchRange.value}.xlsx`;

    // 正确的 Excel MIME 类型
    const blob = new Blob(
      [res.data],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }
    );

    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    Message.success("已导出");

  } catch (err) {
  } finally {
    exproLoadding.value = false;
  }
};


// 单人劳务费导出
const onExportFee = (record: UserResp, exportDate: string) => {
  try {
    exproLoadding.value = true
    useDownload(
      () => exportExamStaffFee({ userId: record.id, exportDate }),
      false,
      `${record.nickname}-劳务费`
    );
  } finally {
    exproLoadding.value = false;
  }

};

const onCancelSingle = () => {
  singleVisible.value = false;
  singleRecord.value = undefined;
  singleRange.value = '';
};

const onCancelBatch = () => {
  batchVisible.value = false;
  batchRange.value = '';
};



// 根据选中部门查询
const handleSelectDept = (keys: Array<any>) => {
  queryForm.deptId = keys.length === 1 ? keys[0] : undefined;
  search();
};

const UserImportDrawerRef = ref<InstanceType<typeof UserImportDrawer>>();
// 导入
const onImport = () => {
  UserImportDrawerRef.value?.onOpen();
};

const UserAddDrawerRef = ref<InstanceType<typeof UserAddDrawer>>();
// 新增
const onAdd = () => {
  UserAddDrawerRef.value?.onAdd();
};

// 修改
const onUpdate = (record: UserResp) => {
  UserAddDrawerRef.value?.onUpdate(record.id);
};
// 添加资质
const qualificationModalRef = ref();
const onAddQualification = (record) => {
  qualificationModalRef.value.open(record.id);
};

const UserDetailDrawerRef = ref<InstanceType<typeof UserDetailDrawer>>();
// 详情
const onDetail = (record: UserResp) => {
  UserDetailDrawerRef.value?.onOpen(record.id);
};

const UserResetPwdModalRef = ref<InstanceType<typeof UserResetPwdModal>>();
// 重置密码
const onResetPwd = (record: UserResp) => {
  UserResetPwdModalRef.value?.onOpen(record.id);
};

const UserUpdateRoleModalRef = ref<InstanceType<typeof UserUpdateRoleModal>>();
// 分配角色
const onUpdateRole = (record: UserResp) => {
  UserUpdateRoleModalRef.value?.onOpen(record.id);
};
</script>

<style scoped lang="scss">
.page_header {
  flex: 0 0 auto;
}

.page_content {
  flex: 1;
  overflow: auto;
}

.import-modal-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.action-buttons {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin: 15px;
}
</style>
