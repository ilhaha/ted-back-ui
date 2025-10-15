import { ref } from 'vue'
import {list, provinces, citys} from '@/apis/address/address'
import type { LabelValueState } from '@/types/global'

/** 省份地址模块 */
export function useAddress(options?: { onSuccess?: () => void }) {
    const loading = ref(false)
    const addressList = ref<LabelValueState[]>([])
    const cityList = ref<LabelValueState[]>([])
    const areaList = ref<LabelValueState[]>([])

    const getProvincesList = async () => {
        try {
            loading.value = true
            const res = await provinces()
            addressList.value = res.data
            options?.onSuccess && options.onSuccess()
        } finally {
            loading.value = false
        }
    }

    const getCityList = async (id : string) => {
        if (id === '' || id === undefined) return
        const res = await citys(id)
        cityList.value = res.data
        options?.onSuccess && options.onSuccess()
    }

    const getAreaList = async (id : string) => {
        if (id === '' || id === undefined) return
        const res = await citys(id)
        areaList.value = res.data
        options?.onSuccess && options.onSuccess()
    }

    return { addressList, cityList, areaList, getProvincesList, getCityList, getAreaList, loading }
}
