<template>
  <a-drawer v-model:visible="visible" title="检验人员身份证信息详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="主键ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="姓名">{{ dataDetail?.realName }}</a-descriptions-item>
      <a-descriptions-item label="性别（男 女）">{{ dataDetail?.gender }}</a-descriptions-item>
      <a-descriptions-item label="民族">{{ dataDetail?.nation }}</a-descriptions-item>
      <a-descriptions-item label="出生日期">{{ dataDetail?.birthDate }}</a-descriptions-item>
      <a-descriptions-item label="住址">{{ dataDetail?.address }}</a-descriptions-item>
      <a-descriptions-item label="身份证地址">{{ dataDetail?.idCardAddress }}</a-descriptions-item>
      <a-descriptions-item label="身份证号码">{{ dataDetail?.idCardNumber }}</a-descriptions-item>
      <a-descriptions-item label="签发机关">{{ dataDetail?.issuingAuthority }}</a-descriptions-item>
      <a-descriptions-item label="有效期开始日期">{{ dataDetail?.validStartDate }}</a-descriptions-item>
      <a-descriptions-item label="有效期截止日期">{{ dataDetail?.validEndDate }}</a-descriptions-item>
      <a-descriptions-item label="身份证正面照片路径">{{ dataDetail?.idCardPhotoFront }}</a-descriptions-item>
      <a-descriptions-item label="身份证反面照片路径">{{ dataDetail?.idCardPhotoBack }}</a-descriptions-item>
      <a-descriptions-item label="人脸证件照">{{ dataDetail?.facePhoto }}</a-descriptions-item>
      <a-descriptions-item label="专业类型">{{ dataDetail?.majorType }}</a-descriptions-item>
      <a-descriptions-item label="相关学历">{{ dataDetail?.education }}</a-descriptions-item>
      <a-descriptions-item label="毕业院校">{{ dataDetail?.graduatedSchool }}</a-descriptions-item>
      <a-descriptions-item label="相关专业">{{ dataDetail?.relatedMajor }}</a-descriptions-item>
      <a-descriptions-item label="单位名称">{{ dataDetail?.companyName }}</a-descriptions-item>
      <a-descriptions-item label="任职资格">{{ dataDetail?.qualification }}</a-descriptions-item>
      <a-descriptions-item label="相关工作年限">{{ dataDetail?.workYears }}</a-descriptions-item>
      <a-descriptions-item label="所属地区">{{ dataDetail?.region }}</a-descriptions-item>
      <a-descriptions-item label="邮政编码">{{ dataDetail?.postalCode }}</a-descriptions-item>
      <a-descriptions-item label="学信网学历验证报告">{{ dataDetail?.educationCertificate }}</a-descriptions-item>
      <a-descriptions-item label="学历认证状态（0待审、1已认证、2认证未通过、3待认证）">{{ dataDetail?.educationVerifyStatus }}</a-descriptions-item>
      <a-descriptions-item label="提交学历认证时间">{{ dataDetail?.educationVerifyTime }}</a-descriptions-item>
      <a-descriptions-item label="学历认证审核备注">{{ dataDetail?.educationVerifyRemark }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUser }}</a-descriptions-item>
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
      <a-descriptions-item label="更新人">{{ dataDetail?.updateUser }}</a-descriptions-item>
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="逻辑删除标志：0否 1是">{{ dataDetail?.isDeleted }}</a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type ExamIdcardDetailResp, getExamIdcard as getDetail } from '@/apis/exam/examIdcard'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<ExamIdcardDetailResp>()
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
