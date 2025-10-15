import { ref } from 'vue'
import type { LabelValueState } from '@/types/global'
import { selectExamLocation } from '@/apis/exam/classroom'

/** 考场相关钩子 */
export function useClassroom(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const locationSelectList = ref<LabelValueState[]>([]) // 考试地点下拉列表数据

  /** 获取考试地点下拉数据 */
  const getLocationSelect = async () => {
    try {
      loading.value = true
      const res = await selectExamLocation() // 调用接口获取数据
      locationSelectList.value = res.data.map(item => ({
        label: item.locationName,
        value: item.id,
        rawData: item // 保留原始数据以备其他用途
      }))
      options?.onSuccess?.()
    } finally {
      loading.value = false
    }
  }

  return {
    locationSelectList,
    getLocationSelect,
    loading,
  }
}
