import { ref } from 'vue'
import type { LabelValueState } from '@/types/global'
import { deptProjects } from '@/apis/exam/examPlan'

/** 考试计划模块 */
export function usePlan(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const deptProjectsList = ref<LabelValueState[]>([])

  const getDeptProjectsList = async (planType: number) => {
    try {
      loading.value = true
      const res = await deptProjects(planType)
      deptProjectsList.value = res.data
      options?.onSuccess && options.onSuccess()
    } finally {
      loading.value = false
    }
  }

  return { deptProjectsList, getDeptProjectsList, loading }
}
