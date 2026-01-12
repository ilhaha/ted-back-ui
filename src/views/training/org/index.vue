<template>
  <div class="gi_table_page">
    <GiTable title="机构信息管理" row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #previewImage="{ record }">
        <a-image v-if="record.businessLicense" width="80" height="60" :src="record.businessLicense"
          :preview-props="{ zoomRate: 1.5 }" class="preview-image" fit="cover" />
        <span v-else>-</span>
      </template>
      <template #toolbar-left>
        <a-input-search v-model="queryForm.code" placeholder="请输入机构代号" allow-clear @search="search" />
        <a-input-search v-model="queryForm.name" placeholder="请输入机构名称" allow-clear @search="search" />
        <a-input-search v-model="queryForm.socialCode" placeholder="请输入统一社会信用代码" allow-clear @search="search" />

        <!-- <a-button type="primary" class="ml-2" @click="search">
          <template #icon><icon-search /></template>
搜索
</a-button> -->
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>
      <template #toolbar-right>
        <a-button v-permission="['training:org:add']" type="primary" @click="onAdd">
          <template #icon><icon-plus /></template>
          <template #default>新增</template>
        </a-button>
        <!-- <a-button v-permission="['training:org:export']" @click="onExport">
          <template #icon><icon-download /></template>
          <template #default>导出</template>
        </a-button> -->
      </template>
      <template #creditScore="{ record }">
        <a-tag :color="getCreditColor(record.creditScore)">
          {{ record.creditScore }}
        </a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <!-- <a-link v-permission="['training:org:update']" title="查看账号" @click="showAccount(record)"
            v-if="record.accountName">查看账号</a-link> -->
          <!-- <a-link v-permission="['training:org:update']" title="绑定账号" @click="onBinding(record)" v-else>绑定账号</a-link> -->
          <!-- <a-link v-permission="['training:org:detail']" title="详情" @click="onDetail(record)">详情</a-link> -->
          <a-link v-permission="['training:org:update']" title="修改" @click="onUpdate(record)">修改</a-link>
          <a-link v-permission="['training:org:resetPwd']" title="重置密码" @click="onResetPwd(record)">重置密码</a-link>
          <a-link v-permission="['training:org:delete']" status="danger" :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'" @click="onDelete(record)">
            删除
          </a-link>
        </a-space>
      </template>
    </GiTable>

    <OrgAddModal ref="OrgAddModalRef" @save-success="search" />
    <OrgDetailDrawer ref="OrgDetailDrawerRef" />
    <OrgBindAccount ref="bindAccountRef" @save-success="search" />
    <OrgAccountModal ref="accountModalRef" @unbind-success="search" />
    <UserResetPwdModal ref="UserResetPwdModalRef" />

  </div>
</template>

<script setup lang="ts">
import OrgAddModal from './OrgAddModal.vue'
import OrgDetailDrawer from './OrgDetailDrawer.vue'
import OrgAccountModal from './OrgAccountModal.vue'
import UserResetPwdModal from '@/views/system/user/UserResetPwdModal.vue'
import { type OrgResp, type OrgQuery, deleteOrg, exportOrg, listOrg } from '@/apis/training/org'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import OrgBindAccount from './OrgBindAccount.vue'

defineOptions({ name: 'Org' })


const queryForm = reactive<OrgQuery>({
  code: undefined,
  name: undefined,
  socialCode: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listOrg({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '机构代号', dataIndex: 'code', slotName: 'code', },
  { title: '机构名称', dataIndex: 'name', slotName: 'name', },
  { title: '机构八大类归属', dataIndex: 'categoryNames', slotName: 'categoryNames' },
  { title: '统一社会信用代码', dataIndex: 'socialCode', slotName: 'socialCode' },
  { title: '地址', dataIndex: 'location', slotName: 'location' },
  { title: '法定代表人', dataIndex: 'legalPerson', slotName: 'legalPerson', },
  { title: '机构规模大小', dataIndex: 'scale', slotName: 'scale', },
  { title: '营业执照', dataIndex: 'businessLicense', slotName: 'previewImage' },
  { title: '信誉分', dataIndex: 'creditScore', slotName: 'creditScore' },
  { title: '机构账号', dataIndex: 'username', slotName: 'username' },
  { title: '联系电话', dataIndex: 'phone', slotName: 'phone' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 200,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['training:org:resetPwd', 'training:org:update', 'training:org:delete', "training:org:detail"])
  }
]);
const UserResetPwdModalRef = ref<InstanceType<typeof UserResetPwdModal>>()
// 重置密码
const onResetPwd = (record: any) => {
  console.log(111);

  UserResetPwdModalRef.value?.onOpen(record.userId)
}

const bindAccountRef = ref<InstanceType<typeof OrgBindAccount>>()

// 打开绑定账号弹窗
const onBinding = (record: OrgResp) => {
  bindAccountRef.value?.onOpen(record.id)
}

const accountModalRef = ref<InstanceType<typeof OrgAccountModal>>()

const showAccount = (record: OrgResp) => {
  accountModalRef.value?.onOpen(record)
}

// 重置
const reset = () => {
  queryForm.code = undefined
  search()
}

// 删除
const onDelete = (record: OrgResp) => {
  return handleDelete(() => deleteOrg(record.id), {
    content: `是否确定删除该条数据？`,
    showModal: true
  })
}

// 导出
const onExport = () => {
  useDownload(() => exportOrg(queryForm))
}

const OrgAddModalRef = ref<InstanceType<typeof OrgAddModal>>()
// 新增
const onAdd = () => {
  OrgAddModalRef.value?.onAdd()
}

// 修改
const onUpdate = (record: OrgResp) => {
  OrgAddModalRef.value?.onUpdate(record.id)
}

const OrgDetailDrawerRef = ref<InstanceType<typeof OrgDetailDrawer>>()
// 详情
const onDetail = (record: OrgResp) => {
  OrgDetailDrawerRef.value?.onOpen(record.id)
}

const getCreditColor = (score?: number) => {
  if (score === undefined || score === null) {
    return 'default';
  }
  if (score >= 90) {
    return 'green';
  }
  if (score >= 80) {
    return 'gold'; // 黄色
  }
  if (score < 80) {
    return 'red';
  }
  return 'orange'; // 70-79 可选
};


</script>

<style scoped lang="scss"></style>
