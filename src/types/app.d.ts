declare namespace AppScope {
  // 用于运行工作流时,输入节点的信息
  type NodeInfo = {
    nodeId: string
    fieldName: string
    fieldValue: any
  }

  // 用于运行工作流时,输入节点的配置信息
  type NodeInfoConfig = NodeInfo & {
    fieldType: 'image' | 'video' | 'text'
    required?: boolean
  }

  type RunningHubResult<T> = {
    code: number
    msg: string
    data: T
  }

  type UploadResult = {
    fileName: string
    fileType: string
  }

  type TaskDetail = {
    netWssUrl: string
    taskId: string
    clientId: string
    taskStatus: string
    promptTips: string
  }

  type TaskStatus = 'QUEUED' | 'RUNNING' | 'FAILED' | 'SUCCESS'

  type TaskSuccessResult = Array<{
    fileUrl: string
    fileType: string
    taskCostTime: string // 任务消耗时长(秒)
    nodeId: string
    thirdPartyConsumeMoney: null

    // 第三方API平台消费金额
    consumeMoney: null
    consumeCoins: string
  }>

  type TaskFailedResult = {
    failedReason: {
      current_outputs: string
      exception_type: string
      node_name: string
      current_inputs: string
      traceback: string
      node_id: string
      exception_message: string
    }
  }

  type TaskRunningResult = {
    netWssUrl: string
  }

  type TaskQueuedResult = null

  type TaskResult = TaskSuccessResult | TaskFailedResult | TaskRunningResult | TaskQueuedResult
}
