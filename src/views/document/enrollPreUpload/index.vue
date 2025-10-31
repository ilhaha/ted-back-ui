<template>
  <div class="gi_table_page">
    <GiTable title="机构报考审核管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search" :row-selection="rowSelection"
      @select="select" @select-all="selectAll">
      <template #toolbar-left>
        <a-select v-model="queryForm.status" placeholder="请选择审核状态" allow-clear style="width: 200px" @change="search">
          <a-option :value="0">未审核</a-option>
          <a-option :value="1">审核通过</a-option>
          <a-option :value="2">退回补正</a-option>
          <a-option :value="3">虚假资料</a-option>
        </a-select>
        <a-input-search v-model="queryForm.candidatesName" placeholder="请输入考生姓名" allow-clear @search="search" />
        <a-input-search v-model="queryForm.planName" placeholder="请输入考试计划名称" allow-clear @search="search" />
        <a-select v-model="queryForm.orgId" placeholder="请选择所属机构" allow-clear style="width: 200px"
          :options="orgListoptions" @change="search" />
        <a-button type="primary" @click="search">
          <template #icon><icon-search /></template>
          搜索
        </a-button>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>

          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button type="primary" v-permission="['document:enrollPreUpload:update']" @click="batchReview"
          :disabled="!selectedKeys.length">
          批量审核
        </a-button>
      </template>
      <template #qualificationFileUrl="{ record }">
        <a-link v-permission="['document:enrollPreUpload:detail']" title="详情"
          @click="getPreviewUrl(record.qualificationFileUrl)">预览</a-link>
      </template>
      <template #docList="{ record }">
        <a-link v-permission="['document:enrollPreUpload:detail']" title="详情" @click="getDocList(record.id)">查看</a-link>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['document:enrollPreUpload:update']" title="审核" @click="openReview(record)" v-if="record.status == 0">审核</a-link>
        </a-space>
      </template>
    </GiTable>

    <a-modal v-model:visible="reviewVisible" title="机构报考审核" :mask-closable="false" :esc-to-close="false"
      :width="width >= 600 ? 600 : '100%'" draggable @before-ok="conformReview" @close="resetForm">
      <a-form ref="formRef" :model="form" layout="vertical">
        <a-form-item field="status" label="审核结果" :rules="[{ required: true, message: '请选择审核结果' }]">
          <a-radio-group v-model="form.status">
            <a-radio :value="1">审核通过</a-radio>
            <a-radio :value="2">退回补正</a-radio>
            <a-radio :value="3">虚假资料</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="form.status === 2 || form.status === 3" field="remark"
          :label="form.status === 2 ? '退回原因' : '虚假资料原因'"
          :rules="[{ required: true, message: form.status === 2 ? '请填写退回原因' : '请填写虚假资料原因' }]">
          <a-input v-model="form.remark" :placeholder="form.status === 2 ? '请输入退回原因' : '请输入虚假资料原因'" allow-clear />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="showDocListVisible" title="考生提交的资料" :mask-closable="false" :esc-to-close="false"
      :width="700" draggable :footer="null">
      <DocumentPre ref="DocumentPreRef" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">

import { type EnrollPreUploadResp, type EnrollPreUploadQuery, review, deleteEnrollPreUpload, exportEnrollPreUpload, listEnrollPreUpload } from '@/apis/document/enrollPreUpload'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import DocumentPre from '@/views/document/documentPre/index.vue'
import { useDownload, useTable } from '@/hooks'
import { getOrgSelect } from "@/apis/training/org";
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { Message } from '@arco-design/web-vue'
import { useResetReactive } from '@/hooks'
import { useWindowSize } from '@vueuse/core'


defineOptions({ name: 'EnrollPreUpload' })

const { width } = useWindowSize()

const queryForm = reactive<EnrollPreUploadQuery>({
  candidatesName: undefined,
  planName: undefined,
  status: undefined,
  sort: ['id,desc']
})

const [form, resetForm] = useResetReactive({
  status: 1,
  remark: undefined,
  reviewIds: undefined
})





