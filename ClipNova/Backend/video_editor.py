import os
import gc
import uuid
import time
import psutil
import logging
import tempfile
import retrying
from abc import ABC, abstractmethod
from moviepy.editor import VideoFileClip, concatenate_videoclips, vfx, TextClip, CompositeVideoClip, AudioFileClip, CompositeAudioClip
from typing import Dict, Any, Optional, Tuple, Protocol
from nlp_parser import OPERATIONS, EDITOR_TYPES, process_instruction, DialogueManager

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class AbstractVideoEditor(ABC):
    """视频编辑器的抽象基类，定义所有视频编辑器必须实现的接口"""
    
    @abstractmethod
    def __init__(self, input_video: str):
        """初始化视频编辑器"""
        pass
        
    @abstractmethod
    def trim(self, start: float = 0.0, end: Optional[float] = None):
        """裁剪视频"""
        pass
        
    @abstractmethod
    def add_transition(self, transition_type: str = "fade", duration: float = 1.0):
        """添加转场效果"""
        pass
        
    @abstractmethod
    def adjust_speed(self, factor: float = 1.0):
        """调整视频播放速度"""
        pass
        
    @abstractmethod
    def add_text(self, text: str, fontsize: int = 24, duration: float = 5.0, position: str = "center"):
        """添加字幕"""
        pass
        
    @abstractmethod
    def concatenate(self, second_video: str):
        """合并另一个视频"""
        pass
        
    @abstractmethod
    def adjust_volume(self, factor: float = 1.0):
        """调整视频音量"""
        pass
        
    @abstractmethod
    def rotate(self, angle: float = 90.0):
        """旋转视频"""
        pass
        
    @abstractmethod
    def crop(self, x1: float = 0.0, y1: float = 0.0, x2: float = None, y2: float = None):
        """裁剪画面"""
        pass
        
    @abstractmethod
    def add_background_music(self, audio_file: str, mix: bool = False):
        """添加背景音乐"""
        pass
        
    @abstractmethod
    def adjust_brightness(self, factor: float = 1.0):
        """调整亮度"""
        pass
        
    @abstractmethod
    def save(self):
        """保存编辑后的视频"""
        pass
        
    @abstractmethod
    def close(self):
        """关闭视频剪辑，释放资源"""
        pass

