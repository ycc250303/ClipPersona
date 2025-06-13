import uuid
import time
import requests
import logging
from typing import Dict, Any, Callable, Optional, Tuple, List
from auth_util_tools import gen_sign_headers

# 配置日志
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# 编辑器类型枚举
EDITOR_TYPES = {
    'moviepy': 'MoviePyVideoEditor',
    'ffmpeg': 'FFmpegVideoEditor',  # 示例：未来可能添加的编辑器
    'opencv': 'OpenCVVideoEditor'   # 示例：未来可能添加的编辑器
}

# 全局历史记录
history = []

# 操作注册表
OPERATIONS: Dict[str, Dict[str, Any]] = {
    'trim': {
        'params': {
            'start': {'type': float, 'default': 0.0, 'required': True},
            'end': {'type': float, 'default': None, 'required': False}
        },
        'description': '裁剪视频，start=秒数，end=秒数（可选，默认为视频末尾）。例：剪掉前 1 秒 → action: trim start=1.0',
        'supported_editors': ['moviepy', 'ffmpeg', 'opencv']  # 支持该操作的编辑器类型
    },
    'add_transition': {
        'params': {
            'type': {'type': str, 'default': 'fade', 'required': True},
            'duration': {'type': float, 'default': 1.0, 'required': True}
        },
        'description': '添加转场效果，type=转场类型，duration=秒数。',
        'supported_editors': ['moviepy']  # 目前只有 moviepy 支持转场效果
    },
    'speed': {
        'params': {
            'factor': {'type': float, 'default': 1.0, 'required': True}
        },
        'description': '调整视频速度，factor=倍数。'
    },
    'add_text': {
        'params': {
            'text': {'type': str, 'default': '', 'required': True},
            'fontsize': {'type': int, 'default': 24, 'required': False},
            'duration': {'type': float, 'default': 5.0, 'required': False},
            'position': {'type': str, 'default': 'center', 'required': False}
        },
        'description': '添加字幕，text=内容，fontsize=字体大小，duration=秒数，position=位置。'
    },
    'concatenate': {
        'params': {
            'second_video': {'type': str, 'default': '', 'required': True}
        },
        'description': '合并另一个视频，second_video=视频文件路径。'
    },
    'adjust_volume': {
        'params': {
            'factor': {'type': float, 'default': 1.0, 'required': True}
        },
        'description': '调整音量，factor=倍数（例如 0.5 降低一半）。'
    },
    'rotate': {
        'params': {
            'angle': {'type': float, 'default': 90.0, 'required': True}
        },
        'description': '旋转视频，angle=角度（顺时针，单位：度）。'
    },
    'crop': {
        'params': {
            'x1': {'type': float, 'default': 0.0, 'required': True},
            'y1': {'type': float, 'default': 0.0, 'required': True},
            'x2': {'type': float, 'default': None, 'required': True},
            'y2': {'type': float, 'default': None, 'required': True}
        },
        'description': '裁剪画面，x1,y1=左上角坐标，x2,y2=右下角坐标。'
    },
    'add_background_music': {
        'params': {
            'audio_file': {'type': str, 'default': '', 'required': True},
            'mix': {'type': bool, 'default': False, 'required': False}
        },
        'description': '添加背景音乐，audio_file=音频文件路径，mix=是否混合原音频（true/false）。'
    },
    'adjust_brightness': {
        'params': {
            'factor': {'type': float, 'default': 1.0, 'required': True}
        },
        'description': '调整亮度，factor=倍数（大于1增亮，小于1减暗）。'
    }
}

