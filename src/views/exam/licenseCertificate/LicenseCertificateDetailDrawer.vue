<template>
  <a-drawer v-model:visible="visible" title="人员及许可证书信息详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="数据来源">{{ dataDetail?.datasource }}</a-descriptions-item>
      <a-descriptions-item label="信息录入单位">{{ dataDetail?.infoinputorg }}</a-descriptions-item>
      <a-descriptions-item label="姓名">{{ dataDetail?.psnName }}</a-descriptions-item>
      <a-descriptions-item label="身份证号">{{ dataDetail?.idcardNo }}</a-descriptions-item>
      <a-descriptions-item label="原单位名称">{{ dataDetail?.originalComName }}</a-descriptions-item>
      <a-descriptions-item label="单位名称">{{ dataDetail?.comName }}</a-descriptions-item>
      <a-descriptions-item label="申请类型">{{ dataDetail?.applyType }}</a-descriptions-item>
      <a-descriptions-item label="申请日期">{{ dataDetail?.applyDate }}</a-descriptions-item>
      <a-descriptions-item label="是否审核">{{ dataDetail?.isVerify }}</a-descriptions-item>
      <a-descriptions-item label="是否操作">{{ dataDetail?.isOpr }}</a-descriptions-item>
      <a-descriptions-item label="证书类别">{{ dataDetail?.lcnsKind }}</a-descriptions-item>
      <a-descriptions-item label="证书分类">{{ dataDetail?.lcnsCategory }}</a-descriptions-item>
      <a-descriptions-item label="证书编号">{{ dataDetail?.lcnsNo }}</a-descriptions-item>
      <a-descriptions-item label="证书签发日期">{{ dataDetail?.certDate }}</a-descriptions-item>
      <a-descriptions-item label="授权日期">{{ dataDetail?.authDate }}</a-descriptions-item>
      <a-descriptions-item label="证书有效期">{{ dataDetail?.endDate }}</a-descriptions-item>
      <a-descriptions-item label="原授权单位">{{ dataDetail?.originalAuthCom }}</a-descriptions-item>
      <a-descriptions-item label="授权单位">{{ dataDetail?.authCom }}</a-descriptions-item>
      <a-descriptions-item label="备注">{{ dataDetail?.remark }}</a-descriptions-item>
      <a-descriptions-item label="状态">{{ dataDetail?.state }}</a-descriptions-item>
      <a-descriptions-item label="证书项目名称">{{ dataDetail?.psnlcnsItem }}</a-descriptions-item>
      <a-descriptions-item label="证书项目代码">{{ dataDetail?.psnlcnsItemCode }}</a-descriptions-item>
      <a-descriptions-item label="许可范围">{{ dataDetail?.permitScope }}</a-descriptions-item>
      <a-descriptions-item label="明细备注">{{ dataDetail?.detailRemark }}</a-descriptions-item>
      <a-descriptions-item label="明细状态">{{ dataDetail?.detailState }}</a-descriptions-item>
      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="是否删除（0-未删除，1-已删除）">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type LicenseCertificateDetailResp, getLicenseCertificate as getDetail } from '@/apis/exam/licenseCertificate'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<LicenseCertificateDetailResp>()
const visible = ref(false)

// 查询详情
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value)
  dataDetail.value = data
}

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
