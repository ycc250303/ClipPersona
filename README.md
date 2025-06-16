# 同济大学2025用户交互技术课程项目

## 1 项目名称

ClipNova：一键成片、AI 智能剪辑，引领高效视频创作新体验。

## 2 成员分工

| 姓名   | 学号    | 分工                         | 工作量 |
| ------ | ------- | ---------------------------- | ------ |
| 尹诚诚 | 2351279 | 框架搭建、技术开发、文档撰写 |        |
| 吴瑞翔 | 2351716 | 技术开发                     |        |
| 郑耀辉 |         | 技术开发、文档撰写           |        |
| 郑功灿 |         | 文档撰写                     |        |

## 3 项目组成

* `/assets`存放`readme.md`和`ClipNova_Documentation.md`文档所需的相关图片资源
* `/ClipNova` 项目源代码
  * `/App` 项目前端代码文件
  * `/Backend` 项目后端代码文件
  * `/Images` 项目资源文件
  * `/Models` 项目所需的模型文件
  * `App.tsx` 项目启动程序
* `ClipNova_Documentation.md` 项目文档

## 4 项目配置

### 4.1 前端环境配置

1. 安装**Node.js**（ Node 的版本应大于等于 18）
2. 安装**Java SE Development Kit (JDK)**
3. 安装**Android Studio**，并搭建相关开发环境
4. 创建**React Native**项目，注意项目路径不要有在我

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

