# full-stack-development-template

一个 基于React-TypeScript-Webpack-Antd（前端）和TypeScript-Node.js（后端）的 全栈开发 的模板，后端内置web、ws、db等常用模块

# 如何使用

克隆仓库：`git clone https://github.com/JianpengHe/full-stack-development-template.git`
切换目录：`cd full-stack-development-template`
安装依赖：`yarn`

打开vscode，按下面顺序来
1、顶部菜单栏“终端”→运行任务→tsc:监视（【后端】打开node.js实时编译ts）
2、按F5（【后端】运行编译后的js）
3、打开“package.json”，点击scripts上方的“调试”，选择dev（【前端】）

PS:若想发布，请运行 `yarn build`，然后拷贝dist文件夹即可