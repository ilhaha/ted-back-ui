<template>
    <a-modal v-model:visible="visible" title="机构账号信息" width="600" :footer="null">
        <a-descriptions bordered column="1">
            <a-descriptions-item label="机构名称">
                {{ record?.name }}
            </a-descriptions-item>

            <a-descriptions-item label="账号信息（昵称 | 用户名）">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <span>{{ nickname }}</span>
                        <span style="margin: 0 8px; color: #aaa;">|</span>
                        <span>{{ username }}</span>
                    </div>

                    <a-popconfirm content="确定要解绑该账号吗？" ok-text="确定" cancel-text="取消" @ok="onUnbind">
                        <a-button status="danger" size="small">解绑</a-button>
                    </a-popconfirm>
                </div>
            </a-descriptions-item>

        </a-descriptions>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Message } from '@arco-design/web-vue'
import { unbindOrgAccount } from '@/apis/training/org'
import type { OrgResp } from '@/apis/training/org'
const emit = defineEmits<{
    (e: 'unbind-success'): void
}>()
const visible = ref(false)
const record = ref<OrgResp | null>(null)

const nickname = computed(() => record.value?.accountName?.split(' [ ')[0] ?? '')
const username = computed(() => {
    const parts = record.value?.accountName?.split(' [ ')
    if (parts?.length === 2) {
        return parts[1].split(' ] ')[0]
    }
    return ''
})

const onOpen = (data: OrgResp) => {
    record.value = data
    visible.value = true
}

const onUnbind = async () => {
    const res = await unbindOrgAccount(record.value!.id)
    if (res.data) {
        Message.success('解绑成功')
    } else {
        Message.error('解绑失败')

    }
    emit('unbind-success')
    visible.value = false
}

defineExpose({ onOpen })
</script>