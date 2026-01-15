'use client'

import { createWokflowTask, getTaskResult, getTaskStatus, uploadAsset } from '@/actions/rh'
import { useMutation, useQuery } from '@tanstack/react-query'
import { saveAs } from 'file-saver'
import { useState } from 'react'

export default function Page() {
  const [imageFile, setImageFile] = useState<File>()
  const [videoFile, setVideoFile] = useState<File>()
  const [taskDetail, setTaskDetail] = useState<AppScope.TaskDetail>()
  const [taskStatus, setTaskStatus] = useState<AppScope.TaskStatus>()

  // 运行
  const runMutation = useMutation({
    mutationFn: async () => {
      if (!imageFile || !videoFile) {
        throw new Error('请上传图片或视频')
      }

      const imageData = await uploadAsset(imageFile)
      const videoData = await uploadAsset(videoFile)
      const taskRes = await createWokflowTask({ imageUrl: imageData.fileName, videoUrl: videoData.fileName })
      setTaskDetail(taskRes)
    },
  })

  // 查询任务状态
  useQuery({
    queryKey: ['taskStatus', taskDetail?.taskId],
    enabled: !!taskDetail?.taskId,
    refetchInterval: 5000,
    queryFn: async () => {
      if (!taskDetail?.taskId) {
        throw new Error('请先创建任务')
      }

      if (taskStatus === 'SUCCESS' || taskStatus === 'FAILED') {
        return taskStatus
      }

      const res = await getTaskStatus(taskDetail?.taskId)
      setTaskStatus(res)
      return res
    },
  })

  // 获取任务结果
  const taskResultQuery = useQuery({
    queryKey: ['taskResult', taskDetail?.taskId],
    enabled: !!taskDetail?.taskId && taskStatus === 'SUCCESS',
    queryFn: async () => {
      if (!taskDetail?.taskId) {
        throw new Error('请先创建任务')
      }

      return getTaskResult(taskDetail?.taskId)
    },
  })

  const downloadZip = async () => {
    if (!taskResultQuery.data) {
      throw new Error('请先获取任务结果')
    }

    if (Array.isArray(taskResultQuery.data)) {
      for (const item of taskResultQuery.data) {
        saveAs(item.fileUrl, item.fileUrl.split('/').pop())
      }
    }
  }

  return (
    <>
      <h1>RunningHub API</h1>

      <p>
        <label htmlFor='image'>上传图片</label>
        <input type='file' accept='image/*' onChange={(e) => setImageFile(e.target.files?.[0])} />
      </p>

      <p>
        <label htmlFor='video'>上传视频</label>
        <input type='file' accept='video/*' onChange={(e) => setVideoFile(e.target.files?.[0])} />
      </p>

      <p>
        <button
          type='button'
          className='rounded-md bg-sky-500 px-4 py-2 text-white disabled:bg-gray-300'
          disabled={!imageFile || !videoFile || runMutation.isPending || !!taskDetail?.taskId}
          onClick={() => runMutation.mutate()}
        >
          {runMutation.isPending ? 'loading...' : '运行'}
        </button>
      </p>

      <div className='m-6'>
        <pre>{JSON.stringify(taskDetail, null, 2)}</pre>
      </div>

      <hr />

      <div className='m-6'>
        <pre>{JSON.stringify(taskStatus, null, 2)}</pre>
      </div>

      <p className='space-x-4'>
        {taskDetail?.taskId ? <span>任务状态: {taskStatus || '等待中...'}</span> : null}

        <button
          type='button'
          className='rounded-md bg-sky-500 px-4 py-2 text-white disabled:bg-gray-300'
          disabled={!taskResultQuery.data}
          onClick={() => downloadZip()}
        >
          下载结果
        </button>
      </p>
    </>
  )
}
