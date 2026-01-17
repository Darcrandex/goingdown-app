'use client'
import { uploadFile } from '@/actions/rh'
import { addTask, checkQueuedTask, getTaskById } from '@/actions/task'
import { getWebappById } from '@/actions/webapp'
import { TaskStatus } from '@/db/schema/task'
import { useUserInfo } from '@/query/useUserInfo'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useControllableValue } from 'ahooks'
import { App, Button, Form, Input, InputNumber, Select, Spin } from 'antd'
import { saveAs } from 'file-saver'
import { useParams } from 'next/navigation'
import { Fragment, useEffect, useMemo, useRef, useState } from 'react'

export default function WebappDetail() {
  const { message } = App.useApp()
  const { id } = useParams<{ id: string }>()
  const { data } = useQuery({
    queryKey: ['webapp', id],
    queryFn: () => getWebappById(id),
  })

  // 参数表单
  const [form] = Form.useForm()

  useEffect(() => {
    if (Array.isArray(data?.nodeInfoList)) {
      form.setFieldsValue({ nodeInfoList: data.nodeInfoList })
    }
  }, [data, form])

  // 任务运行
  const userInfoQuery = useUserInfo()
  const [taskId, setTaskId] = useState('')
  const [isDone, setIsDone] = useState(false)

  const runMutation = useMutation({
    mutationFn: async () => {
      const values = await form.validateFields()

      if (!userInfoQuery.data?.id) {
        throw new Error('请先登录')
      }

      const canRun = await checkQueuedTask()
      if (!canRun) {
        throw new Error('有任务正在排队中，请稍后重试')
      }

      const nodeInfoList = (values?.nodeInfoList || []) as AppScope.NodeInfo[]
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
    queryKey: ['getTaskById', taskId],
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
      <section className='mx-auto flex w-4xl'>
        <div className='w-1/2 p-4'>
          <h1 className='text-2xl font-bold'>{data?.name}</h1>
          <p className='mb-4'>{data?.description}</p>

          <Form form={form} layout='vertical' onFinish={runMutation.mutate}>
            <Form.List name='nodeInfoList'>
              {(fields) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Fragment key={key}>
                      <Form.Item {...restField} name={[name, 'nodeId']} hidden>
                        <input disabled />
                      </Form.Item>

                      <Form.Item {...restField} name={[name, 'fieldName']} hidden>
                        <input disabled />
                      </Form.Item>

                      <Form.Item
                        shouldUpdate
                        {...restField}
                        name={[name, 'fieldValue']}
                        rules={[{ required: true, message: '值不能为空' }]}
                      >
                        <FieldValueItem config={form.getFieldValue(['nodeInfoList', name])} />
                      </Form.Item>
                    </Fragment>
                  ))}
                </>
              )}
            </Form.List>

            <footer className='mt-4'>
              <Button
                type='primary'
                htmlType='submit'
                loading={runMutation.isPending}
                disabled={
                  taskDetailQuery.data?.status === TaskStatus.QUEUED ||
                  taskDetailQuery.data?.status === TaskStatus.RUNNING
                }
              >
                运行
              </Button>
            </footer>
          </Form>
        </div>

        <div className='w-1/2 p-4'>
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
        </div>
      </section>
    </>
  )
}

function FieldValueItem(props: {
  config: AppScope.NodeInfoConfig
  value?: string
  onChange?: (newVal?: string) => void
}) {
  const [value, setValue] = useControllableValue<string>(props)
  const [loading, setLoading] = useState(false)

  // 图片预览URL
  const [previewImageUrl, setPreviewImageUrl] = useState<string>()

  // 视频预览
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const handleVideoFile = (file: File) => {
    const video = videoRef.current
    if (!video) return

    const videoUrl = URL.createObjectURL(file)
    video.src = videoUrl
    video.onloadeddata = () => {
      // 释放视频临时 URL
      URL.revokeObjectURL(videoUrl)
    }

    // 视频加载失败处理
    video.onerror = () => {
      alert('视频文件加载失败，请选择有效的视频文件！')
      URL.revokeObjectURL(videoUrl)
    }
  }

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

  // 上传文件到RH
  const onUploadToRH = async (file: File) => {
    try {
      setLoading(true)
      const res = await uploadFile(file)
      if (res.code === 0 && res.data.fileName) {
        setValue(res.data.fileName)
      }
    } catch (error) {
      console.error('上传文件失败', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <h2 className='mb-2 font-bold'>{props.config.description}</h2>

      {props.config.fieldType === 'image' && (
        <Spin spinning={loading}>
          <label className='relative block h-20 w-20 cursor-pointer overflow-hidden rounded-md bg-gray-200'>
            {previewImageUrl && <img src={previewImageUrl} alt='预览' className='h-20 w-20 object-cover' />}

            <input
              hidden
              type='file'
              accept='image/*'
              disabled={loading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  setPreviewImageUrl(URL.createObjectURL(file))
                  onUploadToRH(file)
                }
              }}
            />
          </label>
        </Spin>
      )}

      {props.config.fieldType === 'video' && (
        <Spin spinning={loading}>
          <label className='relative block h-20 w-20 cursor-pointer overflow-hidden rounded-md bg-gray-200'>
            <video ref={videoRef} className='h-full w-full object-cover' />

            <input
              hidden
              type='file'
              accept='video/*'
              disabled={loading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleVideoFile(file)
                  onUploadToRH(file)
                }
              }}
            />
          </label>
        </Spin>
      )}

      {props.config.fieldType === 'text' && (
        <Input.TextArea
          className='w-80 border'
          placeholder='请输入'
          rows={4}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      )}

      {props.config.fieldType === 'integer' && (
        <InputNumber
          className='w-40! border'
          placeholder='请输入'
          type='number'
          step={1}
          value={value}
          onChange={(val) => setValue(String(Number.parseInt(val || '0')))}
        />
      )}

      {props.config.fieldType === 'float' && (
        <InputNumber
          className='w-40! border'
          placeholder='请输入'
          type='number'
          step={0.1}
          value={value}
          onChange={(val) => setValue(String(Number.parseFloat(val || '0')))}
        />
      )}

      {props.config.fieldType === 'select' && (
        <Select options={options} className='w-40' placeholder='请选择' value={value} onChange={setValue} />
      )}
    </>
  )
}
