import { ref } from 'vue'
import type { LabelValueState } from '@/types/global'
import { getClassRoomSelect, getLocationSelect, getNotBindingDocument, getNotBindingLocation } from '@/apis/exam/project'

/** 项目模块 */
export function useProject(options?: { onSuccess?: () => void }) {
  const loading = ref(false)
  const locationSelectList = ref<LabelValueState[]>([])
  const classRoomSelectList = ref<LabelValueState[]>([])
  const notBindingLocationList = ref<LabelValueState[]>([])
  const notBindingDocumentList = ref<LabelValueState[]>([])

  /**
   * 获取项目地址下拉框包含label(locationName)、value(id)
   */
  const getProjectLocationSelect = async (projectId: string) => {
    try {
      loading.value = true
      // 获取项目地点
      const res = await getLocationSelect(projectId)
      locationSelectList.value = res.data
      options?.onSuccess && options.onSuccess()
    } finally {
      loading.value = false
    }
  }

  /**
   * 获取项目考场下拉框包含label(locationName)、value(id)
   */
  const getProjectClassRoomSelect = async (projectId: string) => {
    try {
      loading.value = true
      const res = await getClassRoomSelect(projectId)
      classRoomSelectList.value = res.data
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
    classRoomSelectList,
    notBindingLocationList,
    notBindingDocumentList,
    getProjectLocationSelect,
    getNotBindingLocationFun,
    getNotBindingDocumentFun,
    getProjectClassRoomSelect,
    loading,
  }
}
