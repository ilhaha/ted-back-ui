<template>
  <a-drawer v-model:visible="visible" title="特种设备人员资格申请详情" :width="width >= 600 ? 600 : '100%'" :footer="false">
    <a-descriptions :column="1" size="large" class="general-description" bordered>
      <!-- <a-descriptions-item label="主键">{{ dataDetail?.id }}</a-descriptions-item> -->
    
      <a-descriptions-item label="考生名称" :span="1">
        {{ dataDetail?.candidatesName }}
      </a-descriptions-item>
  
      <a-descriptions-item label="申请表" :span="1">
        <a-image
          v-if="dataDetail?.imageUrl"
          width="200"
          height="150"
          :src="dataDetail?.imageUrl"
          :preview-props="{ zoomRate: 1.5 }"
          fit="cover"
          @error="handleImageError"
        />
        <span v-else>-</span>
      </a-descriptions-item>

      <a-descriptions-item label="状态" :span="1">
        <a-tag :color="getStatusColor(dataDetail?.status)">
          {{ getStatusText(dataDetail?.status) }}
        </a-tag>
      </a-descriptions-item>

      <a-descriptions-item label="创建人" :span="1">
        {{ dataDetail?.createUserString }}
      </a-descriptions-item>

      <a-descriptions-item label="创建时间" :span="1">
        {{ dataDetail?.createTime }}
      </a-descriptions-item>

      <a-descriptions-item label="更新时间" :span="1">
        {{ dataDetail?.updateTime }}
      </a-descriptions-item>
    </a-descriptions>
  </a-drawer>

  
</template>

<script setup lang="ts">
import { useWindowSize } from '@vueuse/core'
import { type SpecialCertificationApplicantDetailResp, getSpecialCertificationApplicant as getDetail } from '@/apis/exam/specialCertificationApplicant'
import { ref } from 'vue'

const props = defineProps<{
}>()

const { width } = useWindowSize()

const dataId = ref('')
const dataDetail = ref<SpecialCertificationApplicantDetailResp>()
const visible = ref(false)

const handleImageError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.src = '/images/ce853a5576cd3913a87d709a354cdef.png'
  img.onerror = null
}

const getStatusColor = (status?: number) => {
  switch (status) {
    case 0:
      return 'orange'
    case 1:
      return 'green'
    case 2:
      return 'red'
    default:
      return 'default'
  }
}

const getStatusText = (status?: number) => {
  switch (status) {
    case 0:
      return '未审核'
    case 1:
      return '审核通过'
    case 2:
      return '审核不通过'
    default:
      return '未知状态'
  }
}

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

<style scoped lang="scss">
.general-description {
  :deep(.arco-descriptions-item-label) {
    width: 100px;
    font-weight: 500;
  }
  
  :deep(.arco-descriptions-item-value) {
    padding: 12px 16px;
  }
}

.preview-image {
  border-radius: 4px;
}
</style>
