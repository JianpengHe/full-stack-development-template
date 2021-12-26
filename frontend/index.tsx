import React from 'react'
import ReactDOM from 'react-dom'
import App from './app'
import 'antd/dist/antd.css'
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)

if (module && module.hot) {
  module.hot.accept()
}
