from openai import OpenAI
import os
import base64
import cv2
import numpy as np
import re
import json
import subprocess
from sam2_model import SAM2InstanceSegmentationModel,remove_detect_target

#  Base64 编码格式
def encode_video(video_path):
    with open(video_path, "rb") as video_file:
        return base64.b64encode(video_file.read()).decode("utf-8")

def encode_image(image):
    _, buffer = cv2.imencode('.jpg', image)
    return base64.b64encode(buffer).decode('utf-8')

def extract_frame(video_path, frame_number):
    video = cv2.VideoCapture(video_path)
    video.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
    ret, frame = video.read()
    video.release()
    if ret:
        return frame
    return None

# 将test.mp4替换为你本地视频的绝对路径
def video_comprehension(video_path, prompt, stream_type, example_video_path="D:/test1/video016.mp4"):
    client = OpenAI(
        # 若没有配置环境变量，请用百炼API Key将下行替换为：api_key="sk-xxx"
        api_key="your_qwen_api_key",
        base_url="https://dashscope.aliyuncs.com/compatible-mode/v1",
    )

    # 检查视频文件
    if not os.path.exists(video_path):
        print(f"错误: 视频文件不存在: {video_path}")
        return

    # 获取视频信息
    video = cv2.VideoCapture(video_path)
    width = int(video.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(video.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = video.get(cv2.CAP_PROP_FPS)
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    video.release()

    print("视频信息：")
    print(f"宽度: {width}")
    print(f"高度: {height}")
    print(f"帧率: {fps}")
    print(f"总帧数: {total_frames}")

    # 第一步：定位目标帧
    print("\n第一步：正在定位目标帧...")
    base64_video = encode_video(video_path)
    
    messages = [
        {
            "role": "system",
            "content": "你是一个专业的视频分析助手。请分析视频内容，若无用户特殊说明，则找出包含指定目标的最显眼、最清晰、最符合条件的关键帧。不要简单地选择第一个出现的帧，而是要选择目标最突出、最容易识别的帧。请只返回帧序号（从0开始计数），不要包含任何其他数字或文字说明。"
        }
    ]

    messages.append({
        "role": "user",
        "content": [
            {
                "type": "video_url",
                "video_url":{"url":f"data:video/mp4;base64,{base64_video}"}
            },
            {
                "type": "text",
                "text": f"请找出视频中包含{prompt}的最显眼、最清晰的帧。视频总共有{total_frames}帧，请只返回0到{total_frames-1}之间的整数帧序号，不要包含任何其他数字或文字说明。\n\n选择标准：\n1. 目标在画面中占据较大比例\n2. 目标姿态完整，没有被遮挡\n3. 目标清晰可见，没有模糊\n4. 目标在画面中的位置合适，便于后续处理"
            }
        ]
    })

    completion = client.chat.completions.create(
        model="qwen-vl-max-latest",
        messages=messages,
        stream=False,
    )

    # 从模型返回的文本中提取帧序号
    response_text = completion.choices[0].message.content
    print("response_text:", response_text)
    try:
        # 尝试从文本中提取数字
        numbers = re.findall(r'\d+', response_text)
        print("numbers:", numbers)
        
        # 提取最后一个数字作为帧序号
        # 因为模型通常在最后给出最终答案
        if numbers:
            # 将字符串转换为整数并去重
            unique_numbers = list(set(map(int, numbers)))
            # 按数字大小排序
            unique_numbers.sort()
            # 选择最大的数字作为帧序号
            frame_number = unique_numbers[-1]
            
            if frame_number >= total_frames:
                print(f"警告：模型返回的帧序号 {frame_number} 超出视频总帧数 {total_frames}，将使用最后一帧")
                frame_number = total_frames - 1
        else:
            print("警告：无法从模型返回中提取帧序号，将使用第一帧")
            frame_number = 0
    except Exception as e:
        print(f"警告：处理帧序号时出错：{str(e)}，将使用第一帧")
        frame_number = 0

    print(f"找到目标帧：第{frame_number}帧")

    # 第二步：在目标帧上进行目标检测
    print("\n第二步：正在检测目标位置...")
    target_frame = extract_frame(video_path, frame_number)
    if target_frame is None:
        print("错误：无法提取目标帧")
        return

    base64_frame = encode_image(target_frame)
    
    messages = [
        {
            "role": "system",
            "content": "你是一个专业的目标检测助手。请分析图片，定位指定目标的位置，返回边界框坐标，坐标原点（0，0）为图片左上角。请以JSON格式返回结果，包含左上角坐标(x1,y1)、右下角坐标(x2,y2)和中心点坐标(x,y)。"
        }
    ]

    messages.append({
        "role": "user",
        "content": [
            {
                "type": "image_url",
                "image_url": {
                    "url": f"data:image/jpeg;base64,{base64_frame}"
                }
            },
            {
                "type": "text",
                "text": f"请定位{prompt}的位置，以JSON格式返回边界框的左上角坐标(x1,y1)和右下角坐标(x2,y2)，以及中心点坐标(x,y)，坐标原点在图片左上角。\n\n返回格式示例：\n{{\n  \"x1\": 100,\n  \"y1\": 200,\n  \"x2\": 300,\n  \"y2\": 400,\n  \"x\": 200,\n  \"y\": 300\n}}"
            }
        ]
    })

    completion = client.chat.completions.create(
        model="qwen-vl-max-latest",
        messages=messages,
        stream=False,
    )

    result = completion.choices[0].message.content
    print("\n检测结果：")
    print(result)

    try:
        # 清理JSON字符串中的markdown标记
        json_str = result.strip()
        if json_str.startswith('```json'):
            json_str = json_str[7:]  # 移除 ```json
        if json_str.endswith('```'):
            json_str = json_str[:-3]  # 移除 ```
        json_str = json_str.strip()
        
        # 解析JSON结果
        detection_result = json.loads(json_str)
        return {
            "frame_number": frame_number,
            "detection_result": detection_result
        }
    except json.JSONDecodeError as e:
        print(f"警告：无法解析检测结果为JSON格式: {str(e)}")
        return {
            "frame_number": frame_number,
            "detection_result": result
        }

def process_video_with_sam2(video_path, prompt, output_video_path=None):
    """
    处理视频：定位目标、生成掩码、消除目标
    
    参数:
        video_path (str): 输入视频路径
        prompt (str): 目标描述
        output_video_path (str): 输出视频路径，如果为None则使用默认路径
    """
    # 1. 使用video_comprehension定位目标
    print("第一步：使用大模型定位目标...")
    result = video_comprehension(video_path, prompt, False)
    
    if not result or "detection_result" not in result:
        print("错误：目标定位失败")
        return
    print("result:",result)
    frame_number = result["frame_number"]
    detection_result = result["detection_result"]
    
    # 2. 初始化SAM2模型
    print("\n第二步：初始化SAM2模型...")
    checkpoint = "D:\GitHub\sitp-bronze96\models\sam2.1_hiera_tiny.pt"
    model_cfg = "D:\GitHub\sitp-bronze96\models\sam2.1_hiera_t.yaml"
    
    model = SAM2InstanceSegmentationModel(model_cfg, checkpoint)
    model.set_video_path(video_path, output_video_path or "./result.mp4")
    
    # 3. 使用检测结果进行实例分割
    print("\n第三步：进行实例分割...")
    try:
        if isinstance(detection_result, dict):
            # 优先使用中心点进行分割
            if "x" in detection_result and "y" in detection_result:
                points = np.array([[detection_result["x"], detection_result["y"]]], dtype=np.float32)
                labels = np.array([1], dtype=np.int32)
                print(f"使用中心点进行分割: ({detection_result['x']}, {detection_result['y']})")
                success = model.segment_with_points(points, labels, frame_number)
                
            else:
                # 如果没有中心点坐标，则使用边界框
                box = np.array([
                    detection_result["x1"],
                    detection_result["y1"],
                    detection_result["x2"],
                    detection_result["y2"]
                ])
                print(f"使用边界框进行分割: [{detection_result['x1']}, {detection_result['y1']}, {detection_result['x2']}, {detection_result['y2']}]")
                success = model.segment_with_box(box, frame_number)
              
        else:
            # 如果检测结果不是JSON格式，尝试提取中心点
            try:
                center_x = int(detection_result.split("x:")[1].split(",")[0])
                center_y = int(detection_result.split("y:")[1].split(")")[0])
                points = np.array([[center_x, center_y]], dtype=np.float32)
                labels = np.array([1], dtype=np.int32)
                print(f"使用中心点进行分割: ({center_x}, {center_y})")
                success = model.segment_with_points(points, labels, frame_number)
          
            except:
                print("无法提取中心点坐标，请检查检测结果格式")
                return

        if not success:
            print("实例分割失败，请检查分割参数")
            return

        # 检查分割结果
        if frame_number not in model.video_segments or not model.video_segments[frame_number]:
            print(f"警告：第{frame_number}帧的分割结果为空")
            return
    
        # 4. 生成黑白掩码
        print("\n第四步：生成黑白掩码...")
        try:
            model.generate_colored_mask_video()
            model.generate_white_mask_images()
        except Exception as e:
            print(f"生成掩码时出错: {str(e)}")
            return

        # 5. 使用E2FGVI模型进行目标消除
        print("\n第五步：进行目标消除...")
        try:
            remove_detect_target(video_path, output_video_path or "./result.mp4")
        except Exception as e:
            print(f"目标消除时出错: {str(e)}")
            return

        # 6. 清理临时文件
        print("\n第六步：清理临时文件...")
        model.cleanup()

        print("\n处理完成！")
    
    except Exception as e:
        print(f"处理过程中出错: {str(e)}")
        return

if __name__ == "__main__":
    video_path = r"D:\test1\video001.mp4"
    #remove = "请帮我消除"
    prompt = "消除穿着粉色外套的女性"
    process_video_with_sam2(video_path,  prompt)