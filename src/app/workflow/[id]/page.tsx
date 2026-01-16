'use client'

import { updateBalance } from '@/actions/bill'
import { calculateTaskCostTime, getTaskResult, uploadAsset } from '@/actions/rh'
import { addTask, updateTask } from '@/actions/task'
import { getWorkfowById } from '@/actions/workflow'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMount } from 'ahooks'
import { App, Button, Divider, Spin } from 'antd'
import { saveAs } from 'file-saver'
import { useParams } from 'next/navigation'
import { useState } from 'react'

export default function Workflow() {
  const { message } = App.useApp()
  const { id } = useParams<{ id: string }>()

  const queryClient = useQueryClient()
  const [workflowDetail, setWorkflow] = useState<Record<string, any>>({})
  const [nodes, setNodes] = useState<AppScope.NodeInfoConfig[]>([])
  const [task, setTask] = useState<AppScope.TaskDetail & { id: string }>()

  useMount(async () => {
    const res = await getWorkfowById(id)
    setWorkflow(res)
    if (Array.isArray(res?.config)) {
      setNodes(res?.config as AppScope.NodeInfoConfig[])
    }
  })

  const runMutation = useMutation({
    mutationFn: async () => {
      for (const node of nodes) {
        if (node.fieldType === 'image' && node.required && !node.fieldValue) {
          throw new Error('请上传图片')
        }
        if (node.fieldType === 'video' && node.required && !node.fieldValue) {
          throw new Error('请上传视频')
        }
        if (node.fieldType === 'text' && node.required && !node.fieldValue) {
          throw new Error('请输入文本')
        }
      }

      const params = {
        workflowId: workflowDetail?.rh_workflowId,
        nodeInfoList: nodes.map((item) => ({
          nodeId: item.nodeId,
          fieldName: item.fieldName,
          fieldValue: item.fieldValue,
        })),
      }

      console.log('sfsfsf', params)

      const res = await addTask(params)
      setTask(res)
    },

    onError: (err) => {
      message.error(err.message)
    },
  })

  const taskResultQuery = useQuery({
    enabled: !!task?.taskId,
    retry: true,
    retryDelay: 5000,
    queryKey: ['task', 'detail', task?.taskId],
    queryFn: async () => {
      if (!task?.taskId) {
        throw new Error('请先创建任务')
      }

      const res = await getTaskResult(task.taskId)
      console.log('getTaskResult ====> ', res)

      if (res.code === 0 && Array.isArray(res.data)) {
        // 扣除积分
        const balance = await calculateTaskCostTime(res.data)
        await updateBalance(-balance)
        await updateTask({ id: task.id, taskStatus: 'SUCCESS', taskResultData: res.data })
        queryClient.invalidateQueries({ queryKey: ['userInfo'] })
        return res.data
      } else if (res.code === 805) {
        await updateTask({ id: task.id, taskStatus: 'FAILED', taskFailedReason: res.data })
        throw new Error(`任务失败,${res.msg}`)
      } else if (res.code === 804) {
        await updateTask({ id: task.id, taskStatus: 'RUNNING' })
        throw new Error('任务运行中')
      } else if (res.code === 813) {
        await updateTask({ id: task.id, taskStatus: 'QUEUED' })
        throw new Error('任务排队中')
      }
    },
  })

  const downloadResult = async (fileUrl: string) => {
    saveAs(fileUrl, fileUrl.split('/').pop())
  }

  return (
    <>
      <h1>Workflow {id}</h1>
      <p>{workflowDetail?.name}</p>
      <p>{workflowDetail?.rh_workflowId}</p>

      <div>
        <pre>{JSON.stringify(workflowDetail?.config, null, 2)}</pre>
      </div>

      <ul>
        {nodes.map((item) => (
          <li key={item.nodeId}>
            <NodeItem
              data={item}
              onChange={(data) => setNodes((nodes) => nodes.map((node) => (node.nodeId === item.nodeId ? data : node)))}
            />
          </li>
        ))}
      </ul>

      <footer className='space-x-4'>
        <Button
          type='primary'
          loading={runMutation.isPending}
          disabled={!!task?.taskId && taskResultQuery.isPending}
          onClick={() => runMutation.mutate()}
        >
          运行
        </Button>
      </footer>

      <Divider />

      <p className='text-md m-6 text-red-300'>{taskResultQuery.error?.message}</p>

      <ol className='m-6 space-y-3'>
        {taskResultQuery.data?.map((item) => (
          <li key={item.fileUrl}>
            <Button type='primary' onClick={() => downloadResult(item.fileUrl)}>
              {item.fileUrl.split('/').pop()}
            </Button>
          </li>
        ))}
      </ol>
    </>
  )
}

function NodeItem(props: { data: AppScope.NodeInfoConfig; onChange: (data: AppScope.NodeInfoConfig) => void }) {
  const { message } = App.useApp()

  const [loading, setLoading] = useState(false)
  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setLoading(true)
        const res = await uploadAsset(file)
        props.onChange({
          ...props.data,
          fieldValue: res.fileName,
        })
      } catch (error) {
        console.log(error)
        if (error instanceof Error) {
          message.error(error.message)
        }
      } finally {
        setLoading(false)
      }
    }
  }

  if (props.data.fieldType === 'image') {
    return (
      <Spin spinning={loading}>
        <p className='m-4 space-x-4'>
          <label htmlFor='image'>上传图片</label>
          <input type='file' accept='image/*' onChange={onUpload} />
        </p>
      </Spin>
    )
  }

  if (props.data.fieldType === 'video') {
    return (
      <Spin spinning={loading}>
        <p className='m-4 space-x-4'>
          <label htmlFor='video'>上传视频</label>
          <input type='file' accept='video/*' onChange={onUpload} />
        </p>
      </Spin>
    )
  }

  if (props.data.fieldType === 'text') {
    return (
      <p className='m-4 space-x-4'>
        <label htmlFor='text'>输入文本</label>
        <input
          type='text'
          value={props.data.fieldValue}
          onChange={(e) =>
            props.onChange({
              ...props.data,
              fieldValue: e.target.value,
            })
          }
        />
      </p>
    )
  }

  return null
}
