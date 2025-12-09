import { ref } from 'vue'
import type { LabelValueState } from '@/types/global'
import { getLocalClassroomChoose, getLocationSelect, getNotBindingDocument, getNotBindingLocation } from '@/apis/exam/project'

/** 项目模块 */
export function useProject(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const locationSelectList = ref<LabelValueState[]>([])
  const operationClassRoomSelectList = ref<LabelValueState[]>([])
  const theoryClassRoomSelectList = ref<LabelValueState[]>([])
  const notBindingLocationList = ref<LabelValueState[]>([])
  const notBindingDocumentList = ref<LabelValueState[]>([])

  /**
   * 获取项目地址下拉框包含label(locationName)、value(id)
   */
  const getProjectLocationSelect = async (planType: string) => {
    try {
      loading.value = true
      // 获取项目地点
      const res = await getLocationSelect(planType)
      locationSelectList.value = res.data
      options?.onSuccess && options.onSuccess()
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取项目考场下拉框包含label(locationName)、value(id)
   */
  const getProjectClassRoomSelect = async (projectId: string, isOperation: number) => {
    try {
      loading.value = true
      const res = await getLocalClassroomChoose(projectId, isOperation)
      if (isOperation == 1) {
        operationClassRoomSelectList.value = res.data
      } else {
        theoryClassRoomSelectList.value = res.data
      }

      options?.onSuccess && options.onSuccess()
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取项目未绑定地址下拉框包含label(locationName)、value(id)
   */
  const getNotBindingLocationFun = async (projectId: string) => {
    try {
      loading.value = true
      const res = await getNotBindingLocation(projectId)
      notBindingLocationList.value = res.data
      options?.onSuccess && options.onSuccess()
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取项目未绑定地址下拉框包含label(locationName)、value(id)
   */
  const getNotBindingDocumentFun = async (projectId: string) => {
    try {
      loading.value = true
      const res = await getNotBindingDocument(projectId)
      notBindingDocumentList.value = res.data
      options?.onSuccess && options.onSuccess()
    } finally {
      loading.value = false
    }
  }

  return {
    locationSelectList,
    operationClassRoomSelectList,
    theoryClassRoomSelectList,
    notBindingLocationList,
    notBindingDocumentList,
    getProjectLocationSelect,
    getNotBindingLocationFun,
    getNotBindingDocumentFun,
    getProjectClassRoomSelect,
    loading,
  }
}
