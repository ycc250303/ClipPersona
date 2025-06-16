# ClipNova Documentation

> ClipNova: One-click video production and AI intelligent editing lead to a new experience of efficient video creation.
>
> <img src="assets/logo.jpg" width="200">

## 1 Project Overview

### 1.1 Project Background

#### 1.1.1 Social Background

With the rise of short video platforms (such as Douyin, Kuaishou, YouTube Shorts, Xiaohongshu, etc.), video content creation has entered an unprecedented growth period.
A large number of content creators, corporate marketing teams, and educational institutions are continuously producing video content, but traditional video editing processes still have many pain points:

1. **High creative threshold**: Traditional editing software (such as Premiere, Final Cut) is complex to operate, requiring ordinary users to spend a lot of time learning;
2. **Prominent efficiency bottlenecks**: Self-media workers need to update videos daily, but editing takes up more than 70% of the entire process, severely limiting output capacity;
3. **Low production efficiency**: The pace of content updates is fast, but editing speed cannot keep up.

Against the backdrop of the rapid development of AIGC (Artificial Intelligence Generated Content), AI has gradually become an important tool for improving creative efficiency and content quality.
ClipNova was born in this context, aiming to empower video creation with AI technology, simplify operational processes, and improve content generation efficiency.


### 1.2 Project Objectives

The goal of ClipNova is to build an intelligent editing platform integrating automatic editing, intelligent understanding, creative generation, and personalized configuration. Specific objectives include:

1. **Provide semantic-level editing**: Understand video content based on multimodal models and intelligently generate logically coherent segments.
2. **Lower the creative threshold**: Allow non-professional users to obtain high-quality output through one-click editing.
3. **Support personalized styles**: Adapt to different creative styles and needs, supporting fine-tuning and template customization.
4. **Build open interfaces**: Provide enterprises and creators with batch editing and content management capabilities.

## 2 Market Analysis

### 2.1 Market Background and Industry Pain Points

1. **Content production explosion**: The rise of short video platforms such as Douyin, Kuaishou, Bilibili, and Xiaohongshu has made content production capacity a core competitiveness;
2. **Editing is time-consuming and labor-intensive**: Traditional video editing cycles are long and have high thresholds, which is not conducive to high-frequency content output;
3. **Increased pressure on creators**: Most creators need to handle shooting, editing, and operations, creating enormous content update pressure;
4. **Existing tools lack intelligence**: Most editing tools remain at the tool-attribute stage, lacking semantic analysis and creative support.



### 2.2 Market Demand and Potential

**Short video daily active users exceed 1 billion, with annual content output exceeding 10 billion pieces**, and the demand for efficient editing tools continues to grow;
**Vertical industries such as enterprise branding, education and training, and live streaming** also have higher requirements for short video content quality;
It is estimated that by **2027, the global smart video editing market size will exceed $18 billion**, and AI editing tools are expected to become the next content infrastructure.


### 2.3 Competitive Analysis

#### 2.3.1 Competitive Environment

Some video creation software that already occupy a leading position in the market, such as Jianying, Runway, and Descript, often have a larger user base and offer rich creative templates and comprehensive editing tools.

![](assets/Competitor.png)

#### 2.3.2 Competitor Analysis

1. **Jianying**: A national-level editing tool produced by ByteDance, adapted to the Douyin ecosystem. The following is an analysis of its advantages and disadvantages:
   * **Advantages**:
     * Deep integration with Douyin, strong content adaptation
     * Rich templates and diverse styles, suitable for quick video output
     * Low operation threshold, supports cloud collaboration
   * **Disadvantages**:
     * Mainly relies on manual operation, lacks semantic understanding and intelligent editing
     * Limited personalized customization, unsuitable for complex editing
     * Cross-platform ecosystem is not open enough (tied to ByteDance system)
     
2. **Runway**: An AI video generation and editing platform, focusing on creative generation and video effects.
   * **Advantages**:
     * Supports cutting-edge features such as text-to-video (Gen-2)
     * Good special effects synthesis and multimodal model support
     * Aimed at the creative industry, with strong international influence
   * **Disadvantages:**：
     * More focused on "generation" rather than editing
     * Not suitable for large-scale batch content processing
     * nsufficient support for Chinese semantics, steep learning curve
     
