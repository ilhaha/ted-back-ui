<template>
  <a-modal
    v-model:visible="visible"
    title="重置密码"
    width="460px"
    @close="handleClose"
  >
<a-alert type="warning" show-icon style="margin-bottom:16px">
  <div>重置后用户原密码将失效</div>
  <div>请将新密码通知用户，并建议用户登录后立即修改密码</div>
</a-alert>

    <a-descriptions :column="1" bordered>
      <a-descriptions-item label="姓名">
        {{ data.nickname }}
      </a-descriptions-item>

      <a-descriptions-item label="手机号">
        {{ data.phone }}
      </a-descriptions-item>

      <a-descriptions-item label="新密码">
        <a-spin v-if="loading" />

        <template v-else-if="data.password">
          <a-space>
            <a-input
              :type="showPassword ? 'text' : 'password'"
              :model-value="data.password"
              readonly
              style="width:180px"
            />

            <a-button size="mini" @click="togglePassword">
              {{ showPassword ? '隐藏' : '显示' }}
            </a-button>

            <a-button size="mini" type="primary" @click="copyPassword">
              复制
            </a-button>
          </a-space>
        </template>

        <span v-else>点击下方按钮重置密码</span>
      </a-descriptions-item>
    </a-descriptions>

    <template #footer>
      <a-button @click="visible=false">
        取消
      </a-button>

      <a-button
        type="primary"
        :loading="loading"
        @click="handleReset"
      >
        确认重置
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message, Modal } from '@arco-design/web-vue'
import { resetCandidatePassword } from '@/apis/training/candidateType'

const visible = ref(false)
const loading = ref(false)
const showPassword = ref(false)

const data = reactive({
  candidateId: 0,
  nickname: '',
  phone: '',
  password: ''
})

interface CandidateRecord {
  candidateId: number
  nickname: string
  phone: string
}

const open = (record: CandidateRecord) => {
  visible.value = true

  data.candidateId = record.candidateId
  data.nickname = record.nickname
  data.phone = record.phone
  data.password = ''
}

const handleReset = () => {

  Modal.confirm({
    title: '确认重置密码',
    content: '确定要将该用户密码重置为默认密码 Abc@123456 吗？',
    onOk: async () => {

      loading.value = true

      try {
        const res = await resetCandidatePassword({
          candidateId: data.candidateId,
          phone: data.phone
        })

        if (res.success) {
          data.password = 'Abc@123456'
          Message.success('密码重置成功')
        } else {
          Message.error(res.msg || '重置失败')
        }
      } catch (e) {
        Message.error('重置失败')
      } finally {
        loading.value = false
      }
    }
  })
}

const copyPassword = async () => {
  await navigator.clipboard.writeText(data.password)
  Message.success('密码已复制')
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleClose = () => {
  data.password = ''
  showPassword.value = false
}

defineExpose({
  open
})
</script>