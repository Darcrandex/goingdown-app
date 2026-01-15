'use server'

const runninghubApiKey = process.env.RUNNINGHUB_API_KEY || ''

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
  const json: AppScope.RunningHubResult<AppScope.TaskResult> = await res.json()

  return json.data
}
