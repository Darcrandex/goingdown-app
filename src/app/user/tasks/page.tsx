'use client'
import { getTaskById, getTasks } from '@/actions/task'
import { Task, TaskStatus } from '@/db/schema/task'
import { secondsToTime } from '@/utils/common'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'

export default function TasksPage() {
  const { data } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const tasks = await getTasks()
      return tasks
    },
  })

  return (
    <div>
      <h1>Tasks</h1>

      <ul>
        {data?.map((task) => (
          <li key={task.id}>
            <TaskItem task={task} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function TaskItem(props: { task: Task }) {
  const queryClient = useQueryClient()

  const [isDone, setIsDone] = useState(
    props.task.status === TaskStatus.SUCCESS || props.task.status === TaskStatus.FAILED,
  )

  useQuery({
    enabled: Boolean(props.task.id && !isDone),
    refetchInterval: 5000,
    queryKey: ['getTaskById', props.task.id],
    queryFn: async () => {
      const res = await getTaskById(props.task.id)
      if (res.status === TaskStatus.SUCCESS || res.status === TaskStatus.FAILED) {
        setIsDone(true)
      }
      return res
    },
  })

  useEffect(() => {
    if (isDone) {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    }
  }, [isDone, queryClient])

  const outputs = useMemo(() => {
    if (Array.isArray(props.task.resultList)) {
      return props.task.resultList as RHApi.TaskSuccessResult
    }
    return []
  }, [props.task.resultList])

  return (
    <>
      <h2>任务ID {props.task.id}</h2>
      <p>状态: {props.task.status}</p>
      <p>运行时间: {secondsToTime(props.task.duration)}</p>

      <ul>
        {outputs.map((v) => (
          <li key={v.fileUrl}>
            <p>{v.fileUrl.split('/').pop()}</p>
          </li>
        ))}
      </ul>
    </>
  )
}
