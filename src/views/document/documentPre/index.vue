<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 500 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #previewImage="{ record }">
        <a-space v-if="record.docPath">
          <a-image width="80" height="60" :src="record.docPath" :preview-props="{ zoomRate: 1.5 }" class="preview-image"
            fit="cover"  />
        </a-space>
        <span v-else>-</span>
      </template>
    </GiTable>
  </div>
</template>

<script setup lang="ts">
import { type DocumentPreResp, type DocumentPreQuery, deleteDocumentPre, exportDocumentPre, listDocumentPre } from '@/apis/document/documentPre'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'DocumentPre' })


const onOpen = async (id: string) => {
  queryForm.enrollPreUploadId = id
  search()
}


const queryForm = reactive<DocumentPreQuery>({
  enrollPreUploadId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listDocumentPre({ ...queryForm, ...page }), { immediate: true })
const columns = ref<TableInstanceColumns[]>([
  { title: '资料类型', dataIndex: 'typeName', slotName: 'enrollPreUploadId',width: "100px" },
  { title: '上传内容', dataIndex: 'docPath', slotName: 'previewImage',width: "100px" },
]);

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
