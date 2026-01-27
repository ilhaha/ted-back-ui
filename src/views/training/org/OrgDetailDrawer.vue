<template>
  <a-drawer v-model:visible="visible" title="机构信息详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <div class="detail-container">
      <a-descriptions :column="2" size="large" class="general-description">
        <a-descriptions-item label="机构代号">{{ dataDetail?.code }}</a-descriptions-item>
        <a-descriptions-item label="机构名称">{{ dataDetail?.name }}</a-descriptions-item>
        <a-descriptions-item label="机构考核项目种类归属">{{ dataDetail?.categoryNames }}</a-descriptions-item>
        <a-descriptions-item label="社会统一代码">{{ dataDetail?.socialCode }}</a-descriptions-item>
        <a-descriptions-item label="地点">{{ dataDetail?.location }}</a-descriptions-item>
        <a-descriptions-item label="法人">{{ dataDetail?.legalPerson }}</a-descriptions-item>
        <a-descriptions-item label="公司规模大小">{{ dataDetail?.scale }}</a-descriptions-item>
        <a-descriptions-item label="营业执照路径">{{ dataDetail?.businessLicense }}</a-descriptions-item>
      </a-descriptions>
      <div class="account-table">
        <div class="table-header">
          <h3 class="table-title">旗下机构账号</h3>
          <a-button type="primary" size="small" @click="onBinding">绑定账号</a-button>
        </div>
        <a-table
            :data="accountList"
            :columns="accountColumns"
            :pagination="false"
            row-key="id"
            size="small"
        >
          <template #empty>
            <a-empty description="暂无账号数据" />
          </template>
        </a-table>
      </div>
      <div class="student-table">
        <h3 class="table-title">旗下学生列表</h3>
        <a-table
            :data="studentList"
            :columns="studentColumns"
            :pagination="false"
            row-key="id"
            size="small"
        >
          <template #empty>
            <a-empty description="暂无学生数据" />
          </template>
        </a-table>
      </div>
    </div>
    <OrgBindAccount ref="bindAccountRef" @save-success="onBindSuccess" />
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type OrgDetailResp, getOrg as getDetail, getOrgAccounts } from '@/apis/training/org'
import { Message } from '@arco-design/web-vue'
import OrgBindAccount from './OrgBindAccount.vue'

// 机构账号列定义
const accountColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 80,
    render: ({ rowIndex }) => rowIndex + 1,
  },
  {
    title: '用户名',
    dataIndex: 'username',
    width: 120,
  },
]

// 新增学生列定义
const studentColumns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 80,
    render: ({ rowIndex }) => rowIndex + 1,
  },
  {
    title: '考生姓名',
    dataIndex: 'candidateName',
    width: 120,
  },
]
const { width } = useWindowSize()
const accountList = ref<Array<{ id: number; username: string }>>([])
const studentList = ref<Array<{ id: number; candidateName: string }>>([])
const dataId = ref('')
const dataDetail = ref<OrgDetailResp>()
const visible = ref(false)
const bindAccountRef = ref<InstanceType<typeof OrgBindAccount>>()

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
  
  // 获取机构账号列表
  const { data: accountData } = await getOrgAccounts(dataId.value)
  accountList.value = accountData?.map((username, index) => ({
    id: index + 1,
    username: username
  })) || []
  // 将字符串数组转换为对象数组，添加唯一标识
  studentList.value = data?.candidateName?.map((name, index) => ({
    id: index + 1,  // 使用索引生成唯一标识
    candidateName: name
  })) || []
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()

  visible.value = true
}

// 绑定账号
const onBinding = () => {
  bindAccountRef.value?.onOpen(dataId.value)
}

// 绑定成功回调
const onBindSuccess = async () => {
  // 重新获取账号列表
  const { data: accountData } = await getOrgAccounts(dataId.value)
  accountList.value = accountData?.map((username, index) => ({
    id: index + 1,
    username: username
  })) || []
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss">
.detail-container {
  padding: 0 16px;

  .account-table {
    margin-top: 24px;

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .table-title {
      font-size: 15px;
      color: var(--color-text-1);
      font-weight: 500;
      margin: 0;
    }

    :deep(.arco-table-th) {
      background-color: var(--color-fill-2);
    }
  }

  .student-table {
    margin-top: 24px;

    .table-title {
      margin-bottom: 12px;
      font-size: 15px;
      color: var(--color-text-1);
      font-weight: 500;
    }

    :deep(.arco-table-th) {
      background-color: var(--color-fill-2);
    }
  }
}
</style>
