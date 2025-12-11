<template>
  <a-modal :visible="invigilateWindow" draggable width="60%" :closable="false" title="监考员列表">
    <GiTable row-key="id" :data="tableData" :columns="columns" :loading="loading"
      @refresh="getInvigilateDate(currentPlanId)" :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="false"
      :disabled-tools="['size']" :disabled-column-keys="['name']">
      <template #toolbar-right>
        <a-popconfirm content="重新随机分配监考员？此操作会清空当前未确认监考分配的监考员，是否继续？" ok-text="确定" cancel-text="取消" @ok="onReRandom">
          <a-button v-permission="['exam:examPlan:option']" type="primary" :disabled="noSecondRandom ||
            tableData.length === 0 ||
            tableData.every(i => i.invigilateStatus === 0)
            ">
            <template #icon><icon-sync /></template>
            重新随机分配
          </a-button>
        </a-popconfirm>
      </template>
      <template #examType="{ record }">
        <a-tag :color="getStatusColor(record.examType)" bordered>{{
          getStatusText(record.examType)
        }}</a-tag>
      </template>
      <template #examPassword="{ record }">
       <span v-if="record.examType == 0">{{ record.examPassword }}</span>
       <span v-else>-</span>
      </template>
      <template #invigilateStatus="{ record }">
        <a-tag :color="getInvigilateStatusColor(record.invigilateStatus)" bordered>
          {{ getInvigilateStatusText(record.invigilateStatus) }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:examPlan:updateInvigilator']" status="danger" @click="updateInvigilator(record)"
            v-if="record.invigilateStatus == 5">
            更改
          </a-link>
        </a-space>
      </template>
    </GiTable>
    <template #footer>
      <a-button type="text" @click="invigilateWindow = false">关闭</a-button>
    </template>
  </a-modal>
  <a-modal v-model:visible="changeInvigilatorWindow" title="更换新监考员" :mask-closable="false" :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'" draggable @before-ok="confirmChangeInvigilator"
    @close="changeInvigilatorWindow = false">
    <GiForm ref="formRef" v-model="form" :columns="currentColumns" />
    <template #footer>
      <!-- <a-button type="primary" @click="onAuditConfirm">确认更改</a-button> -->
    </template>
  </a-modal>


</template>

<script setup lang="ts">
import { ref } from 'vue'
import { getInvigilateList, replace } from '@/apis/invigilate/planInvigilate'
import { reRandomInvigilators, getAvailableInvigilator } from '@/apis/exam/examPlan'
import { isMobile } from "@/utils";
import { Message } from '@arco-design/web-vue'
import { useResetReactive } from "@/hooks";
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useWindowSize } from '@vueuse/core'

const { width } = useWindowSize()
const currentPlanId = ref()
const invigilateWindow = ref(false)
const noSecondRandom = ref(false)
const tableData = ref([])
const loading = ref(false)
// 是否显示“更改监考员”弹窗
const changeInvigilatorWindow = ref(false)
// 可选择的监考员列表
const availableInvigilators = ref<any[]>([])

const [form, resetForm] = useResetReactive({
  id: undefined,
  invigilateId: undefined,
  classroomName: undefined,
});

// 表格列
const columns = [
  {
    title: '监考员姓名',
    dataIndex: 'nickname',
  },
  {
    title: '考场名称',
    dataIndex: 'classroomName',
  },
  {
    title: '考试类型',
    dataIndex: 'examType',
    slotName: "examType",
  },
  {
    title: '开考密码',
    dataIndex: 'examPassword',
    slotName: "examPassword",
  },
  {
    title: '状态',
    dataIndex: 'invigilateStatus',
    slotName: "invigilateStatus",
  },
  {
    title: "操作",
    dataIndex: "action",
    slotName: "action",
    width: 200,
    align: "center",
    fixed: !isMobile() ? "right" : undefined,
  },
]

const currentColumns: ColumnItem[] = reactive([
  {
    label: '考场名称',
    prop: 'classroomName',
    field: 'classroomName',
    type: 'input',
    span: 24,
    props: {
      disabled: true
    }
  },
  {
    label: '监考员',
    prop: 'invigilateId',
    field: 'invigilateId',
    type: 'select',
    span: 24,
    required: true,
    props: {
      options: availableInvigilators,
    },
  },
])
// 重新分配监考员
const onReRandom = async () => {
  const res = await reRandomInvigilators(currentPlanId.value, tableData.value.length)
  if (res.data) {
    getInvigilateDate(currentPlanId.value)
    noSecondRandom.value = true
    Message.success("监考员已重新随机分配")
  }
}

// 更改监考员
const updateInvigilator = async (record: any) => {
  // 查询可选监考员
  const res = await getAvailableInvigilator(currentPlanId.value, record.invigilatorId)
  availableInvigilators.value = res.data.map(inv => ({
    value: inv.id,
    label: inv.nickname
  }))
  form.id = record.id
  form.classroomName = record.classroomName
  // 打开弹窗
  changeInvigilatorWindow.value = true
}

// 确定更换
const confirmChangeInvigilator = async () => {
  const res = await replace(form);
  if (res.data) {
    Message.success("监考员已更改")
    changeInvigilatorWindow.value = false
    // 刷新监考列表
    getInvigilateDate(currentPlanId.value)
    reset()
  }
}

const reset = () => {
  form.id = undefined
  form.classroomName = undefined
  form.invigilateId = undefined
};

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "理论考试";
    case 1:
      return "实操考试";
    default:
      return "未知";
  }
};

const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "blue"; // 理论考试
    case 1:
      return "orange"; // 实操考试
    default:
      return "default";
  }
};

const getInvigilateStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return "green";      // 待监考
    case 1:
      return "blue";      // 待录入
    case 2:
      return "orange";    // 待审核
    case 3:
      return "green";     // 已完成
    case 4:
      return "purple";    // 待监考人员确认
    case 5:
      return "red";       // 监考员拒绝监考
    default:
      return "default";
  }
};


const getInvigilateStatusText = (status: number) => {
  switch (status) {
    case 0:
      return "待监考";
    case 1:
      return "待录入";
    case 2:
      return "待审核";
    case 3:
      return "已完成";
    case 4:
      return "待监考员确认";
    case 5:
      return "无法参加";
    default:
      return "未知状态";
  }
};

// 获取监考员列表数据
const getInvigilateDate = async (planId: number) => {
  loading.value = true
  try {
    const res = await getInvigilateList(planId)
    tableData.value = res.data || []
  } finally {
    loading.value = false
  }
}

// 打开监考查看窗口
const onOption = (planId: number, assignType: number) => {
  getInvigilateDate(planId);
  currentPlanId.value = planId
  noSecondRandom.value = (assignType && assignType == 2)
  invigilateWindow.value = true
}

defineExpose({ onOption })
</script>

<style scoped lang="scss"></style>
