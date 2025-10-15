<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :esc-to-close="false"
    :width="width >= 600 ? 600 : '100%'"
    draggable
    @before-ok="save"
    @close="reset"
  >
    <GiForm ref="formRef" v-model="form" :columns="columns" />
  </a-modal>
</template>

<script setup lang="ts">
import {Message, type TreeNodeData} from '@arco-design/web-vue'
import { useWindowSize } from '@vueuse/core'
import { getExamLocation, addExamLocation, updateExamLocation } from '@/apis/exam/examLocation'
import { type ColumnItem, GiForm } from '@/components/GiForm'
import { useResetReactive } from '@/hooks'
import { useAddress } from '@/hooks/exam/useExamLocal'
import {useDept} from "@/hooks/app";
import { ilhahaProvinces } from "@/apis/address/address";

const emit = defineEmits<{
  (e: 'save-success'): void
}>()

const { width } = useWindowSize()

const dataId = ref('')
const visible = ref(false)
const isUpdate = computed(() => !!dataId.value)
const title = computed(() => (isUpdate.value ? '修改考试地点' : '新增考试地点'))
const formRef = ref<InstanceType<typeof GiForm>>()
const { addressList, cityList, areaList, getProvincesList, getCityList, getAreaList } = useAddress()

const [form, resetForm] = useResetReactive({
  locationName: '',
  provinceId: '',
  cityId: '',
  streetId: '',
  detailedAddress: '',
  operationalStatus: undefined,
})
const provinces = ref([])

const columns: ColumnItem[] = reactive([
  {
    label: '地点名称',
    prop: 'locationName',
    field: 'locationName',
    type: 'input',
    span: 24,
    required: true,
  },
  {
    label: '选择地区',
    prop: 'region', // 绑定的字段名
    field: 'region',
    type: 'cascader',
    span: 24,
    show: () =>dataId.value === '',
    required: true,
    props: {
      options: provinces, // 省市区数据
      allowSearch: true,
      onChange: (value: string) => handleRegionChange(value), 
    },
  },
  {
    label: '详细地址',
    prop: 'detailedAddress',
    field: 'detailedAddress',
    type: 'input',
    show: () =>dataId.value === '',
    required: true,
    span: 24,
  },
  // {
  //   label: '运营状态',
  //   field: 'operationalStatus',
  //   type: 'select',
  //   span: 24,
  //   required: true,
  //   props: {
  //     options: [
  //       { label: '运营中', value: '0' },
  //       { label: '休息中', value: '1' },
  //       { label: '维护中', value: '2' },
  //       { label: '已关闭', value: '3' },
  //     ],
  //     placeholder: '请选择运营状态'
  //   }
  // },
])

const handleRegionChange = (value: string) => {
    const {provinceId,cityId,areaId} = getRegionByAreaId(value);
    form.provinceId = provinceId
    form.cityId = cityId
    form.streetId = areaId
}

const getRegionByAreaId = (areaId: string) => {
  let provinceId = '';
  let cityId = '';
  // Iterate through provinces
  for (const province of provinces.value) {
    // Iterate through cities in each province
    for (const city of province.children) {
      // Iterate through areas in each city
      for (const area of city.children) {
        if (area.value === areaId) {
          provinceId = province.value;  // Found the province ID
          cityId = city.value;  // Found the city ID
          return { provinceId, cityId, areaId };  // Return the IDs of the province, city, and area
        }
      }
    }
  }
  
  // If not found, return undefined or handle as needed
  return { provinceId: undefined, cityId: undefined, areaId: undefined };
}
// 重置
const reset = () => {
  formRef.value?.formRef?.resetFields()
  resetForm()
}

// 保存
const save = async () => {
  try {
    const isInvalid = await formRef.value?.formRef?.validate()
    if (isInvalid) return false
    if (isUpdate.value) {
      await updateExamLocation(form, dataId.value)
      Message.success('修改成功')
    } else {
      await addExamLocation(form)
      Message.success('新增成功')
    }
    emit('save-success')
    return true
  } catch (error) {
    return false
  }
}
const getAddressTree = async  () => {
   const res = await ilhahaProvinces()
    // 确保数据结构符合 cascader 组件的要求
    provinces.value = res.data.map((province: RcDistrictDO) => ({
      label: province.district, // 显示的名称
      value: province.districtId, // 绑定的值
      children: province.child?.map((city: RcDistrictDO) => ({
        label: city.district,
        value: city.districtId,
        children: city.child?.map((area: RcDistrictDO) => ({
          label: area.district,
          value: area.districtId,
        }))
      }))
    }))
}
// 新增
const onAdd = async () => {
  reset()
getAddressTree();
  dataId.value = ''
  visible.value = true
}
// 修改
const onUpdate = async (id: string) => {
  reset()
  dataId.value = id
  const { data } = await getExamLocation(id)  
  data.operationalStatus = String(data.operationalStatus)
  Object.assign(form, data)
  visible.value = true
}
defineExpose({ onAdd, onUpdate })
</script>

<style scoped lang="scss"></style>
