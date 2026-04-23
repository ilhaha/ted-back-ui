<template>
  <div class="gi_table_page">
    <GiTable title="人员及许可证书信息管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-date-picker v-model="queryForm.applyDate" placeholder="申请日期" format="YYYY-MM-DD" class="search-input ml-2"
          @change="search" />
        <a-input-search v-model="queryForm.psnlcnsItemCode" placeholder="证书项目代码" allow-clear @search="search" />
        <a-input-search v-model="queryForm.psnName" placeholder="请输入姓名" allow-clear @search="search" />

        <a-input-search v-model="queryForm.idcardNo" placeholder="请输入身份证号" allow-clear @search="search" />
        <a-select v-model="queryForm.address" placeholder="工作区域" allow-clear class="search-input ml-2" @change="search">
          <a-option value="东城区">东城区</a-option>
          <a-option value="西城区">西城区</a-option>
          <a-option value="朝阳区">朝阳区</a-option>
          <a-option value="丰台区">丰台区</a-option>
          <a-option value="石景山区">石景山区</a-option>
          <a-option value="海淀区">海淀区</a-option>
          <a-option value="顺义区">顺义区</a-option>
          <a-option value="通州区">通州区</a-option>
          <a-option value="大兴区">大兴区</a-option>
          <a-option value="房山区">房山区</a-option>
          <a-option value="门头沟区">门头沟区</a-option>
          <a-option value="昌平区">昌平区</a-option>
          <a-option value="大兴区">大兴区</a-option>
          <a-option value="平谷区">平谷区</a-option>
          <a-option value="密云区">密云区</a-option>
          <a-option value="延庆区">延庆区</a-option>
        </a-select>
        <a-select v-model="queryForm.certGenerated" placeholder="许可状态" allow-clear class="search-input ml-2"
          @change="search">
          <a-option value="0">待许可</a-option>
          <a-option value="1">已许可</a-option>
        </a-select>
        <a-select v-model="queryForm.approvalType" placeholder="许可类型" allow-clear class="search-input ml-2"
          @change="search">
          <a-option value="0">初审</a-option>
          <a-option value="1">复审</a-option>
        </a-select>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #approvalType="{ record }">
        <a-tag :color="getApprovalTypeColor(record.approvalType)" bordered>
          {{ getApprovalTypeText(record.approvalType) }}
        </a-tag>
      </template>
      <template #certGenerated="{ record }">
        <a-tag :color="getCertGeneratedColor(record.certGenerated)" bordered>
          {{ getCertGeneratedText(record.certGenerated) }}
        </a-tag>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:certificate:download']" :loading="downloading" type="primary"
          @click="handleBatchDownload">
          <template #icon><icon-download /></template>
          <template #default>批量下载资格证</template>
        </a-button>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:certificate:download']" title="下载资格证" :loading="downloading"
            @click="downloadQualificationCertificate(record)">
            下载
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <a-modal v-model:visible="visible" title="批量下载资格证" :on-before-ok="handleOk" unmountOnClose>
      <a-form :model="formState" layout="vertical">

        <!-- 考试项目（必选） -->
        <a-form-item label="考核项目种类" required>
          <a-select v-model="formState.categoryId" placeholder="请选择考核项目种类" :options="examProjectOptions" allow-clear>
          </a-select>
        </a-form-item>
        <!-- 时间范围（非必须） -->
        <a-form-item label="申请时间范围">
          <a-range-picker v-model="formState.dateRange" style="width: 100%" />
        </a-form-item>

      </a-form>
    </a-modal>

    <LicenseCertificateAddModal ref="LicenseCertificateAddModalRef" @save-success="search" />
    <LicenseCertificateDetailDrawer ref="LicenseCertificateDetailDrawerRef" />
  </div>
</template>

<script setup lang="ts">
import LicenseCertificateAddModal from './LicenseCertificateAddModal.vue'
import LicenseCertificateDetailDrawer from './LicenseCertificateDetailDrawer.vue'
import { type LicenseCertificateResp, type LicenseCertificateQuery, deleteLicenseCertificate, exportLicenseCertificate, listLicenseCertificate } from '@/apis/exam/licenseCertificate'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import {
  downloadQualificationCertificate as downloadQualificationCertificateApi,
  downloadQualificationCertificateByCategory
} from '@/apis/exam/examRecords'

import { useDownload, useTable, useExamPlanProject, useResetReactive } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { Message } from '@arco-design/web-vue'


defineOptions({ name: 'LicenseCertificate' })


const queryForm = reactive<LicenseCertificateQuery>({
  psnName: undefined,
  idcardNo: undefined,
  certGenerated: undefined,
  approvalType: undefined,
  psnlcnsItemCode: undefined,
  applyDate: undefined,
  sort: ['certGenerated,asc', 'applyDate,desc']
})
const downloading = ref(false);

const { examProjectOptions, getExamProjectOptions } = useExamPlanProject();

const visible = ref(false);

