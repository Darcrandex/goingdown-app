'use client'
import { addTask, checkQueuedTask, getTaskById } from '@/actions/task'
import { getWebappById } from '@/actions/webapp'
import { TaskStatus } from '@/db/schema/task'
import { useUserInfo } from '@/query/useUserInfo'
import { useMutation, useQuery } from '@tanstack/react-query'
import { App, Button, Divider } from 'antd'
import { saveAs } from 'file-saver'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'

export default function WebappDetail() {
  const { message } = App.useApp()
  const { id } = useParams<{ id: string }>()
  const { data } = useQuery({
    queryKey: ['webapp', id],
    queryFn: () => getWebappById(id),
  })

  // 任务运行
  const userInfoQuery = useUserInfo()
  const [taskId, setTaskId] = useState('')
  const [isDone, setIsDone] = useState(false)

  const runMutation = useMutation({
    mutationFn: async () => {
      if (!userInfoQuery.data?.id) {
        throw new Error('请先登录')
      }

      const canRun = await checkQueuedTask()
      if (!canRun) {
        throw new Error('有任务正在排队中，请稍后重试')
      }

      const nodeInfoList = (data?.nodeInfoList || []) as AppScope.NodeInfo[]
      return addTask({ webappId: data?.webappId || '', workflowId: data?.workflowId || '', nodeInfoList })
    },
    onSuccess: (data) => {
      setTaskId(data.id)
    },
    onError: (error) => {
      message.error(error.message)
    },
  })

  const taskDetailQuery = useQuery({
    enabled: Boolean(taskId && !isDone),
    refetchInterval: 5000,
    queryKey: ['getSomething'],
    queryFn: async () => {
      const res = await getTaskById(taskId)
      if (res.status === TaskStatus.SUCCESS || res.status === TaskStatus.FAILED) {
        setIsDone(true)
      }
      return res
    },
  })

  const outputs = useMemo(() => {
    if (Array.isArray(taskDetailQuery.data?.resultList)) {
      return taskDetailQuery.data?.resultList as RHApi.TaskSuccessResult
    }
    return []
  }, [taskDetailQuery.data?.resultList])

  const onDownload = (fileUrl: string) => {
    saveAs(fileUrl, fileUrl.split('/').pop() || 'download')
  }

  return (
    <>
      <div className='m-10'>
        <pre>{JSON.stringify(data, null, 2)}</pre>
      </div>

      <hr />

      <div className='m-10'>
        <Button
          onClick={() => runMutation.mutate()}
          loading={runMutation.isPending}
          disabled={
            taskDetailQuery.data?.status === TaskStatus.QUEUED || taskDetailQuery.data?.status === TaskStatus.RUNNING
          }
        >
          运行
        </Button>
      </div>

      <Divider />

      <div className='m-10'>
        <p>任务ID: {taskDetailQuery.data?.id}</p>
        <p>任务状态: {taskDetailQuery.data?.status}</p>
        <p>错误信息:</p>
        {taskDetailQuery.data?.status === TaskStatus.FAILED && (
          <pre className='m-4 text-red-400'>{JSON.stringify(taskDetailQuery.data?.errorMsg, null, 2)}</pre>
        )}
      </div>

      <h2 className='mx-10 text-xl font-bold'>输出结果</h2>
      <ol className='m-10 space-y-3'>
        {outputs.map((v) => (
          <li key={v.fileUrl} className='flex items-center space-x-3'>
            <span>{v.fileUrl}</span>
            <Button onClick={() => onDownload(v.fileUrl)}>下载</Button>
          </li>
        ))}
      </ol>
    </>
  )
}
