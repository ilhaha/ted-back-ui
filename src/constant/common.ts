interface LabelValueItem { label: string, value: number, color?: string }

/** @desc 状态 */
export const DisEnableStatusList: LabelValueItem[] = [
  { label: '启用', value: 1, color: 'green' },
  { label: '禁用', value: 2, color: 'red' },
]

/** @desc 性别 */
export const GenderList: LabelValueItem[] = [
  { label: '男', value: 1 },
  { label: '女', value: 2 },
  { label: '未知', value: 0 },
]

/** @desc 监考考试类型 */
export const ExamSupervisionTypeList: LabelValueItem[] = [
  { label: '理论考试', value: 0 },
  { label: '实操考试', value: 1 },
]
