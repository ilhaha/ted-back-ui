<template>
  <div class="gi_table_page">
    <GiTable title="人员及许可证书信息管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" :row-selection="rowSelection" @refresh="search" @select="select"
      @select-all="selectAll">
      <template #toolbar-left>
        <a-input-search v-model="queryForm.psnName" placeholder="请输入姓名" allow-clear @search="search" />
        <a-input-search v-model="queryForm.idcardNo" placeholder="请输入身份证号" allow-clear @search="search" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['exam:certificate:download']" :disabled="!selectedKeys.length" :loading="downloading"
          type="primary" @click="handleBatchDownload">
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
} from '@/apis/exam/examRecords'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { Message } from '@arco-design/web-vue'


defineOptions({ name: 'LicenseCertificate' })


const queryForm = reactive<LicenseCertificateQuery>({
  psnName: undefined,
  idcardNo: undefined,
  sort: ['id,desc']
})
const downloading = ref(false);


const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete,
  selectedKeys,
  select,
  selectAll
} = useTable((page) => listLicenseCertificate({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  // { title: '数据来源', dataIndex: 'datasource', slotName: 'datasource' },
  // { title: '信息录入单位', dataIndex: 'infoinputorg', slotName: 'infoinputorg' },
  { title: '姓名', dataIndex: 'psnName', slotName: 'psnName' },
  { title: '身份证号', dataIndex: 'idcardNo', slotName: 'idcardNo' },
  { title: '原单位名称', dataIndex: 'originalComName', slotName: 'originalComName' },
  { title: '单位名称', dataIndex: 'comName', slotName: 'comName' },
  // { title: '申请类型', dataIndex: 'applyType', slotName: 'applyType' },
  { title: '申请日期', dataIndex: 'applyDate', slotName: 'applyDate' },
  // { title: '是否审核', dataIndex: 'isVerify', slotName: 'isVerify' },
  // { title: '是否操作', dataIndex: 'isOpr', slotName: 'isOpr' },
  { title: '证书类别', dataIndex: 'lcnsKind', slotName: 'lcnsKind' },
  // { title: '证书分类', dataIndex: 'lcnsCategory', slotName: 'lcnsCategory' },
  { title: '证书编号', dataIndex: 'lcnsNo', slotName: 'lcnsNo' },
  { title: '证书签发日期', dataIndex: 'certDate', slotName: 'certDate' },
  { title: '授权日期', dataIndex: 'authDate', slotName: 'authDate' },
  { title: '证书有效期', dataIndex: 'endDate', slotName: 'endDate' },
  { title: '原授权单位', dataIndex: 'originalAuthCom', slotName: 'originalAuthCom' },
  { title: '授权单位', dataIndex: 'authCom', slotName: 'authCom' },
  // { title: '备注', dataIndex: 'remark', slotName: 'remark' },
  // { title: '状态', dataIndex: 'state', slotName: 'state' },
  { title: '证书项目名称', dataIndex: 'psnlcnsItem', slotName: 'psnlcnsItem' },
  { title: '证书项目代码', dataIndex: 'psnlcnsItemCode', slotName: 'psnlcnsItemCode' },
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
    show: has.hasPermOr(['exam:licenseCertificate:detail', 'exam:licenseCertificate:update', 'exam:licenseCertificate:delete'])
  }
]);

const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedKeys,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  }
})

// 批量下载资格证按钮点击
const handleBatchDownload = async () => {
  if (selectedKeys.value.length === 0) {
    Message.warning('请先选择要下载资格证的记录')
    return
  }
  try {
    // 1. 筛选出被选中的记录
    const selectedRecords = dataList.value.filter(item =>
      selectedKeys.value.includes(item.id)
    );

    // 2. 获取对应的 recordId 列表
    const selectedRecordIds = selectedRecords.map(item => item.recordId);
    downloading.value = true;
    const res = await downloadQualificationCertificateApi(selectedRecordIds, 0);
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
    selectedKeys.value = [];
  } catch (error) {
  } finally {
    downloading.value = false;
  }
}

// 下载资格证
const downloadQualificationCertificate = async (record: any) => {
  try {
    downloading.value = true;
    const res = await downloadQualificationCertificateApi([record.recordId], 0);
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
</script>

<style scoped lang="scss"></style>
