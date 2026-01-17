'use client'

import { userLogin } from '@/actions/auth'
import { useMutation } from '@tanstack/react-query'
import { Button, Form, Input } from 'antd'
import { useRouter } from 'next/navigation'

const actionTypes = [
  { label: '登录', value: 'login' },
  { label: '注册', value: 'register' },
]

export default function Login() {
  const router = useRouter()
  const [form] = Form.useForm()
  const submitMutation = useMutation({
    mutationFn: async (values: { phone: string; code: string }) => {
      await userLogin({ phone: values.phone, code: values.code })
    },

    onSuccess: () => {
      router.replace('/')
    },
  })

  return (
    <div className='mx-auto w-md'>
      <h1>登录</h1>

      <Form form={form} onFinish={submitMutation.mutate}>
        <Form.Item name='phone' label='手机号' rules={[{ required: true, message: '请输入手机号' }]}>
          <Input placeholder='请输入手机号' />
        </Form.Item>
        <Form.Item name='code' label='验证码' rules={[{ required: true, message: '请输入验证码' }]}>
          <Input placeholder='请输入验证码' maxLength={4} />
        </Form.Item>
        <Form.Item>
          <Button type='primary' htmlType='submit'>
            提交
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
