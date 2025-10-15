<template>
  <a-modal
    :visible="invigilateWindow"
    draggable
    :closable="false"
    :width="700"
  >
    <template #title>
      选择监考人员
    </template>
    <div>
      <div class="option-content">
        <div class="examTime">
          <div>{{ examInfo.examName }}</div>
          <div>{{ examInfo.startTime }} ----- {{ examInfo.endTime }}</div>
        </div>
        <div class="nickname">
          <input v-model="nickname" type="text" placeholder="搜索监考人员名称" />
          <a-button type="primary" @click="searchByNickName">搜索</a-button>
          <a-button @click="resetName">重置</a-button>
          <a-select v-model="selectClassroomId" :style="{ width: '150px' }" placeholder="请选择考场" allow-clear>
            <a-option v-for="(item, index) in classroomList" :key="index" :value="item.classroomId">
              {{ item.classroomName }}
            </a-option>
          </a-select>
        </div>
        <a-space direction="vertical" size="large" fill>
          <a-table
            v-model:selected-keys="invigilates"
            row-key="id"
            :loading="tableLoading"
            :columns="columns"
            :data="tableData"
            :row-selection="rowSelection"
            :pagination="{
              total,
              current: currentPage,
              pageSize,
              showTotal: true,
              onChange: handlePageChange,
            }"
            style="width: 600px; min-height: 288px"
            @select="checkbox"
          >
            <template #columns>
              <a-table-column title="ID" data-index="id" align="center" :min-width="200" />
              <a-table-column title="姓名" data-index="nickname" align="center" :min-width="150" />
              <a-table-column title="操作" align="center">
                <template #cell="{ record }">
                  <a-button @click="viewTime(record)">查看监考时间</a-button>
                </template>
              </a-table-column>
            </template>
          </a-table>
        </a-space>
        <a-modal v-model:visible="confirm" draggable @ok="fixOn" @cancel="cancelConfirm">
          <template #title>
            确认框
          </template>
          <div class="confirmBox">
            请确认是否添加&nbsp;
            <b>{{ invigilate }}</b>&nbsp;
            <b>{{ invigilate2 }}</b>
            &nbsp;为监考人员
          </div>
          <template #footer>
            <div style="display: flex; justify-content: space-between;">
              <div>
                <a-row :gutter="[40, 20]">
                  <a-col :span="40">
                    <a-alert type="warning">确定选择后不可取消</a-alert>
                  </a-col>
                </a-row>
              </div>
              <div style="padding-top: 5px;">
                <a-button style="margin-right: 5px" @click="cancelConfirm">取消</a-button>
                <a-button type="primary" @click="fixOn">确定</a-button>
              </div>
            </div>
          </template>
        </a-modal>
        <div class="option-drawer">
          <a-drawer
            unmount-on-close
            :width="800"
            :height="340"
            :visible="timeVisible"
            :placement="position"
            @cancel="timeVisible = false"
          >
            <template #title>
              <div class="content-title">
                <h3>
                  <span>监考人员以及安排的时间</span>
                </h3>
              </div>
            </template>
            <div class="drawer-describe">
              <div class="drawer-name">
                <h3>监考人：{{ invigilateTimes.nickname }}</h3>
              </div>
              <div class="drawer-plan">
                <h3>考试时间与名称：</h3>
              </div>
            </div>
            <div v-show="!invigilateTimes.invigilateTime" class="drawer-time">暂时没有安排监考时间</div>
            <div
              v-for="(item, index) in invigilateTimes.invigilateTime"
              :key="index"
              class="drawer-time"
            >
              <span>
                {{ item.startTime }} ~ {{ item.endTime }} ： {{ item.classroomName }} - {{ item.planName }}
              </span>
            </div>
            <template #footer>
              <div class="plan-state">
                <a-alert
                  banner
                  center
                  :type="answerState"
                >
                  {{ answer }}
                </a-alert>
              </div>
            </template>
          </a-drawer>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="btn">
        <div>
          <a-space wrap>
            <a-popover title="当前计划监考人员" trigger="click" style="width: 170px; text-align: center">
              <a-button>查看已选监考人员</a-button>
              <template #content>
                <p class="popover-tag">
                  <a-tag
                    v-for="item in invigilateInfo"
                    :key="item.id"
                    color="arcoblue"
                    closable
                    @close="deleteInvigilate(item.id)"
                  >
                    {{ item.nickname }}
                  </a-tag>
                  <a-tag v-show="invigilateInfo.length === 0">暂无监考人员</a-tag>
                </p>
              </template>
            </a-popover>
          </a-space>
        </div>
        <div>
          <a-button @click="handleCancel">取消</a-button>
          <a-button type="primary" @click="handleClick">确定</a-button>
        </div>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Message } from '@arco-design/web-vue'
