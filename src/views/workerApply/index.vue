<template>
  <div class="gi_table_page">
    <GiTable row-key="id" :data="dataList" :columns="columns" :loading="loading"
      :scroll="{ x: '100%', y: '100%', minWidth: 1000 }" :pagination="pagination" :disabled-tools="['size']"
      :disabled-column-keys="['name']" @refresh="search" :key="JSON.stringify(columns)">
      <template #toolbar-left>
        <a-input-search v-model="queryForm.candidateName" placeholder="请输入作业人员姓名" allow-clear @search="search" />
        <a-select v-model="queryForm.status" placeholder="状态" allow-clear class="search-input ml-2" @change="search">
          <a-option :value="4">待上传</a-option>
          <a-option :value="6">待完善</a-option>
          <a-option :value="5">待提交</a-option>
          <a-option :value="0">待审核</a-option>
          <a-option :value="1">待报考 / 考试</a-option>
          <a-option :value="2">驳回</a-option>
          <a-option :value="3">虚假资料</a-option>
        </a-select>
        <a-select v-model="queryForm.applyType" placeholder="来源" allow-clear class="search-input ml-2" @change="search">
          <a-option :value="0">扫码报考</a-option>
          <a-option :value="1">机构报考</a-option>
        </a-select>
        <a-button @click="reset">
          <template #icon><icon-refresh /></template>
          <template #default>重置</template>
        </a-button>
      </template>

      <template #projectName="{ record }">
        {{ record.categoryName + " / " + record.projectName }}
      </template>
      <template #idCardPhotoFront="{ record }">
        <a-space v-if="record.idCardPhotoFront">
          <a-image width="80" height="60" :src="record.idCardPhotoFront" :preview-props="{ zoomRate: 1.5 }"
            class="preview-image" fit="cover" />
          <a-image width="80" height="60" :src="record.idCardPhotoBack" :preview-props="{ zoomRate: 1.5 }"
            class="preview-image" fit="cover" />
        </a-space>
        <span v-else>-</span>
      </template>
      <template #facePhoto="{ record }">
        <a-space v-if="record.facePhoto">
          <a-image width="80" height="60" :src="record.facePhoto" :preview-props="{ zoomRate: 1.5 }"
            class="preview-image" fit="cover" />
        </a-space>
        <span v-else>-</span>
      </template>
      <template #qualificationPath="{ record }">
        <!-- 文件存在 -->
        <template v-if="record.qualificationPath">
          <!-- 图片显示缩略图 -->
          <a-image v-if="isImage(record.qualificationPath)" width="80" height="60" :src="record.qualificationPath"
            :preview-props="{ zoomRate: 1.5 }" class="preview-image" fit="cover" />
          <!-- PDF 显示预览按钮 -->
          <a-link v-else title="预览报名资格申请表" @click="getPreviewUrl(record.qualificationPath)">
            PDF预览
          </a-link>
        </template>
        <!-- 文件不存在 -->
        <span v-else>-</span>
      </template>

      <template v-for="col in docColumns" :key="col.title" #[`doc_${col.title}`]="{ record }">
        <span v-if="record.docMap && record.docMap[col.title]" class="preview-image">

          <template v-for="(path, index) in record.docMap[col.title].split(',')" :key="index">
            <!-- 图片 -->
            <a-image v-if="isImage(path)" width="80" height="60" :src="path" :preview-props="{ zoomRate: 1.5 }"
              fit="cover" />

            <!-- PDF -->
            <a-link v-else title="预览文件" @click="getPreviewUrl(path)" style="margin-right:8px">
              PDF预览
            </a-link>
          </template>

        </span>

        <span v-else>-</span>
      </template>
      <template #status="{ record }">
        <a-tag :color="getStatusColor(record.status)">
          {{ getStatusText(record.status) }}
        </a-tag>
      </template>
      <template #applyType="{ record }">
        <a-tag :color="getApplyTypeColor(record.applyType)">
          {{ getApplyTypeText(record.applyType) }}
        </a-tag>
      </template>
    </GiTable>

  </div>
</template>

<script setup lang="ts">
import { type WorkerApplyResp, type WorkerApplyQuery, listWorkerApply, deleteWorkerApply } from '@/apis/worker/workerApply'
import type { TableInstanceColumns } from '@/components/GiTable/type'
import { useDownload, useTable } from '@/hooks'
import { useDict } from '@/hooks/app'
import { isMobile } from '@/utils'
import has from '@/utils/has'
import { Message } from '@arco-design/web-vue'
import { useResetReactive } from '@/hooks'
import { useWindowSize } from '@vueuse/core'

const emit = defineEmits<{
  (e: 'showModel', payload: any): void
}>()

defineOptions({ name: 'WorkerApply' })
const { width } = useWindowSize()
const [form, resetForm] = useResetReactive({
  status: undefined,
  applyType: undefined,
  remark: undefined,
  reviewIds: undefined
})

const deleteLodding = ref(false)
const showWeldingCode = ref(false)

const queryForm = reactive<WorkerApplyQuery>({
  candidateName: undefined,
  status: undefined,
  applyType: undefined,
  isOrgQuery: true,
  classId: undefined
})


const {
  tableData: dataList,
  loading,
  pagination,
  search,
} = useTable((page) => listWorkerApply({ ...queryForm, ...page }), { immediate: false })

