'use client'

import { uploadFile } from '@/actions/rh'
import { useControllableValue } from 'ahooks'
import { useState } from 'react'

// 工作流参数节点配置项
export default function NodeFormItem(props: {
  config: AppScope.NodeInfoConfig
  value?: any
  onChange?: (newValue: any) => void
}) {
  const [value, setValue] = useControllableValue(props)
  const [loading, setLoading] = useState(false)

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

  if (props.config.fieldType === 'image') {
    return (
      <>
        <p>{value}</p>
        <input
          type='file'
          accept='image/*'
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) {
              onUploadToRH(file)
            }
          }}
        />
      </>
    )
  }

  if (props.config.fieldType === 'video') {
    return (
      <input
        type='file'
        accept='video/*'
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            onUploadToRH(file)
          }
        }}
      />
    )
  }

  return null
}
