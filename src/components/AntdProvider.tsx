'use client'

import { AntdRegistry } from '@ant-design/nextjs-registry'
import { App, ConfigProvider } from 'antd'
import { PropsWithChildren } from 'react'

export default function AntdProvider(props: PropsWithChildren) {
  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: '#1677ff',
            colorLink: '#1677ff',
            borderRadius: 2,
          },
        }}
      >
        <App>{props.children}</App>
      </ConfigProvider>
    </AntdRegistry>
  )
}
