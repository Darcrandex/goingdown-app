'use client'
import { getTasks } from '@/actions/task'
import { useQuery } from '@tanstack/react-query'

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
            <p>{task.taskId}</p>
            <p>{task.status}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
