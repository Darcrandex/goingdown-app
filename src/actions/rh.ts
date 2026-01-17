'use server'

// RunningHub API 密钥
const runninghubApiKey = process.env.RUNNINGHUB_API_KEY || ''

// 资源上传
export async function uploadFile(file: File) {
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
  const data: RHApi.Result<RHApi.UploadFileResult> = await res.json()
  return data
}

// 发起 webapp
export async function runWebapp(params: Omit<RHApi.WebappParams, 'apiKey'>) {
  const myHeaders = new Headers()
  myHeaders.append('Host', 'www.runninghub.cn')
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    apiKey: runninghubApiKey,
    webappId: params.webappId,
    nodeInfoList: params.nodeInfoList,
  })

  const requestOptions: any = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  }

  const res = await fetch('https://www.runninghub.cn/task/openapi/ai-app/run', requestOptions)
  const data: RHApi.Result<RHApi.TaskFetchResult> = await res.json()
  return data
}

// 发起工作流任务
export async function runWorkflow(params: Omit<RHApi.WorkflowParams, 'apiKey'>) {
  const myHeaders = new Headers()
  myHeaders.append('Host', 'www.runninghub.cn')
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    apiKey: runninghubApiKey,
    workflowId: params.workflowId,
    nodeInfoList: params.nodeInfoList,
  })

  const requestOptions: any = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  }

  const res = await fetch('https://www.runninghub.cn/task/openapi/create', requestOptions)
  const data: RHApi.Result<RHApi.TaskFetchResult> = await res.json()
  return data
}

// 获取任务状态和执行结果
export async function getTaskStatusAndResult(rhTaskId: string) {
  const myHeaders = new Headers()
  myHeaders.append('Host', 'www.runninghub.cn')
  myHeaders.append('Content-Type', 'application/json')

  const raw = JSON.stringify({
    apiKey: runninghubApiKey,
    taskId: rhTaskId,
  })

  const requestOptions: any = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  }

  const res = await fetch('https://www.runninghub.cn/task/openapi/outputs', requestOptions)
  const data: RHApi.Result<RHApi.TaskDetailResult> = await res.json()
  return data
}

// v0-------------------------------------------------------
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
  const json = await res.json()
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
  const json = await res.json()

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
  const json = await res.json()
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
  const json = await res.json()

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
  const json = await res.json()

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
  const json = await res.json()

  console.log('run workflow task====> ', json)

  if (json.code !== 0) {
    throw new Error(json.msg || '运行任务失败')
  }

  return json.data
}
