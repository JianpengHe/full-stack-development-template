import React from 'react'
import { Layout, Button } from 'antd'
import { PG } from './typings/api'
import { useRequest } from 'ahooks'
import Login from './account/login'
const { Header, Content, Footer } = Layout

const MainPage: React.FC<any> = () => {
  const { data, run, loading } = useRequest(PG.GetTestHelloWorldById.request, { manual: true })
  // const { data: obj, run: runPost } = useRequest(PG.PostTestPostFromData.request, { manual: true })
  const { data: obj, run: runPost } = useRequest(PG.PostTestPostJsonData.request, { manual: true })
  console.log(obj)
  return (
    <Layout style={{ marginLeft: 200 }}>
      <Header style={{ padding: 0 }} />
      <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
        <Button
          loading={loading}
          type="primary"
          onClick={() => {
            run({ query: { id: String(Math.random()) } })
          }}
        >
          {data?.id || '点我试试'}
        </Button>
        <Button
          loading={loading}
          type="primary"
          onClick={() => {
            runPost({ query: { id: String(Math.random()) }, body: { age: Math.random(), name: 'abc' } })
          }}
        >
          {data?.id || 'POST'}
        </Button>
        <div style={{ padding: 24, textAlign: 'center' }}>
          ...
          <br />
          Really
          <br />
          ...
          <br />
          ...
          <br />
          long
          {Array(50)
            .fill(0)
            .map((_, index) => (
              <span key={index}>
                ...
                <br />
              </span>
            ))}
          ...
          <br />
          content
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>Ant Design ©2018 Created by Ant UED</Footer>
      <Login />
    </Layout>
  )
}

export default MainPage
