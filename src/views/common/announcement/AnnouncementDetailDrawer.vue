<template>
  <a-drawer v-model:visible="visible" title="公告管理详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="2" size="large" class="general-description">
      <a-descriptions-item label="公告ID">{{ dataDetail?.id }}</a-descriptions-item>
      <a-descriptions-item label="公告标题">{{ dataDetail?.title }}</a-descriptions-item>
      <a-descriptions-item label="公告状态">{{ dataDetail?.status }}</a-descriptions-item>
<!--      <a-descriptions-item label="创建人ID">{{ dataDetail?.createUser }}</a-descriptions-item>-->
      <a-descriptions-item label="创建人">{{ dataDetail?.createUserString }}</a-descriptions-item>
<!--      <a-descriptions-item label="更新人ID">{{ dataDetail?.updateUser }}</a-descriptions-item>-->
      <a-descriptions-item label="修改人">{{ dataDetail?.updateUserString }}</a-descriptions-item>
      <a-descriptions-item label="创建时间戳">{{ dataDetail?.createTime }}</a-descriptions-item>
      <a-descriptions-item label="更新时间戳">{{ dataDetail?.updateTime }}</a-descriptions-item>
      <a-descriptions-item label="删除标记">{{ dataDetail?.isDeleted }}</a-descriptions-item>
      <a-descriptions-item label="公告内容">
        <div v-html="dataDetail?.content"></div>
      </a-descriptions-item>
    </a-descriptions>
  </a-drawer>
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type AnnouncementDetailResp, getAnnouncement as getDetail } from '@/apis/common/announcement'
import { decompressBase64 } from '@/utils/textCompressor'
import { ref } from 'vue';



const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<AnnouncementDetailResp>()
const visible = ref(false)



// 查询详情（修改后）
const getDataDetail = async () => {
  const { data } = await getDetail(dataId.value);

  // 添加解压缩逻辑
  if (data?.content) {
    data.content = decompressBase64(data.content);
  }

  dataDetail.value = data;
};

// 打开
const onOpen = async (id: string) => {
  dataId.value = id
  await getDataDetail()
  visible.value = true
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