def init_config() -> Callable:
    """
    初始化 API 调用所需的配置信息，并返回处理用户提问的函数。

    Returns:
        Callable: 处理用户单次提问的函数。
    """
    APP_ID = '2025441492'
    APP_KEY = 'wXhkzebAEfVscVkg'
    URI = '/vivogpt/completions'
    DOMAIN = 'api-ai.vivo.com.cn'
    METHOD = 'POST'
    SYSTEM_PROMPT = (
        "你是视频剪辑助手，解析用户自然语言指令，返回格式为：action: <操作> [参数] editor=<编辑器类型>。"
        "根据用户意图推断操作和参数，'剪掉前 X 秒'或'移除前 X 秒'表示从 X 秒开始到视频末尾，仅设置 start=X。"
        "参数值应为数字时，确保格式为小数形式（如 1.0 而非 1）。"
      
        "例如："
        "- '剪掉前 1 秒' → action: trim start=1.0 editor=moviepy"
        "- '添加 2 秒淡入淡出' → action: add_transition type=fade duration=2.0 editor=moviepy"
        "- '加速到 1.5 倍' → action: speed factor=1.5 editor=moviepy"
        "- '添加字幕 Hello，持续 5 秒' → action: add_text text=Hello duration=5.0 position=center editor=moviepy"
        "- '合并 video2.mp4' → action: concatenate second_video=video2.mp4 editor=moviepy"
        "- '将音量降低一半' → action: adjust_volume factor=0.5 editor=moviepy"
        "- '将视频旋转 90 度' → action: rotate angle=90.0 editor=moviepy"
        "- '裁剪画面到 100,100,300,300' → action: crop x1=100.0 y1=100.0 x2=300.0 y2=300.0 editor=moviepy"
        "- '添加背景音乐 music.mp3' → action: add_background_music audio_file=music.mp3 mix=false editor=moviepy"
        "- '将亮度增加 20%' → action: adjust_brightness factor=1.2 editor=moviepy"
    )

    def ask_vivogpt(user_input: str, history: List[Dict[str, str]]) -> Tuple[Optional[str], Optional[str], List[Dict[str, str]]]:
        """
        处理用户的单次提问，调用 API 并返回响应结果，同时更新历史对话。

        Args:
            user_input: 用户输入的视频剪辑指令。
            history: 历史对话列表。

        Returns:
            tuple: (API 响应内容, 确认消息, 更新后的历史对话)。
        """
        params = {'requestId': str(uuid.uuid4())}
        logger.info(f'requestId: {params["requestId"]}')

        new_message = {"role": "user", "content": user_input}
        history.append(new_message)

        prompt_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + history
        prompt_str = "\n".join([f"{msg['role']}: {msg['content']}" for msg in prompt_messages])

        data = {
            'prompt': prompt_str,
            'model': 'vivo-BlueLM-TB-Pro',
            'sessionId': str(uuid.uuid4()),
            'extra': {'temperature': 0.9}
        }
        headers = gen_sign_headers(APP_ID, APP_KEY, METHOD, URI, params)
        headers['Content-Type'] = 'application/json'

        start_time = time.time()
        url = f'https://{DOMAIN}{URI}'
        response = requests.post(url, json=data, headers=headers, params=params)

        content = None
        confirmation = None
        if response.status_code == 200:
            res_obj = response.json()
            logger.info(f'response: {res_obj}')
            if res_obj['code'] == 0 and res_obj.get('data'):
                content = res_obj['data']['content']
                logger.info(f'final content:\n{content}')
                confirmation = generate_confirmation(content)
                assistant_message = {"role": "assistant", "content": content}
                history.append(assistant_message)
        else:
            logger.error(f'{response.status_code} {response.text}')
            confirmation = "哎呀，处理指令时出错了，检查一下输入或稍后再试吧！"
        end_time = time.time()
        logger.info(f'请求耗时: {end_time - start_time:.2f}秒')
        return content, confirmation, history

    return ask_vivogpt

def generate_confirmation(action_str: str) -> str:
    """
    根据 LLM 的操作指令生成自然语言确认消息。

    Args:
        action_str: LLM 返回的操作指令，例如 'action: trim start=10 end=20'.

    Returns:
        str: 自然语言确认消息。
    """
    if not action_str:
        return "没看懂你的指令，啥也没干哦！"

    try:
        action_parts = action_str.strip().split()
        if not action_parts or action_parts[0] != 'action:':
            return "指令格式有点问题，检查一下吧！"
        
        action = action_parts[1]
        if action not in OPERATIONS:
            return f"嘿，这个操作 '{action}' 我还不会呢！"

        params = {}
        for param in action_parts[2:]:
            key, value = param.split('=')
            params[key] = value

        operation = OPERATIONS[action]
        confirmation = f"OK，{operation['description'].split('，')[0]}啦"
        for param_name, param_info in operation['params'].items():
            if param_name in params:
                confirmation += f"，{param_name}={params[param_name]}"
            elif param_info['required']:
                return f"哎呀，缺少必需参数 '{param_name}' 哦！"
        return confirmation + "，搞定！"
    except Exception as e:
        return f"哎呀，解析指令时出了点小问题: {e}！"

