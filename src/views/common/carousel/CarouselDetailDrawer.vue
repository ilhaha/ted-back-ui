<template>
  <a-drawer v-model:visible="visible" title="轮播图管理详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="轮播图ID">{{ dataDetail?.id }}</a-descriptions-item>
<!--      <a-descriptions-item label="跳转链接">{{ dataDetail?.linkUrl }}</a-descriptions-item>-->
      <a-descriptions-item label="图片描述">{{ dataDetail?.description }}</a-descriptions-item>
      <a-descriptions-item label="排序，数值越大越靠前">{{ dataDetail?.sortOrder }}</a-descriptions-item>
      <a-descriptions-item label=" 轮播图状态">{{ dataDetail?.status }}</a-descriptions-item>
<!--      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>-->
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
<!--      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>-->
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="绑定公告">{{ dataDetail?.announcementTitle }}</a-descriptions-item>
    </a-descriptions>
    <a-descriptions-item label="图片地址">
      <img
        :src="dataDetail?.imageUrl"
        alt="图片"
        style="display: block; width: 100%; height: auto; border-radius: 8px; margin-top: 8px;"
      />
    </a-descriptions-item>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type CarouselDetailResp, getCarousel as getDetail } from '@/apis/common/carousel'

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<CarouselDetailResp>()
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
