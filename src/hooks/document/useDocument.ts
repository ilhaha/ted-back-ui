import { ref } from 'vue'
import {getDocument, getStatus,} from '@/apis/document/document'
import type { LabelValueState } from '@/types/global'
import {getDocumentType} from "@/apis/document/document"

/** 审核状态模块 */
export function useDocument(options?: { onSuccess?: () => void }) {
    const loading = ref(false)
    const statusList = ref<LabelValueState[]>([])
    const typeNameList = ref<LabelValueState[]>([])

    const getStatusList = async () => {
        try {
            loading.value = true
            const res = await getStatus()
            statusList.value = res.data
            options?.onSuccess && options.onSuccess()
        } finally {
            loading.value = false
        }
    }


    const getTypeNameList = async () => {
        try {
            loading.value = true
            const res = await getDocumentType()
            typeNameList.value = res.data
            options?.onSuccess && options.onSuccess()
        } finally {
            loading.value = false
        }
    }

    return { statusList, getStatusList,typeNameList,getTypeNameList, loading }
}
