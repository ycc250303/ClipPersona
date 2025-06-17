# 同济大学2025用户交互技术课程项目

## 相关项目

* [2025同济大学用户交互技术课程作业](https://github.com/ycc250303/Human_Computer_Interface_Assignments)

## 1 项目名称

ClipNova：一键成片、AI 智能剪辑，引领高效视频创作新体验。

## 2 成员分工

| 姓名   | 学号    | 分工                         | 工作量 |
| ------ | ------- | ---------------------------- | ------ |
| 尹诚诚 | 2351279 | 框架搭建、技术开发、文档撰写 | 28%    |
| 吴瑞翔 | 2351716 | 技术开发                     | 28%    |
| 郑耀辉 | 2352037 | 文档撰写、PPT制作            | 22%    |
| 郑功灿 | 2356215 | 技术开发、文档撰写           | 22%    |

## 3 项目组成

* `/assets`存放`readme.md`和`ClipNova_Documentation.md`文档所需的相关图片资源
* `/ClipNova` 项目源代码
  * `/App` 项目前端代码文件
  * `/Backend` 项目后端代码文件
  * `/Images` 项目资源文件
  * `App.tsx` 引用程序入口组件
  * `package.json`: 项目依赖管理和脚本配置
  * `package-lock.json`: 锁定依赖包版本的文件
  * `tsconfig.json`: TypeScript编译配置
  * `app.json`: React Native应用的基本配置
  * `.prettierrc.js`: 代码格式化工具Prettier的配置
  * `.eslintrc.js`: JavaScript代码检查工具ESLint的配置
  * `.watchmanconfig`: Watchman文件监控工具配置
  * `jest.config.js`: 单元测试框架Jest的配置
  * `metro.config.js`: React Native打包工具Metro的配置
  * `babel.config.js`: JavaScript编译器Babel的配置
* `ClipNova_Documentation.md` 项目文档

注：项目源文件夹还有`/node_modules`和`/Android`以及目标消除所用的模型，但因占用空间过大，故未上传至git

## 4 项目配置

### 4.1 前端环境配置

1. 安装**Node.js**（ Node 的版本应大于等于 18）
2. 安装**Java SE Development Kit (JDK)**
3. 安装**Android Studio**，并搭建相关开发环境
4. 创建**React Native**项目，注意项目路径**不要有中文**

```bash
npx react-native@latest init your_project_name
```

5. 将`ClipNova`文件夹移动到`your_project_name`内

```bash
npm install
yarn android
```

### 4.2 后端环境配置

1. 安装`Anaconda`
2. 创建虚拟环境

```bash
conda create -n hci python=3.11 -y
conda create -n remove_tools python=3.9 -y
```

3. 安装`CUDA`和`cuDnn`驱动

4. 安装`Python`依赖包

* **hci**环境要求：
  * `python>=3.10`
  * `pytorch>=2.5.1`
  * `cuda>=11.7`

```bash
conda activate hci
pip install retrying 
pip install "moviepy<2" 
pip install psutil 
pip install flask 
pip install flask_cors 
pip install netifaces 
pip install openai 
pip install opencv-python 
# 请根据系统cuda情况选择合适的pytorch版本
git clone https://github.com/facebookresearch/sam2.git && cd sam2
pip install -e .
pip install torch==2.5.1 torchvision==0.20.1 torchaudio==2.5.1 --index-url https://download.pytorch.org/whl/cu121 
```

* **remove_tools**环境要求
  * `python>=3.7` 
  * `pytohn<=3.9`
  * `torch>=1.5`
  * `cuda>=9.2`
  * `mmcv-full`

```bash
pip install opencv-python
# 请根据系统cuda情况选择合适的pytorch版本
pip install torch==2.3.1 torchvision==0.18.1 torchaudio==2.3.1 --index-url https://download.pytorch.org/whl/cu118
pip install -U openmim
mim install mmcv
```

### 4.3 API替换与服务器配置

1. 申请蓝心大模型和通义千问模型的API_KEY，将`ClipNova\Backend\nlp_parser.py`和`ClipNova\Backend\video_comprehension.py`中的api_key替换为自己的api_key
2. 将`/Backend`文件夹上传至服务器，在服务器中执行步骤**4.2**
3. 在服务器中执行以下命令
   
```bash
conda activate hci
# 切换到Backend目录
cd <path_to_your_Backend>
python api_server.py
```

4. 获取服务器ip，并将`ClipNova\App\EditMediaScreen.tsx`中的32行`API_CONFIG`内的ip替换为服务器ip（消除功能需要GPU配置）
