import http from '@/utils/http'

export interface personFileResp {

  examPlanName: string
  nickname: string
  examScores: string
  documentList: document[]
  examPaper: string
}

export interface document {
  documentName: string
  documentUrl: string
}

export interface personFileQuery {
  nickName: string | undefined
  planName: string | undefined
  sort: Array<string>
}
export interface personFilePageQuery extends personFileQuery, PageQuery {}

/** @desc 扫码上传文件 */
export function applyUpload(data: FormData) {
  return http.post(`/upload/apply/file`, data)
}

export function listPersonFile(query: personFilePageQuery) {
  return http.get<PageRes<personFileResp[]>>(`/file/personFile`, query)

}
export function getPersonFilePage(query: personFilePageQuery) {
  return http.get<PageRes<personFileResp[]>>(`/file/personFile/getPersonFilePage`, query)
}