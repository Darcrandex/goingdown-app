declare namespace RHApi {
  type Result<T> = {
    code: number
    msg: string
    data: T
  }

  // 上传文件结果
  type UploadFileResult = { fileName: string; fileType: string }

  // AI应用任务参数
  type WebappParams = {
    apiKey: string
    webappId: string
    nodeInfoList: {
      nodeId: string
      fieldName: string
      fieldValue: any
    }[]
  }

  // 工作流任务参数
  type WorkflowParams = {
    apiKey: string
    workflowId: string
    nodeInfoList: {
      nodeId: string
      fieldName: string
      fieldValue: any
    }[]
  }

  // 任务发起结果
  type TaskFetchResult = {
    netWssUrl: string
    taskId: string
    clientId: string
    taskStatus: string
    promptTips: string
  }

  // 任务成功结果
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

  // 任务失败结果
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

  // 任务运行中结果
  type TaskRunningResult = {
    netWssUrl: string
  }

  // 任务排队中结果
  type TaskQueuedResult = null

  type TaskDetailResult = TaskSuccessResult | TaskFailedResult | TaskRunningResult | TaskQueuedResult
}
