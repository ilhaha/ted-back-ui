<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 500 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search">
      <template #docPath="{ record }">
        <a-space v-if="record.docPath">
          <a-image v-for="(path, index) in record.docPath.split(',')" :key="index" width="80" height="60" :src="path"
            :preview-props="{ zoomRate: 1.5 }" class="preview-image" fit="cover"  />
        </a-space>
        <span v-else>-</span>
      </template>
    </GiTable>

  </div>
</template>

<script setup lang="ts">
import { type WorkerApplyDocumentResp, type WorkerApplyDocumentQuery, deleteWorkerApplyDocument, exportWorkerApplyDocument, listWorkerApplyDocument } from '@/apis/worker/workerApplyDocument'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'

defineOptions({ name: 'WorkerApplyDocument' })


const queryForm = reactive<WorkerApplyDocumentQuery>({
  workerApplyId: undefined,
  sort: ['id,desc']
})

const {
  tableData: dataList,
  loading,
  pagination,
  search,
  handleDelete
} = useTable((page) => listWorkerApplyDocument({ ...queryForm, ...page }), { immediate: false })
const columns = ref<TableInstanceColumns[]>([

  { title: '资料类型', dataIndex: 'typeName', slotName: 'typeName' },
  { title: '上传内容', dataIndex: 'docPath', slotName: 'docPath' },
]);
const onOpen = async (id: string) => {
  queryForm.workerApplyId = id
  search()
}

defineExpose({ onOpen })
</script>

<style scoped lang="scss"></style>