3. **Descript**: An integrated tool for audio and video text editing, highlighting "script-based editing"
   * **Advantages**:
     * Allows video editing through subtitle editing
     * Suitable for producing interviews and podcast-type content
     * Offers automatic transcription and voice cloning functions
   * **Disadvantages**:
     * Weak support for rhythm-based video editing
     * Video editing functions are relatively basic, not suitable for heavy creators
     * UI and logic are more oriented toward English podcast content

## 3 Requirement Analysis

### 3.1 Role Definition

| Photo | ![](assets/Mary.jpg) | ![](assets/Sophia.v2) | ![](assets/Linda.jpg) |
| :---: | :---: | :---: | :---: |
| Name | Mary | Sophia | Linda |
| Age | 24 | 39 | 44 |
| Status | Individual creators | Educators | Enterprise teams |
| Description | Shoot materials, express creativity, and focus on video quality and efficiency | Produce explanatory videos and course summaries, emphasizing information accuracy and rhythm | The marketing department or brand side of an enterprise, producing product promotional videos or course content |
| Demand | Automated editing, strong rhythm, rich templates, and easy to use | Automatic chapter generation, subtitle alignment, and adaptation to multi-platform distribution | Marketing-oriented editing, script-driven, accurate subtitles, and meeting commercial release standards |

### 3.2 Target User Analysis

| User Type         | User Characteristics             | Core Demands                 |
| ------------ | ---------------- | -------------------- |
| **Novice Users**     | No professional editing foundation, focusing on simplicity and efficiency  | One-click generation, foolproof operation, and templated output     |
| **Intermediate Users**     | Have certain editing experience, focusing on effects and tonality | Manual fine-tuning, style selection, and rhythm control      |
| **High-frequency Content Output Users** | Content factory type, pursuing batch and rapid production  | Automatic processing, format standardization, and material management      |
| **Visual Content Professional Users** | Pay attention to shot language and picture logic      | Multimodal semantic editing, rhythm and transition control, and creative support |
| **Non-native Users**    | The content is targeted at a multi-language user group      | Multi-language subtitle generation, automatic translation, and voice emotion preservation  |


### 3.3 Application Scenario Analysis

| Application Scenario           | Main Applicable Environment              | Demand Characteristics                 |
| -------------- | ------------------- | -------------------- |
| **Short Video Content Creation**    | Douyin, Kuaishou, Xiaohongshu, Instagram | Short, flat, and fast editing, eye-catching visual effects, and precise rhythm matching  |
| **E-commerce/Marketing Promotional Video Production** | 产Product introductions, brand shorts, promotional videos      | Clear logic, copywriting embedding, subtitle standardization, and strong commercial sense |
| **Online Education/Knowledge-based Videos** | Teaching videos, course summaries, knowledge point editing     | Automatic chapter division, synchronized subtitles, and clear picture switching   |
| **Podcast/Interview Content Packaging**  | Voice-to-video conversion, meeting reviews, content summaries     | Audio-led, subtitle generation, and graphic and text mixed editing     |
| **Material Organization and Batch Output**  | Studios, MCNs, self-media groups       | Template invocation, batch import/export, and unified style   |
| **Meeting/Live Content Processing**  | Internal summaries, review video generation         | Efficient review generation, key point extraction, and concise editing   |


## 4 Low-fidelity Prototype Design

### 4.1 Functional Process Design

#### 4.1.1 Home Page Function Area
**Function Overview**:

The home page displays the user's historically edited videos, facilitating management and quick access to the editing process.

**Core Functions**:
1. **Historical Editing Browsing**: Display edited videos in card or list form, with each video accompanied by a timestamp and thumbnail for easy differentiation and review.

2. **Video Operation Entrance**:
    * **Continue Editing**: Click to jump to the editing interface and continue modifying the current video.
    * **Delete Video**: Provide a delete button. Clicking it will pop up a confirmation prompt to prevent accidental deletion.

#### 4.1.2 Video Editing Area
**Function Overview**:

The video editing area is the main place for users to interact with AI. By importing videos and inputting requirements, rapid editing can be achieved.

**Core Functions**:
1. **Video Import**:
    * Select local video files.
    * Call the system camera to record new videos.
2. **Video Confirmation**:
    * Provide a preview function.
    * Display "Re-select" and "Confirm" buttons.
3. **Requirement Input Methods**:
    * **Voice Input**: Call the microphone for voice recognition.
    * **Text Input**: Users input requirements through the keyboard.
4. **AI Editing Processing**:
    * The system receives requirements and calls the model for processing.
    * Return the edited video for user preview.