import {
  addInvigilates,
  getExistInvigilates,
  getInvigilates,
  invigilateTag,
  verifyInvigilate,
  viewInvigilate,
} from '@/apis'
import { getClassroomList } from '@/apis/exam/classroom'

// 显示窗口
const invigilateWindow = ref(false)
// 选中的监考人
const invigilates = ref([])
// 已存在的监考人信息
const invigilateInfo = ref([
  {
    id: '',
    nickname: '',
  },
])
const invigilate = ref('')
const invigilate2 = ref('')
// 确定窗口
const confirm = ref(false)
// 考试信息
const examInfo = ref({
  id: '',
  examName: '',
  startTime: '',
  endTime: '',
})

// 监考相关列表
const invigilateList = ref({
  examPlanId: examInfo.value.id,
  nickname: '',
  classroomId: '',
  invigilateIds: '',
  startTime: examInfo.value.startTime,
  endTime: examInfo.value.endTime,
})

const nickname = ref('')
// 选择的考场id
const selectClassroomId = ref('')
// 考场列表
const classroomList = ref([{
  classroomId: '',
  classroomName: '',
}])

// 查看监考时间抽屉
const timeVisible = ref(false)
const position = ref('left')

// 提示状态
const answerState = ref('')
// 提示是否冲突
const answer = ref('')

// 监考人考试时间
const invigilateTimes = ref({
  id: '',
  nickname: '',
  invigilateTime: [
    {
      planId: '',
      planName: '',
      classroomId: '',
      classroomName: '',
      startTime: '',
      endTime: '',
    },
  ],
})

const tableLoading = ref(false)

// 表格选择框
const rowSelection = reactive({
  type: 'checkbox',
  showCheckedAll: false,
  onlyCurrent: false,
})

// 表格分页配置
const currentPage = ref(1)
const pageSize = ref(4)
const total = ref(0)

// 表格列
const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
  },
  {
    title: '姓名',
    dataIndex: 'nickname',
  },
]
// 表格数据
const tableData = ref([])

// 分页查询返回数据
const handleGetInvigilates = async (invigilateList, page) => {
  currentPage.value = page
  const params = `page=${currentPage.value}&size=${pageSize.value}`
  const res = await getInvigilates(invigilateList, params)
  tableData.value = res.data.list
  total.value = res.data.total
  return res
}

// 添加分页变化处理方法
const handlePageChange = async (page: number) => {
  currentPage.value = page
  const res = await handleGetInvigilates(invigilateList, page)
  tableData.value = res.data.list
}

// 选择监考人
const checkbox = async () => {
  // 延迟获取数据，否则会获取到空数组
  await new Promise((resolve) => setTimeout(resolve, 10))
  if (invigilates.value.length > 2) {
    invigilates.value = invigilates.value.slice(0, 2)
    // 任务：禁止选择超过2个监考人员
    Message.error('一次最多只能选择2个监考人员')
  }
  Object.assign(invigilateList, {
    invigilateIds: invigilates.value,
  })
  // 左下角标签显示
  const invigilateInfoRef = await invigilateTag(invigilateList)
  invigilateInfo.value = invigilateInfoRef.data
}

// 取消监考人员
const deleteInvigilate = async (invigilateId) => {
  invigilates.value = invigilates.value.filter((item) => item !== invigilateId)
  invigilateInfo.value = invigilateInfo.value.filter((item) => item.id !== invigilateId)
}

// 小窗口确定监考人员
const fixOn = async () => {
  try {
    confirm.value = false
    // 添加监考人员
    const addInvigilatesRef = await addInvigilates(examInfo.value.id, invigilates.value, selectClassroomId.value)
    if (addInvigilatesRef.data > 0) {
      invigilateWindow.value = false
      Message.success('选择成功，已通知监考人员')
    }
  } finally {
    selectClassroomId.value = ''
    invigilateWindow.value = false
    currentPage.value = 1
  }
}

const cancelConfirm = () => {
  confirm.value = false
  invigilateWindow.value = true
}

// 验证选择的监考人员考场重复性
const handleVerifyInvigilate = async (record) => {
  const res = await verifyInvigilate(record)
  let verify = false
  res.data.forEach((item) => {
    if (!item.invigilateTime.classroomId) {
      Message.error(`${item.nickname} 已确认当前计划考场，请勿重复选择`)
      verify = true
    }
  })
  return verify
}