class MoviePyVideoEditor(AbstractVideoEditor):
    """基于 MoviePy 的视频编辑器实现"""
    
    def __init__(self, input_video: str):
        """
        初始化视频编辑器。

        Args:
            input_video: 输入视频文件路径。
        """
        if not os.path.exists(input_video):
            raise FileNotFoundError(f"视频文件 {input_video} 不存在")
        self.video_clip = VideoFileClip(input_video)
        self.output_path = f"output_video_{uuid.uuid4()}.mp4"
        logger.info(f"已加载视频: {input_video}, 时长: {self.video_clip.duration}秒")

    def trim(self, start: float = 0.0, end: Optional[float] = None):
        """裁剪视频。"""
        end = end if end is not None else self.video_clip.duration
        if start >= self.video_clip.duration:
            raise ValueError("起始时间超出视频时长")
        if end is not None and end <= start:
            raise ValueError("结束时间必须大于起始时间")
        self.video_clip = self.video_clip.subclip(start, end)
        logger.info(f"已裁剪视频: start={start}, end={end}")

    def add_transition(self, transition_type: str = "fade", duration: float = 1.0):
        """添加转场效果（目前支持淡入淡出）。"""
        if transition_type == "fade":
            self.video_clip = self.video_clip.fadein(duration).fadeout(duration)
            logger.info(f"已添加淡入淡出转场效果，持续时间={duration}秒")
        else:
            logger.warning(f"不支持的转场类型: {transition_type}")

    def adjust_speed(self, factor: float = 1.0):
        """调整视频播放速度。"""
        if factor <= 0:
            raise ValueError("速度倍数必须大于 0")
        self.video_clip = self.video_clip.fx(vfx.speedx, factor)
        logger.info(f"已调整视频速度为 {factor} 倍")

    def add_text(self, text: str, fontsize: int = 24, duration: float = 5.0, position: str = "center"):
        """添加字幕。"""
        txt_clip = TextClip(text, fontsize=fontsize, color='white', bg_color='black')
        txt_clip = txt_clip.set_duration(min(duration, self.video_clip.duration))
        txt_clip = txt_clip.set_position(position)
        self.video_clip = CompositeVideoClip([self.video_clip, txt_clip])
        logger.info(f"已添加字幕: '{text}'，持续时间={duration}秒，位置={position}")

    def concatenate(self, second_video: str):
        """合并另一个视频。"""
        if not os.path.exists(second_video):
            raise FileNotFoundError(f"第二个视频文件 {second_video} 不存在")
        second_clip = VideoFileClip(second_video)
        self.video_clip = concatenate_videoclips([self.video_clip, second_clip])
        second_clip.close()
        logger.info(f"已合并视频: {second_video}")

    def adjust_volume(self, factor: float = 1.0):
        """调整视频音量。"""
        if factor < 0:
            raise ValueError("音量倍数必须非负")
        self.video_clip = self.video_clip.volumex(factor)
        logger.info(f"已调整音量为 {factor} 倍")

    def rotate(self, angle: float = 90.0):
        """旋转视频。"""
        self.video_clip = self.video_clip.rotate(angle)
        logger.info(f"已旋转视频: 角度={angle}度")

    def crop(self, x1: float = 0.0, y1: float = 0.0, x2: float = None, y2: float = None):
        """裁剪画面。"""
        if x2 is None or y2 is None:
            raise ValueError("x2 和 y2 必须指定")
        if x1 < 0 or y1 < 0 or x2 <= x1 or y2 <= y1:
            raise ValueError("裁剪坐标无效")
        if x2 > self.video_clip.w or y2 > self.video_clip.h:
            raise ValueError("裁剪坐标超出视频尺寸")
        self.video_clip = self.video_clip.crop(x1=x1, y1=y1, x2=x2, y2=y2)
        logger.info(f"已裁剪画面: x1={x1}, y1={y1}, x2={x2}, y2={y2}")

    def add_background_music(self, audio_file: str, mix: bool = False):
        """添加背景音乐。"""
        if not os.path.exists(audio_file):
            raise FileNotFoundError(f"音频文件 {audio_file} 不存在")
        audio_clip = AudioFileClip(audio_file).set_duration(self.video_clip.duration)
        if mix and self.video_clip.audio:
            audio_clip = CompositeAudioClip([self.video_clip.audio, audio_clip])
        self.video_clip = self.video_clip.set_audio(audio_clip)
        logger.info(f"已添加背景音乐: {audio_file}, 混合原音频={mix}")

    def adjust_brightness(self, factor: float = 1.0):
        """调整亮度。"""
        if factor <= 0:
            raise ValueError("亮度倍数必须大于 0")
        self.video_clip = self.video_clip.fx(vfx.colorx, factor)
        logger.info(f"已调整亮度为 {factor} 倍")

    def remove_objects(self, objects: str):
        """
        使用SAM2模型移除视频中的目标对象。
        
        Args:
            objects: 要移除的目标对象描述
        """
        try:
            from video_comprehension import process_video_with_sam2
            
            # 创建临时输出路径
            temp_output = f"temp_output_{uuid.uuid4()}.mp4"
            
            # 处理视频目标消除
            process_video_with_sam2(self.video_clip.filename, objects, temp_output)
            
            # 如果处理成功，更新视频剪辑
            if os.path.exists(temp_output):
                # 关闭当前视频剪辑
                self.close()
                # 加载处理后的视频
                self.video_clip = VideoFileClip(temp_output)
                # 删除临时文件
                self._remove_temp_file(temp_output)
                logger.info(f"已移除目标对象: {objects}")
            else:
                raise Exception("目标消除处理失败")
                
        except Exception as e:
            logger.error(f"移除目标对象时出错: {e}")
            raise

    def save(self):
        """保存编辑后的视频。"""
        self.video_clip.write_videofile(self.output_path, codec='libx264', audio_codec='aac')
        logger.info(f"视频已保存至: {self.output_path}")

    def close(self):
        """关闭视频剪辑，释放资源。"""
        if hasattr(self, 'video_clip') and self.video_clip:
            if hasattr(self.video_clip, 'audio') and self.video_clip.audio:
                self.video_clip.audio.close()
            self.video_clip.close()
            self.video_clip = None
        gc.collect()
        logger.info("视频剪辑已关闭")

    @retrying.retry(stop_max_attempt_number=3, wait_fixed=200)
    def _remove_temp_file(self, temp_output: str):
        """尝试删除临时文件，重试 3 次，每次间隔 200ms。"""
        for proc in psutil.process_iter(['name']):
            if proc.info['name'].lower() in ['ffmpeg.exe', 'ffmpeg']:
                try:
                    proc.terminate()
                    proc.wait(timeout=3)
                except psutil.Error as e:
                    logger.warning(f"终止 ffmpeg 进程失败: {e}")
        os.remove(temp_output)
        logger.info(f"临时文件 {temp_output} 已删除")

    def execute_action(self, action_str: str):
        """
        根据解析的操作指令执行视频编辑。

        Args:
            action_str: LLM 返回的操作指令，例如 'action: trim start=10 end=20'.
        """
        if not action_str:
            logger.warning("未收到有效的操作指令")
            return

        try:
            logger.info(f"执行操作: {action_str}")
            action_parts = action_str.strip().split()
            if not action_parts or action_parts[0] != 'action:':
                logger.warning("无效的 action 格式")
                return

            action = action_parts[1]
            if action not in OPERATIONS:
                logger.warning(f"不支持的操作: {action}")
                return

            params = {}
            for param in action_parts[2:]:
                key, value = param.split('=')
                params[key] = value

            operation = OPERATIONS[action]
            parsed_params = {}
            for param_name, param_info in operation['params'].items():
                if param_name in params:
                    try:
                        if param_info['type'] is bool:
                            parsed_params[param_name] = params[param_name].lower() == 'true'
                        else:
                            parsed_params[param_name] = param_info['type'](params[param_name])
                    except ValueError:
                        logger.error(f"参数 {param_name} 格式错误: {params[param_name]}")
                        return
                elif param_info['required']:
                    logger.error(f"缺少必需参数: {param_name}")
                    return
                else:
                    parsed_params[param_name] = param_info['default']

            if action == 'trim':
                self.trim(**parsed_params)
            elif action == 'add_transition':
                self.add_transition(**parsed_params)
            elif action == 'speed':
                self.adjust_speed(**parsed_params)
            elif action == 'add_text':
                self.add_text(**parsed_params)
            elif action == 'concatenate':
                self.concatenate(**parsed_params)
            elif action == 'adjust_volume':
                self.adjust_volume(**parsed_params)
            elif action == 'rotate':
                self.rotate(**parsed_params)
            elif action == 'crop':
                self.crop(**parsed_params)
            elif action == 'add_background_music':
                self.add_background_music(**parsed_params)
            elif action == 'adjust_brightness':
                self.adjust_brightness(**parsed_params)

        except Exception as e:
            logger.error(f"编辑操作失败: {e}")