5. **Subsequent Operations**:
    * Continue Editing: Enter the next round of input.
    * Complete Editing: Save the video and return to the home page.

#### 4.1.3 User Settings Area

**Function Overview**:

Provide users with account personalization settings and basic profile management functions.

**Core Functions**:
1. **Account Information Management**:
    * Modify the user nickname.
    * Change the avatar.
    * Switch the application language (multi-language support).

### 4.2 Key Task Execution Path

1. **Enter the Home Page**:
   * **Interface**: Display different edited videos.
   * **Operation**: Slide the screen to browse all video thumbnails.
2. **Select the Video to be Edited**：
   * **Continue Editing**: If you want to edit a video that was half-edited yesterday, click the corresponding video on the home page.
   * **New Editing**: If you want to edit a new video, upload a new video in the "Editing" section.
3. **Enter the Editing Interface**:
   * **Interface**: Display different input methods (voice input or typing input).
   * **Operation**: Select an input method and enter requirements.
4. **Interactive Operation (Taking Doubling the Video Speed as an Example)**:
   * **Voice Operation**: Click the microphone and state your editing requirement: Double the video speed.
   * **Typing Operation**: Click the text box and input your editing requirement: Double the video speed.
   * **Feedback**: After inputting, the screen shows that processing is in progress.
5. **Complete Editing and Return**:
   * **Operation**: After the video is successfully processed, the user can choose to continue editing or export, or re-edit the draft video on the home page.
6. **Exit the Application**:
   * **Operation**: You can click the "Exit" button at the top of any page at any time to exit the application.

## 5 High-fidelity Prototype Design

A high-fidelity prototype (Hi-Fi Prototype) aims to simulate the real interaction and visual experience of the final product, helping the development team clarify the functional implementation path, assisting in user testing and feedback collection, and improving the verification efficiency before product launch.

### 5.1 Interaction Design Concept

ClipNova's interaction design follows the following concepts:
* **User-centered**: The interface layout and interaction logic are close to user usage habits, enhancing operational intuition.
* **Task-oriented driving**: Centered around the "editing goal", each operation serves the completion of the task.
* **Intelligent prompt feedback**: The AI processing results and system status are feedback in real-time to ensure users have overall control.
* **Multimodal fusion experience**: Support dual-channel input of voice and text, enhancing flexibility and accessibility.

### 5.2 Interaction Design Features

1. **Card-style management home page**: Historically edited videos are arranged in card form, combined with thumbnails and timestamps, to intuitively display content status.
2. **Immersive editing experience**: The editing interface focuses on the content itself, hiding redundant controls and highlighting the input and output paths.
3. **Seamless switching between multiple input methods**: Voice and text inputs are presented side by side and can be switched in real-time without interrupting the task flow.
4. **Instant preview and editing rollback**: The video output by AI can be previewed with one click, supporting continued editing or reverting to the original state.
5. **Animation and motion effects guide operations**: Motion effect feedback is introduced at key interaction nodes to improve operational understanding and the sense of system warmth.

### 5.3 Interaction Design Advantages

1. **Easy to get started**: Non-professional users can complete editing tasks with zero learning cost.
2. **Fewer operations**: The average number of operations for core tasks is less than 5 steps.
3. **Fast feedback**: Progress prompts or interaction feedback are provided for voice recognition, editing rendering, and interface switching.
4. **Clear path**: Key functions (such as "Continue Editing", "Export", "Return to Home") are in fixed positions and easy to remember.
5. **High consistency**: The page style and control interactions remain consistent, reducing the cognitive burden.

### 5.4 High-fidelity Prototype Design

#### 5.4.1 Home Page Prototype Diagram

* Top navigation bar (including Logo, user avatar, editing button)
* Video card list (including thumbnail, title, creation time, operation buttons)
* Bottom page switching bar (including new editing entry button, settings entry button)

<img src="assets/home.jpg" width="200" alt="Home">
<img src="assets/delete_vedio.jpg" width="200">

#### 5.4.2 Video Editing Area Prototype Diagram
* **Import Stage Interface**:

  * The video upload/shooting area is at the bottom.
  * The video preview window is at the top.


<img src="assets/method.jpg" width="200">

* **Confirm Video Interface**:
  * The video thumbnail is in the middle.
  * You can enter the editing interface on the lower left and reselect on the lower right.

<img src="assets/confirm_vedio.jpg" width="200">

