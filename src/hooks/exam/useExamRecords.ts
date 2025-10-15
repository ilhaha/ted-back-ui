import { ref } from 'vue'
import type { LabelValueState } from '@/types/global'

import { selectOptions } from '@/apis/exam/examPlan'
/** 考试记录模块 */
export function useExamRecords(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const plan_id_enum = ref<LabelValueState[]>([])
  const registration_progress_enum = ref<LabelValueState[]>([
    { label: '待考试', value: 0 },
    { label: '考试中', value: 1 },
    { label: '等待成绩', value: 2 },
    { label: '已完成', value: 3 },
    { label: '未上传指定资料', value: 4 },
  ])

  const getPlanList = async () => {
    try {
      loading.value = true
      const res = await selectOptions()
      plan_id_enum.value = res.data
      options?.onSuccess && options.onSuccess()
    } finally {
      loading.value = false
    }
  }

  return {
    plan_id_enum,
    registration_progress_enum,
    getPlanList,
    loading,
  }
}
