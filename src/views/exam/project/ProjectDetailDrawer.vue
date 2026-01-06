<template>
  <a-drawer v-model:visible="visible" title="项目详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="1" size="large" class="general-description">
      <a-descriptions-item label="项目ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="项目名称">{{ dataDetail?.projectName }}</a-descriptions-item>
      <a-descriptions-item label="项目代号">{{ dataDetail?.projectCode }}</a-descriptions-item>
      <!-- <a-descriptions-item label="部门名称">{{ dataDetail?.categoryId }} 分钟</a-descriptions-item> -->
      <!--      <a-descriptions-item label="描述">{{ dataDetail?.redeme }}</a-descriptions-item>-->
      <!--      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>-->
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <!--      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>-->
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <!--      <a-descriptions-item label="删除标记">{{ dataDetail?.isDeleted }}</a-descriptions-item>-->
    </a-descriptions>

    <a-space style="margin-bottom: 16px;">
      <!-- <a-button type="primary" @click="onAddress">绑定地址</a-button> -->
      <a-button type="primary" @click="onDocument" v-permission="['exam:project:bindDocument']"
        v-if="dataDetail?.projectStatus == 2">绑定资料</a-button>
    </a-space>

    <!--  地址相关  -->
    <!-- <a-table v-if="locationDetail.length > 0" :columns="columns" :data="locationDetail" :pagination="false">
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:project:delete']" status="danger" :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'" @click="onDeleteLocation(record)">
            解绑
          </a-link>
        </a-space>
      </template>
</a-table> -->

    <a-descriptions-item>&nbsp;</a-descriptions-item>

    <!--  资料相关  -->
    <a-table v-if="documentDetail.length > 0" :columns="documentColumns" :data="documentDetail" :pagination="false">
      <template #action="{ record }">
        <a-space>
          <a-link v-permission="['exam:project:unbind']" status="danger" :disabled="record.disabled"
            :title="record.disabled ? '不可删除' : '删除'" @click="onDeleteDocument(record)">
            解绑
          </a-link>
        </a-space>
      </template>
    </a-table>
  </a-drawer>

  <a-modal v-model:visible="visibleDel" @ok="ok" @cancel="cancel">
    <template #title />
    <div style="width: 100%; text-align: center; font-size: 16px; color: red;">
      确定要解除绑定吗？
    </div>
  </a-modal>

  <ProjectBindAddress ref="ProjectBindAddressRef" @save-success="onAddressCompleted" />
  <ProjectBindDocument ref="ProjectBindDocumentRef" @save-success="onDocumentCompleted" />

</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import ProjectBindAddress from './ProjectBindAddress.vue'
import ProjectBindDocument from './ProjectBindDocument.vue'

import {
  type ProjectDetailResp,
  getProject as getDetail,
  type ProjectLocationList,
  type ProjectDocumentList,
  bindingLocation,
  unBindingLocation,
  bindingDocumentListApi,
  unBindingDocument
}
  from '@/apis/exam/project'

import type { TableInstanceColumns } from "@/components/GiTable/type";
import { isMobile } from "@/utils";
import has from "@/utils/has";
import type ProjectAddModal from "@/views/exam/project/ProjectAddModal.vue";

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ProjectDetailResp>()
const locationDetail = ref<ProjectLocationList[]>([])
const documentDetail = ref<ProjectDocumentList[]>([])
const visible = ref(false)
const visibleDel = ref(false)
const delLocationId = ref('')
const delDocumentId = ref('')
const delFlag = ref(false) // T删资料  F删地址

const columns = ref<TableInstanceColumns[]>([
  { title: '地址名称', dataIndex: 'locationName', slotName: 'locationName' },
  { title: '运营状态', dataIndex: 'operationalStatusStr', slotName: 'operationalStatusStr' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 100,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:project:delete'])
  }
])

const documentColumns = ref<TableInstanceColumns[]>([
  { title: '资料名称', dataIndex: 'typeName', slotName: 'typeName' },
  {
    title: '操作',
    dataIndex: 'action',
    slotName: 'action',
    width: 100,
    align: 'center',
    fixed: !isMobile() ? 'right' : undefined,
    show: has.hasPermOr(['exam:project:delete'])
  }
])

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 刷新
const onDocumentCompleted = async () => {
  const [documentRes] = await Promise.all([
    bindingDocumentListApi(dataId.value)
  ])
  documentDetail.value = documentRes.data ?? []
}

const onAddressCompleted = async () => {
  const [locationRes] = await Promise.all([
    bindingLocation(dataId.value),
  ])
  locationDetail.value = locationRes.data ?? []
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  const [detailRes, locationRes, documentRes] = await Promise.all([
    getDetail(dataId.value),
    bindingLocation(dataId.value),
    bindingDocumentListApi(dataId.value)
  ])
  dataDetail.value = detailRes.data
  locationDetail.value = locationRes.data ?? []
  documentDetail.value = documentRes.data ?? []
  visible.value = true
}

// 是否删除绑定地址？
const onDeleteLocation = (record: ProjectLocationList) => {
  delLocationId.value = record.id
  delFlag.value = false
  visibleDel.value = true
}

// 是否删除绑定资料？
const onDeleteDocument = (record: ProjectLocationList) => {
  delDocumentId.value = record.id
  delFlag.value = true
  visibleDel.value = true
}

// 确定删除
const ok = async () => {
  // F发送删除地址请求
  if (!delFlag.value) {
    await unBindingLocation(dataId.value, [delLocationId.value])
    const [locationRes] = await Promise.all([
      bindingLocation(dataId.value)
    ])
    locationDetail.value = locationRes.data ?? []
  } else {
    await unBindingDocument(dataId.value, [delDocumentId.value])
    const [documentRes] = await Promise.all([
      bindingDocumentListApi(dataId.value)
    ])
    documentDetail.value = documentRes.data ?? []
  }
  visibleDel.value = false;
};

// 取消删除
const cancel = () => {
  delLocationId.value = ''
  delDocumentId.value = ''
  visibleDel.value = false;
};

const ProjectBindAddressRef = ref<InstanceType<typeof ProjectAddModal>>()
const ProjectBindDocumentRef = ref<InstanceType<typeof ProjectAddModal>>()

// 绑定地址
const onAddress = () => {
  ProjectBindAddressRef.value?.onBinding(dataId.value)
}

// 绑定资料
const onDocument = () => {
  ProjectBindDocumentRef.value?.onBinding(dataId.value)
}

defineExpose({ onOpen })
</script>
<style scoped lang="scss"></style>