* **Editing Input Stage Interface**:

  * You can return to the confirm video interface or export the video at the top.
  * The video thumbnail is at the top of the main interface.
  * The dialog box at the bottom of the main interface provides input method switching (voice/text).

Text input:

<img src="assets/word.jpg" width="200">

Voice input:

<img src="assets/audio.jpg" width="200">

* **AI Processing Stage**:
  * The video dims, and the text "Processing..." is displayed.
  * Prompt the user to wait patiently.

<img src="assets/TODO.jpg" width="200">

#### 5.4.3 Editing Result and Secondary Operation Interface
**Content Preview Area**:
  * The player supports fast forward, pause, and frame capture.
  * You can choose to "Continue Editing" or "One-click Export".

<img src="assets/TODO.jpg" width="200">

#### 5.4.4 User Settings Interface Prototype Diagram
**Information Management Interface**:

  * Display the user avatar, nickname, and language options.
  * Provide controls for "Change Nickname", "Modify Avatar", and "Language Switch".
  * A help button is provided at the bottom.

<img src="assets/settings.jpg" width="200">
<img src="assets/help.jpg" width="200">
<img src="assets/profile_picture.jpg" width="200">

After switching the language, some pages are shown as follows:

<img src="assets/method_es.jpg" width="200">
<img src="assets/settings_es.jpg" width="200">

## 6 Technology Selection and Implementation


### 6.1 Technology Selection

#### 6.1.1  Model and Algorithm Selection
| Technology Module    | Selection                               | Reason                                                                                |
| ------- | -------------------------------- | --------------------------------------------------------------------------------- |
| Multimodal Semantic Understanding | **Qwen-VL**    | Qwen-VL provides powerful graphic and text semantic parsing capabilities, suitable for complex instruction understanding and video description generation |
| Speech Recognition    | **Whisper**                      | Supports multi-language and multi-accent recognition, with high robustness, suitable for long audio editing and subtitle generation, improving the processing ability of voice-over videos                                        |
| Video Completion and Generation | **E2FGVI** | E2FGVI supports target removal and natural background completion, improving picture coherence          |
| Object Detection and Segmentation	 | **SAM2**             | SAM2 provides pixel-level segmentation, facilitating complex mask generation and post-processing                                    |


### 6.1.2 Front-end and Cross-platform Development Selection
| Component      | Technology Selection                                       |Reason                                                                 |
| ------- | ------------------------------------------ | ------------------------------------------------------------------ |
| Mobile Framework	   | **React Native**                           | Cross-platform development with a unified code base, shortening the launch cycle. Combined with Flexbox layout and React Navigation, it provides good UI adaptation and user experience |
| IDE and Packaging | **Android Studio + Xcode + Metro Bundler** | Supports native Android compilation. Combined with React Native's rapid debugging and hot update mechanism, it improves development efficiency.             |

### 6.1.3 UI and Collaboration Tool Selection
| Tool            |Reason                                                        |
| ------------- | --------------------------------------------------------- |
| **Pixso**     | Supports UI prototype design, component reuse, and real-time collaboration, helping the team unify style cards, editing modules, and user instruction interface design; optimizing the design and development collaboration process. |

## 7 Project Outlook

Facing the rapidly developing content creation market and diverse user needs, ClipNova has established a highly agile R & D system to ensure continuous updates of the product in terms of technology and user experience.

### 7.1 Technology Iteration and Intelligent Enhancement

- Introduce a new generation of multimodal models (such as GPT - 4V, Qwen - VL - Max) to improve semantic understanding and style generation capabilities.
- Optimize local deployment performance to support more complex editing tasks on the edge side.
- Build a semantic-driven editing strategy engine to achieve a barrier-free creative experience of "say a word, edit a video".

### 7.2 Diverse Function Expansion

- Implement the one-click creation function of generating a complete short video by inputting text.
- Introduce an AI director module to assist in content narrative logic construction and shot design.

### 7.3 User Group and Application Expansion

- Serve both C - end creators and B - end enterprise institutions.
- Launch an international version to support multi-language editing and subtitle generation.
- Promote it to segmented markets such as online education, marketing, and e-commerce.

### 7.4 Commercialization Path and Ecosystem Construction

- Implement a premium subscription system (high-definition video export, cloud editing, VIP templates).
- Provide API access services to support SaaS system or content platform integration.
- Build a third-party AI plug-in market to enrich the creative function and tool ecosystem