// 确定选择
const handleClick = async () => {
  await checkbox()
  if (invigilates.value.length === 0) {
    Message.error('至少选择一个监考人员')
    return
  }
  if (selectClassroomId.value === '') {
    Message.error('请选择考场')
    return
  }
  Object.assign(invigilateList, {
    classroomId: selectClassroomId.value,
    invigilateIds: invigilates.value,
  })
  const verify = await handleVerifyInvigilate(invigilateList)
  if (verify) return
  const res = await viewInvigilate(invigilateList)
  let bool = false
  res.data.forEach((item) => {
    if (!item.invigilatorState) {
      Message.error(`${item.nickname} 的监考时间或考场冲突，请合理安排监考时间`)
      bool = true
    }
  })
  if (bool) return
  invigilateInfo.value = res.data
  invigilate.value = invigilateInfo.value[0].nickname
  invigilate2.value = invigilateInfo.value.length > 1 ? invigilateInfo.value[1].nickname : ''
  confirm.value = true
  invigilateWindow.value = false
}

// 取消选择
const handleCancel = () => {
  currentPage.value = 1
  selectClassroomId.value = ''
  invigilateWindow.value = false
}

// 搜索监考人员
const searchByNickName = async () => {
  Object.assign(invigilateList, {
    nickname: nickname.value,
  })
  const res = await handleGetInvigilates(invigilateList, 1)
  if (res.data.length === 0) {
    Message.error('没有找到该监考人员')
  }
  tableData.value = res.data.list
  total.value = res.data.total
}

// 重置搜索
const resetName = async () => {
  nickname.value = ''
  Object.assign(invigilateList, {
    nickname: '',
  })
  const res = await handleGetInvigilates(invigilateList, 1)
  tableData.value = res.data.list
  total.value = res.data.total
}

// 查看监考时间
const viewTime = async (record) => {
  timeVisible.value = true
  Object.assign(invigilateList, {
    classroomId: selectClassroomId.value,
    invigilateIds: record.id,
  })
  const ref = await viewInvigilate(invigilateList)
  invigilateTimes.value = ref.data[0]
  if (ref.data[0].invigilatorState) {
    answerState.value = 'success'
    answer.value = '监考人监考考试时间与当前考试时间未冲突'
  } else {
    answerState.value = 'error'
    answer.value = '监考人监考考试时间与当前考试时间冲突'
  }
}

// 初始化参数
const parameterInit = (record) => {
  // 清空选择
  invigilateInfo.value = []
  // 考试开始到结束时间
  examInfo.value = record
  Object.assign(invigilateList, {
    examPlanId: examInfo.value.id,
    startTime: examInfo.value.startTime,
    endTime: examInfo.value.endTime,
  })
}

// 监考人员信息和状态
const invigilatesInfo = async (record) => {
  tableLoading.value = true// 加载动画
  // 获取当前考试计划部门下的监考人员信息
  const invigilatesRes = await handleGetInvigilates(invigilateList, 1)
  total.value = invigilatesRes.data.total
  for (let i = 0; i < invigilatesRes.data.list.length; i++) {
    tableData.value[i] = invigilatesRes.data.list[i]
  }
  tableLoading.value = false
  // 获取已在监考的监考人员
  const existInvigilatesRes = await getExistInvigilates(record.id)
  invigilates.value = existInvigilatesRes.data
  // 获取监考人员信息
  if (existInvigilatesRes.data.length) {
    Object.assign(invigilateList, {
      invigilateIds: existInvigilatesRes.data,
    })
    // 左下角显示
    const invigilateInfoRes = await viewInvigilate(invigilateList)
    invigilateInfo.value = invigilateInfoRes.data
  }
}

// 获取考场列表
const handleGetClassroomList = async (record) => {
  const res = await getClassroomList(record.id)
  classroomList.value = res.data
}

// 选择监考按钮
const onOption = async (record) => {
  if (record.statusString !== '已生效') {
    Message.error(record.statusString)
    return
  }
  // 参数初始化
  parameterInit(record)
  invigilateWindow.value = true// 显示窗口
  // 获取监考人员信息
  await invigilatesInfo(record)
  // 获取考场列表
  await handleGetClassroomList(record)
}

defineExpose({ onOption })
</script>

<style scoped lang="scss">
.option-content {
  margin: 0 20px 0 20px;
}

.drawer-name {
  margin-bottom: 20px;
}

.drawer-time {
  height: 25px;
  text-align: center;
  font-size: 16px;
  margin-top: 20px;
  padding-bottom: 10px;
  border-bottom: 1px dashed #a3a3a3;
  display: flex;
  justify-content: space-between
}

.examTime {
  font-size: 18px;
  margin-bottom: 20px;
}

.examTime > div {
  text-align: center;
  margin-bottom: 15px;
}

.nickname {
  margin-bottom: 20px;
  text-align: center;
}

.nickname > input {
  width: 200px;
  height: 30px;
  outline: none;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-right: 5px;
  padding-left: 5px;
}

.nickname > button {
  margin-right: 5px;
}

.btn {
  display: flex;
  justify-content: space-between
}

.btn button {
  margin-left: 5px;
}

.plan-state {
  margin-top: 30px;
}

.confirmBox {
  text-align: center;
}

.popover-tag {
  width: 80px;
  margin: auto;
  text-align: center
}
</style>
