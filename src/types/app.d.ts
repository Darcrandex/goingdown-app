declare namespace AppScope {
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

  type TaskResult = Array<{
    fileUrl: string
    fileType: string
    taskCostTime: string
    nodeId: string
    thirdPartyConsumeMoney: null
    consumeMoney: null
    consumeCoins: string
  }>
}