const formState = ref({
  categoryId: undefined,
  dateRange: [] as any[],
});

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
} = useTable((page) => listLicenseCertificate({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  // { title: '数据来源', dataIndex: 'datasource', slotName: 'datasource' },
  // { title: '信息录入单位', dataIndex: 'infoinputorg', slotName: 'infoinputorg' },
  { title: '姓名', dataIndex: 'psnName', slotName: 'psnName' },
  { title: '身份证号', dataIndex: 'idcardNo', slotName: 'idcardNo' },
  { title: '原单位名称', dataIndex: 'originalComName', slotName: 'originalComName' },
  { title: '单位名称', dataIndex: 'comName', slotName: 'comName' },
  { title: '工作区域', dataIndex: 'address', slotName: 'address' },
  // { title: '申请类型', dataIndex: 'applyType', slotName: 'applyType' },
  // { title: '是否审核', dataIndex: 'isVerify', slotName: 'isVerify' },
  // { title: '是否操作', dataIndex: 'isOpr', slotName: 'isOpr' },
  { title: '证书类别', dataIndex: 'lcnsKind', slotName: 'lcnsKind' },
  { title: '证书项目名称', dataIndex: 'psnlcnsItem', slotName: 'psnlcnsItem' },
  { title: '证书项目代码', dataIndex: 'psnlcnsItemCode', slotName: 'psnlcnsItemCode' },
  { title: '许可类型', dataIndex: 'approvalType', slotName: 'approvalType' },
  { title: '许可状态', dataIndex: 'certGenerated', slotName: 'certGenerated' },
  // { title: '证书分类', dataIndex: 'lcnsCategory', slotName: 'lcnsCategory' },
  { title: '证书编号', dataIndex: 'lcnsNo', slotName: 'lcnsNo' },
  { title: '申请日期', dataIndex: 'applyDate', slotName: 'applyDate' },
  { title: '证书签发日期', dataIndex: 'certDate', slotName: 'certDate' },
  { title: '授权日期', dataIndex: 'authDate', slotName: 'authDate' },
  { title: '证书有效期', dataIndex: 'endDate', slotName: 'endDate' },
  // { title: '原授权单位', dataIndex: 'originalAuthCom', slotName: 'originalAuthCom' },
  { title: '授权单位', dataIndex: 'authCom', slotName: 'authCom' },
  // { title: '备注', dataIndex: 'remark', slotName: 'remark' },
  // { title: '状态', dataIndex: 'state', slotName: 'state' },

  // { title: '许可范围', dataIndex: 'permitScope', slotName: 'permitScope' },
  // { title: '明细备注', dataIndex: 'detailRemark', slotName: 'detailRemark' },
  // { title: '明细状态', dataIndex: 'detailState', slotName: 'detailState' },
  // { title: '创建人ID', dataIndex: 'createUserString', slotName: 'createUser' },
  // { title: '更新人ID', dataIndex: 'updateUserString', slotName: 'updateUser' },
  // { title: '创建时间', dataIndex: 'createTime', slotName: 'createTime' },
  // { title: '更新时间', dataIndex: 'updateTime', slotName: 'updateTime' },
  // { title: '是否删除（0-未删除，1-已删除）', dataIndex: 'isDeleted', slotName: 'isDeleted' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 80,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:certificate:download'])
  }
]);

const getProjectList = async (planType: number) => {
  await getExamProjectOptions(planType);
};

// 批量下载资格证按钮点击
const handleBatchDownload = async () => {
  getProjectList(2);
  formState.value.categoryId = undefined;
  formState.value.dateRange = [];
  visible.value = true;
}

// 点击确认批量
const handleOk = async () => {
  if (!formState.value.categoryId) {
    Message.warning("请选择考核项目种类");
    return false;
  }

  downloading.value = true;
  try {
    const [startDate, endDate] = formState.value.dateRange || [];

    const params = {
      categoryId: formState.value.categoryId,
      applyStartDate: startDate,
      applyEndDate: endDate,
    };
    const res = await downloadQualificationCertificateByCategory(params);
    const blob = new Blob([res], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const filename = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_资格证.zip`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (e) {
    downloading.value = false;
    return false;
  } finally {
    downloading.value = false;
  }
};

// 下载资格证
const downloadQualificationCertificate = async (record: any) => {
  try {
    downloading.value = true;
    const res = await downloadQualificationCertificateApi([record.recordId]);
    const blob = new Blob([res], { type: "application/octet-stream" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const filename = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_资格证.zip`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
  } finally {
    downloading.value = false;
  }
};

// 重置
const reset = () => {
  queryForm.psnName = undefined
  queryForm.idcardNo = undefined
  queryForm.certGenerated = undefined
  queryForm.approvalType = undefined
  queryForm.psnlcnsItemCode = undefined
  queryForm.applyDate = undefined
  search()
}

// 删除
const onDelete = (record: LicenseCertificateResp) => {
  return handleDelete(() => deleteLicenseCertificate(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportLicenseCertificate(queryForm))
}

const LicenseCertificateAddModalRef = ref<InstanceType<typeof LicenseCertificateAddModal>>()
// 新增
const onAdd = () => {
  LicenseCertificateAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: LicenseCertificateResp) => {
  LicenseCertificateAddModalRef.value?.onUpdate(record.id)
}

const LicenseCertificateDetailDrawerRef = ref<InstanceType<typeof LicenseCertificateDetailDrawer>>()
// 详情
const onDetail = (record: LicenseCertificateResp) => {
  LicenseCertificateDetailDrawerRef.value?.onOpen(record.id)
}


const getCertGeneratedColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue";
    case 1:
      return "green";
    default:
      return "default";
  }
};

const getCertGeneratedText = (status: number) => {
  switch (status) {
    case 0:
      return "待许可";
    case 1:
      return "已许可";
    default:
      return "未知";
  };
}

const getApprovalTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue";
    case 1:
      return "orange";
    default:
      return "default";
  }
};

const getApprovalTypeText = (status: number) => {
  switch (status) {
    case 0:
      return "初审";
    case 1:
      return "复审";
    default:
      return "未知";
  };
}

</script>

<style scoped lang="scss"></style>
