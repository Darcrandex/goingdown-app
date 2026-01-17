'use client'

import { getWebappById, upsertWebapp } from '@/actions/webapp'
import { Webapp } from '@/db/schema/webapp'
import { useMutation } from '@tanstack/react-query'
import { useMount } from 'ahooks'
import { Button, Form, Input } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'

export default function WebappEdit() {
  const router = useRouter()
  const [form] = Form.useForm()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useMount(async () => {
    if (id) {
      const detail = await getWebappById(id)
      console.log('detail', detail)

      const nodeInfoList = JSON.stringify(detail.nodeInfoList)
      form.setFieldsValue({ ...detail, nodeInfoList })
    }
  })

  const submitMutation = useMutation({
    mutationFn: async (values: Omit<Webapp, 'id'> & { id?: string }) => {
      console.log('values', values)

      await upsertWebapp(values)
    },
    onSuccess() {
      router.push('/admin/webapp')
    },
  })

  return (
    <>
      <h1 className='text-center text-2xl font-bold'>webapp 编辑页面</h1>

      <div className='mx-auto my-10 w-md'>
        <Form form={form} layout='vertical' onFinish={submitMutation.mutate} initialValues={id ? { id } : {}}>
          <Form.Item name='id'>
            <Input disabled />
          </Form.Item>

          <Form.Item name='name' label='名称' rules={[{ required: true, message: '请输入名称' }]}>
            <Input />
          </Form.Item>

          <Form.Item name='description' label='描述'>
            <Input.TextArea />
          </Form.Item>

          <Form.Item name='webappId' label='Web应用ID'>
            <Input />
          </Form.Item>

          <Form.Item name='workflowId' label='工作流ID'>
            <Input />
          </Form.Item>

          <Form.Item name='nodeInfoList' label='节点入参(JSON)'>
            <Input.TextArea rows={10} />
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit'>
              提交
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  )
}