const baseColumns = ref<TableInstanceColumns[]>([
  { title: '序号', dataIndex: 'sort', slotName: 'sort', },
  { title: '姓名', dataIndex: 'candidateName', slotName: 'candidateName', },
  { title: '性别', dataIndex: 'gender', slotName: 'gender' },
  { title: '身份证号', dataIndex: 'idCardNumber', slotName: 'idCardNumber' },
  { title: '学历', dataIndex: 'education', slotName: 'education' },
  { title: '联系电话', dataIndex: 'phone', slotName: 'phone' },
  { title: '工作单位', dataIndex: 'workUnit', slotName: 'workUnit' },
  { title: '工作区域', dataIndex: 'address', slotName: 'address' },
  { title: '政治面貌', dataIndex: 'politicalStatus', slotName: 'politicalStatus' },
  // { title: '报考项目', dataIndex: 'projectName', slotName: 'projectName' },
  { title: '来源', dataIndex: 'applyType', slotName: 'applyType' },
  { title: '身份证住址', dataIndex: 'idCardAddress', slotName: 'idCardAddress' },
  { title: '身份证信息', dataIndex: 'idCardPhotoFront', slotName: 'idCardPhotoFront', width: 200, align: 'center' },
  { title: '二寸免冠照', dataIndex: 'facePhoto', slotName: 'facePhoto', width: 100, align: 'center', },
  { title: '资格申请表', dataIndex: 'qualificationPath', slotName: 'qualificationPath', width: 100, align: 'center', },
])

const fixedColumns = ref<TableInstanceColumns[]>([


])

const columns = computed(() => {
  // 复制一份 baseColumns，不修改原始 ref
  const cols: TableInstanceColumns[] = [...baseColumns.value]

  // 动态加入焊接列
  if (showWeldingCode.value) {
    cols.push({
      title: '焊接资格项目',
      dataIndex: 'weldingProjectCode',
      slotName: 'weldingProjectCode',
    })
  }

  // 添加其他列
  return [
    ...cols,
    ...docColumns.value,
    { title: '状态', dataIndex: 'status', slotName: 'status' },
    ...fixedColumns.value,
  ]
})


const isImage = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url)
}


const remove = async (record: WorkerApplyResp) => {
  try {
    deleteLodding.value = true
    await deleteWorkerApply(record.id)
    Message.success("操作成功")
    search()
  } finally {
    deleteLodding.value = false
  }

}

const onOpen = async (classId: string, projectId: string) => {
  queryForm.classId = classId
  showWeldingCode.value = projectId == '110' || projectId == '111'
  reset()

}

// 重置
const reset = () => {
  queryForm.candidateName = undefined
  queryForm.applyType = undefined
  queryForm.status = undefined
  search()
}


c

const getConfirmMessage = (status: number) => {
  switch (status) {
    case 0: return '确定要撤回该申请吗？'
    case 1: return '确定要将该成员移出班级吗？'
    case 2: return '确定要删除该记录吗？'
    case 3: return '确定要作废该条数据吗？'
    default: return '确定要执行该操作吗？'
  }
}

const getActionTitle = (status: number) => {
  switch (status) {
    case 0: // 未审核
      return '撤回申请'
    case 1: // 已通过
      return '移出'
    case 2: // 未通过
      return '删除'
    case 3: // 虚假材料
      return '作废'
    default:
      return ''
  }
}


const getApplyTypeColor = (status: number) => {
  switch (status) {
    case 0:
      return 'blue'
    case 1:
      return 'orange'
    default:
      return 'gray'
  }
}

const getApplyTypeText = (status: number) => {
  switch (status) {
    case 0:
      return '扫码报考'
    case 1:
      return '机构报考'
    default:
      return ''
  }
}

const getStatusText = (status: number) => {
  switch (status) {
    case 0:
      return '待审核'
    case 1:
      return '待报考 / 考试'
    case 2:
      return '驳回'
    case 3:
      return '虚假资料'
    case 4:
      return '待上传'
    case 5:
      return '待提交'
    case 6:
      return '待完善'
    case 7:
      return '已考试'
    default:
      return ''
  }
}



const getStatusColor = (status: number) => {
  switch (status) {
    case 0:
      return 'blue'
    case 1:
      return 'green'
    case 2:
      return 'orange'
    case 3:
      return 'red'
    case 4:
      return 'purple'
    case 5:
      return 'blue'
    case 6:
      return 'orangered'
    case 7:
      return 'gray'
    default:
      return 'gray'
  }
}
const docColumns = computed(() => {
  const allDocNames = new Set<string>()
  dataList.value.forEach(item => {
    if (item.docMap) {
      Object.keys(item.docMap).forEach(key => allDocNames.add(key))
    }
  })
  return Array.from(allDocNames).map(name => ({
    title: name,
    dataIndex: name,
    slotName: `doc_${name}`,
    align: 'center'
  }))
})


watch(
  () => queryForm.status,
  (val) => {
    const remarkIndex = fixedColumns.value.findIndex(c => c.dataIndex === 'remark')
    const needRemark = val !== 0
    if (needRemark && remarkIndex === -1) {
      fixedColumns.value.splice(0, 0, {
        title: '审核意见',
        dataIndex: 'remark',
        slotName: 'remark'
      })
    } else if (!needRemark && remarkIndex !== -1) {
      fixedColumns.value.splice(remarkIndex, 1)
    }
  },
  { immediate: true }
)


defineExpose({ onOpen })
</script>

<style scoped>
.arco-modal-body {
  padding: 0;
}

.preview-image {
  display: flex;
  /* 横向排列 */
  flex-wrap: wrap;
  /* 空间不足自动换行 */
  gap: 8px;
  /* 图片间距，可调 */
}
</style>