class VideoEditorFactory:
    """视频编辑器工厂类，负责创建不同类型的视频编辑器实例"""
    
    @staticmethod
    def create_editor(editor_type: str, input_video: str) -> AbstractVideoEditor:
        """
        根据指定的编辑器类型创建相应的视频编辑器实例。
        
        Args:
            editor_type: 编辑器类型，必须是 EDITOR_TYPES 中定义的类型之一
            input_video: 输入视频文件路径
            
        Returns:
            AbstractVideoEditor: 视频编辑器实例
            
        Raises:
            ValueError: 当指定的编辑器类型不支持时抛出
        """
        if editor_type not in EDITOR_TYPES:
            raise ValueError(f"不支持的编辑器类型: {editor_type}")
            
        if editor_type == 'moviepy':
            return MoviePyVideoEditor(input_video)
        elif editor_type == 'ffmpeg':
            raise NotImplementedError("FFmpeg 编辑器尚未实现")
        elif editor_type == 'opencv':
            raise NotImplementedError("OpenCV 编辑器尚未实现")
        else:
            raise ValueError(f"未知的编辑器类型: {editor_type}")

class DialogueVideoEditor:
    """对话式视频编辑器，整合自然语言处理和视频编辑功能"""
    
    def __init__(self, input_video: str, editor_type: str = 'moviepy'):
        """
        初始化对话式视频编辑器。
        
        Args:
            input_video: 输入视频文件路径
            editor_type: 编辑器类型，默认使用 MoviePy
        """
        self.editor = VideoEditorFactory.create_editor(editor_type, input_video)
        self.dialogue_manager = DialogueManager()
        self.dialogue_manager.set_current_video(input_video)
        self.history = []
        
    def process_command(self, user_input: str) -> str:
        """
        处理用户的自然语言命令。

        Args:
            user_input: 用户输入的自然语言命令
            
        Returns:
            str: 处理结果的自然语言响应
        """
        try:
            # 处理用户输入
            result = self.dialogue_manager.process_user_input(user_input)
            
            if not result["success"]:
                return result["response"]
                
            # 如果是撤销操作
            if result["action"] == "undo":
                return result["response"]
                    
            # 如果是帮助信息
            if not result["action"]:
                return result["response"]
                
            # 执行编辑操作
            action_str = result["action"]
            action_parts = action_str.strip().split()
            editor_type = 'moviepy'  # 默认使用 MoviePy
            
            # 解析编辑器类型
            for part in action_parts:
                if part.startswith('editor='):
                    editor_type = part.split('=')[1]
                    break
                    
            # 检查操作是否被指定编辑器支持
            action = action_parts[1]
            if action in OPERATIONS and editor_type not in OPERATIONS[action]['supported_editors']:
                return f"抱歉，{editor_type} 编辑器不支持 {action} 操作"
                
            self.editor.execute_action(action_str)
            return result["response"]
            
        except Exception as e:
            logger.error(f"处理命令失败: {e}")
            return f"处理命令时出错: {str(e)}"

    def save_final(self, output_path: str):
        """
        保存最终的视频文件。

        Args:
            output_path: 输出文件路径
        """
        self.editor.output_path = output_path
        self.editor.save()
        self.editor.close()
        
    def close(self):
        """关闭编辑器并清理资源"""
        self.editor.close()
        self.dialogue_manager.clear_history()

