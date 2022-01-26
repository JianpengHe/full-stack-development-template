import React from 'react'
import { Modal, Form, Input } from 'antd'
import { PG } from '../typings/api'
import { useBoolean, useRequest } from 'ahooks'

const Login: React.FC<any> = () => {
  const [visible, { set: setVisible }] = useBoolean(false)
  const { data: accountInfo } = useRequest(() => PG.GetAccountInfo.request({}), {
    onSuccess({ userId }) {
      setVisible(!Boolean(userId))
    },
  })
  const { data: obj, run } = useRequest(PG.PostAccountLogin.request, { manual: true })
  const [form] = Form.useForm()
  return (
    <Modal
      title="登录"
      closable={false}
      visible={visible}
      onOk={() => form.submit()}
      onCancel={() => setVisible(false)}
    >
      <Form form={form} onFinish={body => run({ body })}>
        <Form.Item
          label="账号"
          required
          name="user"
          colon
          rules={[
            {
              required: true,
            },
            {
              pattern: /^\S(|.*\S)$/,
              message: '账号不可能以空格开头或结尾',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="密码"
          required
          name="pwd"
          colon
          rules={[
            {
              required: true,
            },
            ({ getFieldValue }) => ({
              validator(_, value: string) {
                if (Number(value) > 0) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('相信我，你的密码只有数字'))
              },
            }),
          ]}
        >
          <Input type="password" />
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default Login
