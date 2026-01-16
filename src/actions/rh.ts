'use server'

const runninghubApiKey = process.env.RUNNINGHUB_API_KEY || ''

// 上传资产到 RunningHub
export async function uploadAsset(file: File) {
  const myHeaders = new Headers()
  myHeaders.append('Host', 'www.runninghub.cn')

  const formData = new FormData()
  formData.append('apiKey', runninghubApiKey)
  formData.append('file', file, file.name)
  formData.append('fileType', 'input')

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: formData,
    redirect: 'follow',
  }

  const res = await fetch('https://www.runninghub.cn/task/openapi/upload', requestOptions as any)
  const json: AppScope.RunningHubResult<AppScope.UploadResult> = await res.json()
  return json.data
}

// 创建应用任务
export async function createTask(params: { imageUrl: string; videoUrl: string }) {
  const webappId = '2011680122214031362'

  const myHeaders = new Headers()
  myHeaders.append('Host', 'www.runninghub.cn')
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    apiKey: runninghubApiKey,
    webappId,
    nodeInfoList: [
      {
        nodeId: '57',
        fieldName: 'image',
        fieldValue: params.imageUrl,
        description: '选择图片',
      },
      {
        nodeId: '255',
        fieldName: 'video',
        fieldValue: params.videoUrl,
        description: '选择视频',
      },
    ],
  })

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  }

  const res = await fetch('https://www.runninghub.cn/task/openapi/ai-app/run', requestOptions as any)
  const json: AppScope.RunningHubResult<AppScope.TaskDetail> = await res.json()

  return json.data
}

// 获取任务状态
export async function getTaskStatus(taskId: string) {
  const myHeaders = new Headers()
  myHeaders.append('Host', 'www.runninghub.cn')
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    apiKey: runninghubApiKey,
    taskId,
  })

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  }

  const res = await fetch('https://www.runninghub.cn/task/openapi/status', requestOptions as any)
  const json: AppScope.RunningHubResult<AppScope.TaskStatus> = await res.json()
  return json.data
}

// 获取任务结果
export async function getTaskResult(taskId: string) {
  const myHeaders = new Headers()
  myHeaders.append('Host', 'www.runninghub.cn')
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    apiKey: runninghubApiKey,
    taskId: taskId,
  })

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  }

  const res = await fetch('https://www.runninghub.cn/task/openapi/outputs', requestOptions as any)
  const json: AppScope.RunningHubResult<AppScope.TaskSuccessResult> = await res.json()

  return json
}

export async function createWokflowTask(params: { imageUrl: string; videoUrl: string }) {
  const workflowId = '2011984406000443394'
  const myHeaders = new Headers()
  myHeaders.append('Host', 'www.runninghub.cn')
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    apiKey: runninghubApiKey,
    workflowId,
    nodeInfoList: [
      {
        nodeId: '57',
        fieldName: 'image',
        fieldValue: params.imageUrl,
        description: '选择图片',
      },
      {
        nodeId: '255',
        fieldName: 'video',
        fieldValue: params.videoUrl,
        description: '选择视频',
      },
    ],
  })

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  }

  const res = await fetch('https://www.runninghub.cn/task/openapi/create', requestOptions as any)
  const json: AppScope.RunningHubResult<AppScope.TaskDetail> = await res.json()

  return json.data
}

export async function runWokflowTask(params: { workflowId: string; nodeInfoList: AppScope.NodeInfo[] }) {
  const myHeaders = new Headers()
  myHeaders.append('Host', 'www.runninghub.cn')
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    apiKey: runninghubApiKey,
    workflowId: params.workflowId,
    nodeInfoList: params.nodeInfoList,
  })

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  }

  console.log('runWokflowTask params ====> ', params)

  const res = await fetch('https://www.runninghub.cn/task/openapi/create', requestOptions as any)
  const json: AppScope.RunningHubResult<AppScope.TaskDetail> = await res.json()

  console.log('run workflow task====> ', json)

  if (json.code !== 0) {
    throw new Error(json.msg || '运行任务失败')
  }

  return json.data
}

// 计算任务消耗的积分
export async function calculateTaskCostTime(taskResult: AppScope.TaskSuccessResult) {
  // 每个秒消耗0.01积分
  const balancePerSecond = 0.01
  if (!Array.isArray(taskResult)) {
    return 0
  }
  return taskResult.reduce((acc, cur) => acc + (Number.parseFloat(cur.taskCostTime) || 0), 0) * balancePerSecond
}