def process_video_edit(user_input: str, input_video: str, editor_type: str = 'moviepy') -> Tuple[str, Optional[AbstractVideoEditor]]:
    """
    处理单次视频编辑指令，返回确认消息和编辑器实例。
    
    Args:
        user_input: 用户输入的自然语言指令
        input_video: 输入视频文件路径
        editor_type: 编辑器类型，默认使用 MoviePy
        
    Returns:
        Tuple[str, Optional[AbstractVideoEditor]]: (确认消息, 编辑器实例)
    """
    try:
        editor = VideoEditorFactory.create_editor(editor_type, input_video)
    except FileNotFoundError as e:
        logger.error(str(e))
        return str(e), None
    except Exception as e:
        logger.error(f"创建编辑器失败: {e}")
        return f"创建编辑器失败: {str(e)}", None
        
    content, confirmation, _ = process_instruction(user_input)
    if content:
        editor.execute_action(content)
        
    return confirmation, editor

if __name__ == "__main__":
    input_video = "D:\\test1\\video001.mp4"
    editor = DialogueVideoEditor(input_video)
    
    # 测试对话式编辑
    commands = [
        "将视频的前 1 秒剪掉"
    ]
    
    for cmd in commands:
        print(f"\n用户输入: {cmd}")
        response = editor.process_command(cmd)
        print(f"系统响应: {response}")
    
    editor.save_final("output_final.mp4")
    editor.close()