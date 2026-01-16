'use client'

import { addWorkfow, getWorkfowById, getWorkfows, updateWorkfow } from '@/actions/workflow'
import { useUserInfo } from '@/query/useUserInfo'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Drawer, Form, Input } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import { useState } from 'react'

export default function WorkflowManagement() {
  const { message } = App.useApp()
  const userInfoQuery = useUserInfo()
  const queryClient = useQueryClient()
  const workflowsQuery = useQuery({
    queryKey: ['workflows'],
    queryFn: getWorkfows,
  })

  const [form] = Form.useForm()
  const [visible, setVisible] = useState(false)

  const onAdd = () => {
    form.resetFields()
    setVisible(true)
  }

  const onEdit = async (id: string) => {
    setVisible(true)
    const res = await getWorkfowById(id)
    form.setFieldsValue({
      ...res,
      workflowId: res.rh_workflowId,
      nodeInfoList: JSON.stringify(res.config || '[]', null, 2),
    })
  }

  const upsetMutation = useMutation({
    mutationFn: async (values: any) => {
      const data = {
        id: values.id,
        workflowId: values.workflowId,
        name: values.name,
        nodeInfoList: JSON.parse(values.nodeInfoList),
      }

      if (values.id) {
        await updateWorkfow(data)
      } else {
        await addWorkfow(data)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      setVisible(false)
      form.resetFields()
    },
    onError: (err) => {
      message.error(err.message)
    },
  })

  if (userInfoQuery.data?.role !== 'admin') {
    return <p className='m-6 text-center text-red-500'>您没有权限访问此页面</p>
  }

  return (
    <>
      <h1>Workflow 管理</h1>

      <header>
        <Button type='primary' onClick={onAdd}>
          添加工作流
        </Button>
      </header>

      <ol className='m-6 space-y-4'>
        {workflowsQuery.data?.map((item) => (
          <li key={item.rh_workflowId}>
            <p>{item.name}</p>
            <Button type='primary' onClick={() => onEdit(item.id)}>
              编辑
            </Button>
          </li>
        ))}
      </ol>

      <Drawer title='工作流' size='large' open={visible} onClose={() => setVisible(false)}>
        <Form form={form} onFinish={upsetMutation.mutate} labelCol={{ span: 3 }}>
          <Form.Item name='id' hidden>
            <Input disabled />
          </Form.Item>

          <Form.Item name='workflowId' label='工作流ID' rules={[{ required: true, message: '请输入工作流ID' }]}>
            <Input />
          </Form.Item>

          <Form.Item name='name' label='名称' rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>

          <Form.Item name='nodeInfoList' label='节点配置'>
            <TextArea rows={8} />
          </Form.Item>

          <Form.Item wrapperCol={{ offset: 3 }}>
            <Button type='primary' htmlType='submit'>
              提交
            </Button>
          </Form.Item>
        </Form>
      </Drawer>
    </>
  )
}
