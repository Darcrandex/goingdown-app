declare namespace AppScope {
  // 用于运行工作流时,输入节点的信息
  type NodeInfo = {
    nodeId: string
    fieldName: string
    fieldValue: string
  }

  // 用于运行工作流时,输入节点的配置信息
  // 用于渲染参数表单
  type NodeInfoConfig = NodeInfo & {
    fieldType: 'image' | 'video' | 'text' | 'integer' | 'float' | 'select' | 'switch'
    required?: boolean
    fieldData?: string // 一般为选项配置, JSON 字符串
    description?: string
  }

  // 解析后的 fieldData 配置
  type FieldDataParsed = [string[], { default: string }]
}
