# full-stack-development-template

一个 基于React-TypeScript-Webpack-Antd（前端）和TypeScript-Node.js（后端）的 全栈开发 的模板，后端内置web、ws、db等常用模块

# 第一次使用

1、克隆仓库：`git clone https://github.com/JianpengHe/full-stack-development-template.git`

(若网络较慢可以试试`git clone https://gitee.com/jianpenghe/full-stack-development-template.git`)

2、切换目录：`cd full-stack-development-template`

3、安装依赖：`yarn`

4、配置`pont-info.json`接口定义的配置文件，key为名字，value为接口定义来源（可以是本地文件或http地址）

# 日常使用

打开vscode，顶部菜单栏“终端”→运行任务：

1、启动 `【后端】启用tsc监视` 任务（【后端】编译typescript）

2、按 `F5` 快捷键（【后端】运行编译后的js）

3、启动 `【前端】启动开发环境` 任务（【前端】）

4、若需要更新接口定义，运行`生成接口定义`任务

# 发布&&部署

1、运行 `yarn build` 或运行 `打包构建前后端` 任务

2、拷贝dist文件夹到你喜欢的地方

3.命令行切换到`dist/server`目录，运行`node index.js`

ps:map文件部署时可以删除

# 更舒服的使用

1、鉴于国情，该仓库开启了gitee同步，可以考虑使用gitee的地址，但可能存在同步延迟，请以GitHub上为准

2、vscode推荐安装`TSLint`和`Prettier`，方便检查代码和代码格式化

安装完成后打开任意ts文件，按快捷键`ctrl`+`shift`+`P`，输入`tslint.manageWorkspaceLibraryExecution`，选择第一个`Enable XXX`即可启用TSLint

# 2.0.1更新
1.支持自动生成接口定义（前端还没写完）
2.修复若干bug
