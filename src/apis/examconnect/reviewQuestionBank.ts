import http from '@/utils/http'

const BASE_URL = '/examconnect/reviewQuestionBank'

export interface ReviewQuestionBankQuery {
  noticeId?: string | number
  projectId?: string | number
  planId?: string | number
}

/** @desc 导出试题库 */
export function exportReviewQuestionBank(query: ReviewQuestionBankQuery) {
  return http.download(`${BASE_URL}/export`, query)
}
