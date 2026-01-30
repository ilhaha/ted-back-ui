<template>
  <div class="gi_table_page">
    <GiTable title="作业人员管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #toolbar-left>
        <a-input-search @search="search" v-model="queryForm.candidateName" placeholder="搜索作业人员姓名" allow-clear
          class="search-input ml-2" />
        <a-input-search @search="search" v-model="queryForm.idNumber" placeholder="搜索作业人员身份证号" allow-clear
          class="search-input ml-2" />
        <a-input-search @search="search" v-model="queryForm.phone" placeholder="搜索作业人员联系电话" allow-clear
          class="search-input ml-2" />
        <a-input-search @search="search" v-model="queryForm.workUnit" placeholder="搜索作业人员工作单位" allow-clear
          class="search-input ml-2" />
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
      </template>
      <template #avatar="{ record }">
        <div class="image-list">
          <a-image v-if="record.avatar" width="80" height="80" :src="record.avatar" :preview="true" :preview-props="{
            actions: ['rotateRight', 'zoomIn', 'zoomOut', 'originalSize'],
          }" />
          <span v-else>-</span>
        </div>
      </template>
      <template #examTotalCount="{ record }">
        <a-space>
          <a-tag color="blue">{{ record.examTotalCount }}</a-tag>
          <a-divider direction="vertical" />
          <a-tag color="green">{{ record.passCount }}</a-tag>
          <a-divider direction="vertical" />
          <a-tag color="red">{{ record.failCount }}</a-tag>
          <!-- <a-divider direction="vertical" />
          <a-tag color="orange">{{ record.unrecordedCount }}</a-tag> -->
        </a-space>
      </template>
      <template #isBlacklist="{ record }">
        <a-switch :model-value="record.isBlacklist" :disabled="!has.hasPermOr(['worker:addOrDel:blacklist'])"
          @change="(checked) => onBlacklistSwitch(record, checked)">
          <template #checked>是</template>
          <template #unchecked>否</template>
        </a-switch>
      </template>

      <template #blacklistDurationType="{ record }">
        <a-tag :color="getBlacklistDurationTypeColor(record.blacklistDurationType)" bordered
          v-if="record.blacklistDurationType">
          {{ getBlacklistDurationTypeText(record.blacklistDurationType) }}
        </a-tag>
        <span v-else></span>
      </template>


      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['select:exam:history']" title="考试记录" @click="onDetail(record)">考试记录</a-link>
          <a-link v-permission="['training:candidateType:update']" title="修改" @click="onUpdate(record)">修改</a-link>
        </a-space>
      </template>
    </GiTable>

    <a-modal v-model:visible="blacklistModalVisible" title="加入黑名单" width="480px" @ok="submitBlacklist"
      @cancel="cancelBlacklist">
      <a-form :model="blacklistForm" layout="vertical">
        <a-form-item label="黑名单时长" required>
          <a-select v-model="blacklistForm.durationType" placeholder="请选择黑名单时长">
            <a-option :value="1">1天</a-option>
            <a-option :value="2">1个月</a-option>
            <a-option :value="3">3个月</a-option>
            <a-option :value="4">6个月</a-option>
            <a-option :value="5">1年</a-option>
            <a-option :value="6">无期限</a-option>
          </a-select>
        </a-form-item>
        <a-form-item label="加入原因" required>
          <a-textarea v-model="blacklistForm.reason" placeholder="请输入加入黑名单原因" :max-length="255" show-word-limit />
        </a-form-item>
      </a-form>
    </a-modal>

    <a-modal v-model:visible="showRecordVisible" :title="title" :mask-closable="false" :esc-to-close="false" width="95%"
      draggable :footer="null" modal-class="no-padding-modal" @close="handleClose">
      <CandidateExamRecords ref="CandidateExamRecordsRef" />
    </a-modal>

    <CandidateTypeAddModal ref="CandidateTypeAddModalRef" @save-success="search" />
    <CandidateTypeDetailDrawer ref="CandidateTypeDetailDrawerRef" />

  </div>
</template>

<script setup lang="ts">
import { Message, Modal } from '@arco-design/web-vue'
import CandidateTypeAddModal from './CandidateTypeAddModal.vue'
import CandidateTypeDetailDrawer from './CandidateTypeDetailDrawer.vue'
import CandidateExamRecords from './CandidateExamRecords.vue'
import { type CandidateTypeResp, type CandidateTypeQuery, deleteCandidateType, exportCandidateType, listCandidateType, blacklistSwitch } from '@/apis/training/candidateType'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'CandidateType' })

