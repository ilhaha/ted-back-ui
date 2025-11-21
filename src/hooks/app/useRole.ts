import { ref } from 'vue'
import { listRoleDict } from '@/apis'
import type { LabelValueState } from '@/types/global'

/** 角色模块 */
export function useRole(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const roleList = ref<LabelValueState[]>([])

  const getRoleList = async () => {
    try {
      loading.value = true
      const res = await listRoleDict()

      const excludeIds = [547888897925840930, 547888897925840949]

      roleList.value = res.data.filter((item: any) => !excludeIds.includes(item.value))

      options?.onSuccess && options.onSuccess()
    } finally {
      loading.value = false
    }
  }

  return { roleList, getRoleList, loading }
}
