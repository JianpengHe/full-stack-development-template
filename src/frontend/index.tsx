import React from 'react'
import ReactDOM from 'react-dom'
import 'antd/dist/antd.css'
import zhCN from 'antd/lib/locale-provider/zh_CN'
import { ConfigProvider, Layout } from 'antd'
import MainMenu from './MainMenu'
import MainPage from './MainPage'
ReactDOM.render(
  <ConfigProvider locale={zhCN}>
    <Layout>
      <MainMenu />
      <MainPage />
    </Layout>
  </ConfigProvider>,
  document.getElementById('root')
)

if (module && module.hot) {
  module.hot.accept()
}