def process_instruction(user_input: str) -> Tuple[Optional[str], str, List[Dict[str, str]]]:
    """
    处理用户输入的自然语言指令，返回解析后的操作指令和确认消息。

    Args:
        user_input: 用户输入的自然语言指令。

    Returns:
        Tuple: (操作指令, 确认消息, 更新后的历史记录)。
    """
    global history
    ask_vivogpt = init_config()
    content, confirmation, history = ask_vivogpt(user_input, history)
    return content, confirmation, history

class DialogueManager:
    """对话管理器，用于处理用户交互和生成自然语言响应"""
    
    def __init__(self):
        self.history = []
        self.ask_vivogpt = init_config()
        self.context = {
            "current_video": None,
            "last_operation": None,
            "total_operations": 0
        }
        
    def process_user_input(self, user_input: str) -> Dict[str, Any]:
        """
        处理用户输入，返回响应信息。

        Args:
            user_input: 用户输入的自然语言指令
            
        Returns:
            Dict: {
                "action": 操作指令,
                "response": 自然语言响应,
                "success": 是否成功解析
            }
        """
        try:
            # 处理特殊命令
            if user_input.lower() in ["撤销", "回退", "取消"]:
                return self._handle_undo()
            elif "帮助" in user_input.lower() or "支持什么功能" in user_input:
                return self._get_help_info()
                
            # 处理常规编辑指令
            content, confirmation, self.history = self.ask_vivogpt(user_input, self.history)
            
            if content and content.startswith("action:"):
                self.context["last_operation"] = content
                self.context["total_operations"] += 1
                return {
                    "action": content,
                    "response": self._enhance_confirmation(confirmation),
                    "success": True
                }
            else:
                return {
                    "action": None,
                    "response": "嘿，俺没搞懂你的意思，试试说'帮助'看看支持啥？",
                    "success": False
                }
                
        except Exception as e:
            logger.error(f"处理用户输入时出错: {e}")
            return {
                "action": None,
                "response": f"哎呀，出错了！处理你的指令时有点问题: {str(e)}",
                "success": False
            }
            
    def _handle_undo(self) -> Dict[str, Any]:
        """处理撤销操作"""
        if not self.context["last_operation"]:
            return {
                "action": None,
                "response": "嘿，没啥可以撤回了哦！",
                "success": False
            }
        
        # 清除最后一次操作记录
        self.context["last_operation"] = None
        return {
            "action": "undo",
            "response": "OK，刚刚那步撤掉了！",
            "success": True
        }
        
    def _get_help_info(self) -> Dict[str, Any]:
        """获取帮助信息"""
        help_text = "嘿，我能帮你搞定这些视频编辑：\n\n"
        for op_name, op_info in OPERATIONS.items():
            help_text += f"- {op_info['description']}\n"
        help_text += "\n还能用这些命令：\n"
        help_text += "- 撤销/回退：取消上一步\n"
        help_text += "- 帮助：看看俺能干啥"
        
        return {
            "action": None,
            "response": help_text,
            "success": True
        }
        
    def _enhance_confirmation(self, basic_confirmation: str) -> str:
        """增强确认消息的自然语言表达"""
        if not basic_confirmation:
            return "嘿，俺有点懵，没明白你的指令！"
            
        # 添加更口语化的语言
        if self.context["total_operations"] == 1:
            return f"嘿，第一个编辑搞定！{basic_confirmation}"
        else:
            return f"OK，又一步搞定！{basic_confirmation}"

    def set_current_video(self, video_path: str):
        """设置当前正在编辑的视频"""
        self.context["current_video"] = video_path
        
    def clear_history(self):
        """清除对话历史"""
        self.history = []
        self.context["last_operation"] = None
        self.context["total_operations"] = 0

if __name__ == "__main__":
    inputs = ["剪掉视频第一秒"]
    for user_input in inputs:
        logger.info(f"处理用户输入: {user_input}")
        content, confirmation, history = process_instruction(user_input)
        print(f"指令: {content}")
        print(f"确认: {confirmation}")  