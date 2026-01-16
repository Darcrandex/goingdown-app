'use client'

import { userSignIn, userSignUp } from '@/actions/auth'
import { useMutation } from '@tanstack/react-query'
import { Button, Form, Input, Radio } from 'antd'
import { delay } from 'es-toolkit'
import { useRouter } from 'next/navigation'

const actionTypes = [
  { label: '登录', value: 'login' },
  { label: '注册', value: 'register' },
]

export default function Login() {
  const router = useRouter()
  const [form] = Form.useForm()
  const submitMutation = useMutation({
    mutationFn: async (values: Record<string, string>) => {
      console.log('values', values)

      if (values.actionType === 'login') {
        console.log('登录')
        await userSignIn({ email: values.email, password: values.password })
      } else if (values.actionType === 'register') {
        console.log('注册')
        await userSignUp({ email: values.email, password: values.password })
        await delay(1000)
        await userSignIn({ email: values.email, password: values.password })
      }
    },

    onSuccess: () => {
      router.replace('/')
    },
  })

  return (
    <div className='mx-auto w-md'>
      <h1>登录</h1>

      <Form form={form} initialValues={{ actionType: 'login' }} onFinish={submitMutation.mutate}>
        <Form.Item name='actionType' label='操作类型'>
          <Radio.Group options={actionTypes} />
        </Form.Item>
        <Form.Item
          name='email'
          label='邮箱'
          rules={[
            { required: true, message: '请输入邮箱' },
            { type: 'email', message: '请输入正确的邮箱格式' },
          ]}
        >
          <Input placeholder='请输入邮箱' />
        </Form.Item>
        <Form.Item name='password' label='密码' rules={[{ required: true, message: '请输入密码' }]}>
          <Input.Password placeholder='请输入密码' />
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
