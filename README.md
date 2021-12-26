# full-stack-development-template

一个 基于React-TypeScript-Webpack-Antd（前端）和TypeScript-Node.js（后端）的 全栈开发 的模板，后端内置web、ws、db等常用模块

# 第一次使用

克隆仓库：`git clone https://github.com/JianpengHe/full-stack-development-template.git`

切换目录：`cd full-stack-development-template`

安装依赖：`yarn`

# 日常使用

打开vscode，按下面顺序（不能错）

1、顶部菜单栏“终端”→运行任务→启用tsc监视（【后端】打开node.js实时编译ts）

2、按F5（【后端】运行编译后的js）

3、打开“package.json”，点击scripts上方的“调试”，选择dev（【前端】）

# 发布&&部署

1、运行 `yarn build`

2、拷贝dist文件夹到你喜欢的地方

3.命令行切换到`dist/server`目录，运行`node index.js`

ps:map文件部署时可以删除