const queryForm = reactive<CandidateTypeQuery>({
  candidateName: undefined,
  idNumber: undefined,
  workUnit: undefined,
  phone: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listCandidateType({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '姓名', dataIndex: 'nickname', slotName: 'nickname' },
  { title: '身份证号', dataIndex: 'username', slotName: 'username' },
  { title: '联系电话', dataIndex: 'phone', slotName: 'phone' },
  { title: '学历', dataIndex: 'education', slotName: 'education' },
  { title: '工作单位', dataIndex: 'workUnit', slotName: 'workUnit' },
  { title: '工作区域', dataIndex: 'address', slotName: 'address' },
  { title: '照片', dataIndex: 'avatar', slotName: 'avatar' },
  { title: '考试次数 / 及格 / 不及格', dataIndex: 'examTotalCount', slotName: 'examTotalCount', width: 190, align: 'center', },
  { title: '黑名单', dataIndex: 'isBlacklist', slotName: 'isBlacklist', align: 'center', },
  { title: '加入黑名单原因', dataIndex: 'blacklistReason', slotName: 'blacklistReason' },
  { title: '黑名单时长', dataIndex: 'blacklistDurationType', slotName: 'blacklistDurationType' },
  { title: '加入黑名单时间', dataIndex: 'blacklistTime', slotName: 'blacklistTime' },
  { title: '黑名单结束时间', dataIndex: 'blacklistEndTime', slotName: 'blacklistEndTime' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 160,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:candidateType:update', 'training:candidateType:detail', 'select:exam:history'])
  }
]);



const CandidateExamRecordsRef = ref<InstanceType<typeof CandidateExamRecords>>();

const showRecordVisible = ref(false)
const title = ref('')

// 考试记录
const onDetail = (record: any) => {
  title.value = record.nickname + "考试记录"
  showRecordVisible.value = true
  CandidateExamRecordsRef.value?.onOpen(record.candidateId);
}

// 关闭考试记录
const handleClose = () => {
  CandidateExamRecordsRef.value?.afterClose();
}


// 黑名单弹窗状态
const blacklistModalVisible = ref(false)
// 当前操作的人员
const currentRecord = ref<any>(null)
const currentChecked = ref(false)
const blacklistForm = reactive({
  durationType: undefined as number | undefined,
  reason: ''
})

/**
 * 切换黑名单
 */
const onBlacklistSwitch = (record: any, checked: boolean) => {
  currentChecked.value = checked
  if (checked) {
    // 加入黑名单 → 打开弹窗
    currentRecord.value = record
    blacklistForm.durationType = undefined
    blacklistForm.reason = ''
    blacklistModalVisible.value = true
  } else {
    // 移出黑名单
    Modal.confirm({
      title: '确认移出黑名单？',
      content: '移出后该人员将恢复正常状态',
      onOk: async () => {
        await blacklistSwitch({
          id: record.id,
          isBlacklist: checked
        })
        search()
        Message.success('已移出黑名单')
      }
    })
  }
}

/**
 * 提交黑名单
 */
const submitBlacklist = async () => {
  if (!blacklistForm.durationType) {
    Message.warning('请选择黑名单时长')
    return
  }
  if (!blacklistForm.reason) {
    Message.warning('请输入加入原因')
    return
  }

  await blacklistSwitch({
    id: currentRecord.value.id,
    blacklistDurationType: blacklistForm.durationType,
    blacklistReason: blacklistForm.reason,
    isBlacklist: currentChecked.value
  })

  currentRecord.value.isBlacklist = true
  currentChecked.value = false
  blacklistModalVisible.value = false
  search()
  Message.success('已加入黑名单')
}

/**
 * 取消
 */
const cancelBlacklist = () => {
  blacklistModalVisible.value = false
}

// 切换黑名单启用状态
const handlIsBlacklistChange = (record: any) => {

  console.log(record);

}
// 重置
const reset = () => {
  queryForm.idNumber = undefined
  queryForm.candidateName = undefined
  queryForm.phone = undefined
  queryForm.workUnit = undefined
  search()
}

// 删除
const onDelete = (record: CandidateTypeResp) => {
  return handleDelete(() => deleteCandidateType(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportCandidateType(queryForm))
}

const CandidateTypeAddModalRef = ref<InstanceType<typeof CandidateTypeAddModal>>()
// 新增
const onAdd = () => {
  CandidateTypeAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: CandidateTypeResp) => {
  CandidateTypeAddModalRef.value?.onUpdate(record.id)
}


const getBlacklistDurationTypeColor = (type: number) => {
  switch (type) {
    case 1:
      return 'blue';      // 1天
    case 2:
      return 'cyan';      // 1个月
    case 3:
      return 'purple';   // 3个月
    case 4:
      return 'orange';   // 6个月
    case 5:
      return 'red';      // 1年
    case 6:
      return 'black';    // 无期限（最严重）
    default:
      return 'default';  // 无
  }
};


const getBlacklistDurationTypeText = (type: number) => {
  switch (type) {
    case 1:
      return '1天';
    case 2:
      return '1个月';
    case 3:
      return '3个月';
    case 4:
      return '6个月';
    case 5:
      return '1年';
    case 6:
      return '无期限';
    default:
      return '无';
  }
};

</script>

<style scoped lang="scss">
.image-list {
  display: flex;
  /* 使用 flex 布局 */
  gap: 8px;
  /* 图片之间的间距 */
  flex-wrap: wrap;
  /* 如果图片过多，自动换行 */
  align-items: center;
  /* 垂直居中图片 */
}
</style>
