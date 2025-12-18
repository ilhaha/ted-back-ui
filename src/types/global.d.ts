interface AnyObject {
  [key: string]: unknown
}

interface Options {
  label: string
  value: unknown
}

/** 键值对类型 */
export interface LabelValueState {
  label: string
  value: any
  extra?: string
}

export interface ExamProjectOption {
  label: string
  value: number
  children?: ExamProjectChild[]
}

export interface ExamProjectChild {
  label: string
  value: number
  disabled?: boolean
  isOperation?: 0 | 1
}


declare global{
  type Recordable<T = any> = Record<string, T>
}

/** 状态（1：启用；2：禁用） */
type Status = 1 | 2

/** 性别（1：男；2：女；0：未知） */
type Gender = 1 | 2 | 0



// 分页响应类型
declare interface PageRes<T = any> {
  records: T
  total: number
  current: number
  size: number
}

// 基础响应类型
declare interface ApiRes<T = any> {
  success: boolean
  code: string | number
  msg: string
  data: T
}

// 分页查询参数
declare interface PageQuery {
  current?: number
  size?: number
}
