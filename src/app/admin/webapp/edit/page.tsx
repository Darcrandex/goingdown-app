'use client'

import { getWebappById, upsertWebapp } from '@/actions/webapp'
import { Webapp } from '@/db/schema/webapp'
import { CloseOutlined } from '@ant-design/icons'
import { useMutation } from '@tanstack/react-query'
import { useControllableValue, useMount } from 'ahooks'
import { Button, Col, Form, Input, InputNumber, Radio, Row, Select } from 'antd'
import { useRouter, useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'

const taskTypeOptions = [
  { label: 'AI应用', value: 'webapp' },
  { label: '工作流', value: 'workflow' },
]

const fieldTypeOptions: { label: string; value: AppScope.NodeInfoConfig['fieldType'] }[] = [
  { label: '图片', value: 'image' },
  { label: '视频', value: 'video' },
  { label: '文本', value: 'text' },
  { label: '整数', value: 'integer' },
  { label: '浮点数', value: 'float' },
  { label: '选择', value: 'select' },
  { label: '开关', value: 'switch' },
]

export default function WebappEdit() {
  const router = useRouter()
  const [form] = Form.useForm()
  const [type, setType] = useState('webapp')

  const searchParams = useSearchParams()
  const id = searchParams.get('id')

  useMount(async () => {
    if (id) {
      const detail = await getWebappById(id)
      setType(detail.webappId ? 'webapp' : 'workflow')
      form.setFieldsValue(detail)
    }
  })

  const submitMutation = useMutation({
    mutationFn: async (values: Omit<Webapp, 'id'> & { id?: string }) => {
      await upsertWebapp(values)
    },
    onSuccess() {
      router.push('/admin/webapp')
    },
  })

  return (
    <>
      <h1 className='text-center text-2xl font-bold'>webapp 编辑页面</h1>

      <div className='mx-auto my-10 w-3xl'>
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

          <Form.Item label='类型' rules={[{ required: true, message: '请选择类型' }]}>
            <Radio.Group
              options={taskTypeOptions}
              value={type}
              onChange={(e) => {
                setType(e.target.value)
                form.setFieldsValue({ webappId: '', workflowId: '' })
              }}
            />
          </Form.Item>

          <Form.Item
            name='webappId'
            label='Web应用ID'
            hidden={type !== 'webapp'}
            rules={[{ required: type === 'webapp', message: '请输入Web应用ID' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='workflowId'
            label='工作流ID'
            hidden={type !== 'workflow'}
            rules={[{ required: type === 'workflow', message: '请输入工作流ID' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item label='节点参数'>
            <Form.List name='nodeInfoList'>
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <div key={key} className='my-4 rounded-md border border-blue-200 p-4'>
                      <Row>
                        <Col span={20}>
                          <Row gutter={16}>
                            <Col span={6}>
                              <Form.Item
                                {...restField}
                                name={[name, 'nodeId']}
                                label='节点ID'
                                rules={[{ required: true, message: '请输入节点ID' }]}
                              >
                                <Input placeholder='节点ID' />
                              </Form.Item>
                            </Col>

                            <Col span={6}>
                              <Form.Item
                                {...restField}
                                name={[name, 'fieldName']}
                                label='字段名'
                                rules={[{ required: true, message: '请输入字段名' }]}
                              >
                                <Input placeholder='字段名' />
                              </Form.Item>
                            </Col>

                            <Col span={6}>
                              <Form.Item
                                {...restField}
                                name={[name, 'fieldType']}
                                label='字段类型'
                                rules={[{ required: true, message: '请选择字段类型' }]}
                              >
                                <Select placeholder='字段类型' options={fieldTypeOptions} />
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item {...restField} name={[name, 'description']} label='描述'>
                                <Input.TextArea rows={3} placeholder='描述' maxLength={500} />
                              </Form.Item>
                            </Col>

                            <Col span={24}>
                              <Form.Item shouldUpdate noStyle>
                                {() => {
                                  const type = form.getFieldValue(['nodeInfoList', name, 'fieldType'])

                                  if (type === 'select') {
                                    return (
                                      <Form.Item {...restField} name={[name, 'fieldData']} label='选项配置'>
                                        <TypeSelectInput />
                                      </Form.Item>
                                    )
                                  }

                                  return (
                                    <Form.Item {...restField} name={[name, 'fieldData']} label='选项配置' hidden>
                                      <Input disabled />
                                    </Form.Item>
                                  )
                                }}
                              </Form.Item>

                              <Form.Item shouldUpdate noStyle>
                                {() => {
                                  const config = form.getFieldValue(['nodeInfoList', name])
                                  return (
                                    <Form.Item {...restField} name={[name, 'fieldValue']} label='默认值'>
                                      <FieldDefaultValue config={config} />
                                    </Form.Item>
                                  )
                                }}
                              </Form.Item>
                            </Col>
                          </Row>
                        </Col>

                        <Col span={4} className='text-right'>
                          <Button onClick={() => remove(name)}>删除</Button>
                        </Col>
                      </Row>
                    </div>
                  ))}

                  <Form.Item>
                    <Button
                      type='dashed'
                      onClick={() => add({ nodeId: '1', fieldName: 'text', fieldType: 'text', description: '' })}
                      block
                    >
                      添加节点参数
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item>
            <Button type='primary' htmlType='submit' loading={submitMutation.isPending}>
              提交
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  )
}

function TypeSelectInput(props: { value?: string; onChange?: (newVal: string) => void }) {
  const [value, setValue] = useControllableValue<string>(props)
  const { items, defaultValue } = useMemo(() => {
    try {
      const fieldData: AppScope.FieldDataParsed = JSON.parse(value || '[]')
      return { items: fieldData[0] || [], defaultValue: fieldData[1]?.default }
    } catch (error) {
      console.error('error', error)
      return { items: [], defaultValue: '' }
    }
  }, [value])

  const [inputVisible, setInputVisible] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const onRemove = (val: string) => {
    const nextItems = items.filter((v) => v !== val)
    const nextDefaultValue = nextItems.includes(defaultValue) ? defaultValue : ''
    const newValue: AppScope.FieldDataParsed = [nextItems, { default: nextDefaultValue }]
    setValue(JSON.stringify(newValue))
  }

  const onAdd = () => {
    if (inputValue.trim()) {
      const nextItems = [...items, inputValue]
      const nextDefaultValue = defaultValue || inputValue
      const newValue: AppScope.FieldDataParsed = [nextItems, { default: nextDefaultValue }]
      setValue(JSON.stringify(newValue))
    }

    setInputVisible(false)
    setInputValue('')
  }

  return (
    <>
      <p>
        {items.map((v) => (
          <span key={v} className='mr-2 mb-2 inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1'>
            <span className='text-md'>{v}</span>
            <CloseOutlined className='opacity-50 transition-all hover:opacity-100' onClick={() => onRemove(v)} />
          </span>
        ))}
      </p>

      <p className='w-40'>
        {inputVisible ? (
          <Input
            autoFocus
            placeholder='请输入选项'
            maxLength={20}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onBlur={() => onAdd()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onAdd()
              }
            }}
          />
        ) : (
          <Button onClick={() => setInputVisible(true)}>添加选项</Button>
        )}
      </p>
    </>
  )
}

function FieldDefaultValue(props: {
  config: AppScope.NodeInfoConfig
  value?: string
  onChange?: (newVal: string) => void
}) {
  const [value, setValue] = useControllableValue<string>(props)
  // 选项配置
  const options = useMemo(() => {
    let fieldDataParsed: AppScope.FieldDataParsed = [[], { default: '' }]
    if (props.config.fieldData) {
      try {
        fieldDataParsed = JSON.parse(props.config.fieldData) as AppScope.FieldDataParsed
      } catch (e) {
        console.error(`参数 ${props.config.fieldName} 的 fieldData 配置解析失败: ${e}`)
      }
    }
    return fieldDataParsed[0].map((item) => ({ label: item, value: item }))
  }, [props.config])

  if (props.config.fieldType === 'text') {
    return <Input.TextArea rows={3} value={value} onChange={(e) => setValue(e.target.value)} />
  }

  if (props.config.fieldType === 'integer') {
    return (
      <InputNumber
        className='w-40! border'
        placeholder='请输入'
        type='number'
        step={1}
        value={value}
        onChange={(val) => setValue(String(Number.parseInt(val || '0')))}
      />
    )
  }

  if (props.config.fieldType === 'float') {
    return (
      <InputNumber
        className='w-40! border'
        placeholder='请输入'
        type='number'
        step={1}
        value={value}
        onChange={(val) => setValue(String(Number.parseFloat(val || '0')))}
      />
    )
  }

  if (props.config.fieldType === 'select') {
    return <Select options={options} className='w-40' placeholder='请选择' value={value} onChange={setValue} />
  }

  return <Input value={value} onChange={(e) => setValue(e.target.value)} allowClear />
}