const {
  tableData: dataList,
  loading,
  pagination,
  search,
  selectedKeys,
  select,
  selectAll,
} = useTable((page) => listEnrollPreUpload({ ...queryForm, ...page }), { immediate: true })


const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: true,
  onlyCurrent: false,
  selectedRowKeys: selectedKeys,
  onChange: (keys: string[]) => {
    selectedKeys.value = keys
  }
})
const columns = ref<TableInstanceColumns[]>([
  { title: '考生姓名', dataIndex: 'nickname', slotName: 'nickname' },
  { title: '考试计划', dataIndex: 'examPlanName', slotName: 'examPlanName' },
  { title: '所属机构', dataIndex: 'orgName', slotName: 'orgName' },
  { title: '报名资格申请表', dataIndex: 'qualificationFileUrl', slotName: 'qualificationFileUrl' },
  { title: '考生所提交资料', dataIndex: 'docList', slotName: 'docList' },
  { title: '状态', dataIndex: 'status', slotName: 'status' },
  { title: '退回原因', dataIndex: 'remark', slotName: 'remark' },
  { title: '申请时间', dataIndex: 'createTime', slotName: 'createTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['document:enrollPreUpload:detail', 'document:enrollPreUpload:update', 'document:enrollPreUpload:delete'])
  }
]);
const reviewVisible = ref(false);

const showDocListVisible = ref(false);

const reviewIds = ref<any[]>([]);

const formRef = ref()

const batchReview = () => {
  if (selectedKeys.value.length === 0) {
    Message.warning("请选择需要审核的记录");
    return;
  }
  // 先清空
  reviewIds.value = [];
  for (const row of dataList.value) {
    if (selectedKeys.value.includes(row.id)) {
      if (row.status !== 0) {
        Message.warning("选中的记录中包含非未审核状态的数据，请重新选择");
        return;
      }
      reviewIds.value.push(row.id);
    }
  }
  // 打开批量审核弹窗
  reviewVisible.value = true;
};

// 确认审核
const conformReview = async () => {
  const isInvalid = await formRef.value?.validate()
  if (isInvalid) return false
  // 构造请求参数
  form.reviewIds = reviewIds.value
  const res = await review(form)
  if (res.data) {
    Message.success('审核成功');
    reviewVisible.value = false;
    reviewIds.value = [];
    selectedKeys.value = []
    resetForm();
    search();
  }

};

// 打开审核弹窗
const openReview = (record: EnrollPreUploadResp) => {
  reviewIds.value.push(record.id);
  reviewVisible.value = true;
}

// 重置
const reset = () => {
  queryForm.candidatesId = undefined
  queryForm.planId = undefined
  queryForm.qualificationFileUrl = undefined
  search()
}
const DocumentPreRef = ref<InstanceType<typeof DocumentPre>>()

const getDocList = (id: string) => {
  DocumentPreRef.value?.onOpen(id)
  showDocListVisible.value = true;
};
const getPreviewUrl = (url: string) => {
  if (!url) {
    Message.warning('暂无文件可预览');
    return;
  }

  // 提取文件扩展名
  const ext = url.split('.').pop()?.toLowerCase();

  if (ext === 'pdf') {
    //  PDF 直接在浏览器中预览
    window.open(url, '_blank');
  } else if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) {
    //  Office 文件使用微软在线预览
    const previewUrl = `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(url)}`;
    window.open(previewUrl, '_blank');
  } else {
    Message.warning('暂不支持此文件类型预览');
  }
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '未审核'
    case 1:
      return '审核通过'
    case 2:
      return '审核不通过'
    case 3:
      return '虚假材料'
    default:
      return ''
  }
}

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'blue'      // 未持有显示红色
    case 1:
      return 'green'    // 持有未到期显示绿色
    case 2:
      return 'orange'   // 持有已到期显示橙色
    case 3:
      return 'red'     // 即将到期显示蓝色
    default:
      return 'gray'
  }
}

const orgListoptions = ref<Array<{ label: string; value: string }>>([])

onMounted(async () => {
  const res = await getOrgSelect()
  orgListoptions.value = res.data;
})


</script>

<style scoped lang="scss"></style>
