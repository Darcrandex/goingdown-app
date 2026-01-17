declare namespace AppScope {
  // 用于运行工作流时,输入节点的信息
  type NodeInfo = {
    nodeId: string
    fieldName: string
    fieldValue: any
  }

  // 用于运行工作流时,输入节点的配置信息
  type NodeInfoConfig = NodeInfo & {
    fieldType: 'image' | 'video' | 'text' | 'select'
    required?: boolean
    fieldData?: any
    description?: string
  }
}
