import uuid
import time
import requests
import logging
from typing import Dict, Any, Callable, Optional, Tuple, List
from auth_util_tools import gen_sign_headers
from user_personality_card import UserPersonalityCard

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
       # 1) 角色 & 输出格式 --------------------------------------------------
    "你是我的视频剪辑小帮手。收到任何中文指令，都要回一行："
    "action: <操作> [参数] editor=<编辑器类型>。\n\n"

    # 2) 基本规则（口语化说明）--------------------------------------------
    "记得：\n"
    "• “剪掉/去掉/砍掉开头 X 秒” → 只用 start=X。\n"
    "• 数字一律写成小数：1.0、2.5 …\n"
    "• “亮一点/变亮一点” → 默认亮度 +20%（factor=1.2）；“暗一点” → 亮度 –20%（factor=0.8）。\n"
    "• “快一点/慢一点” 若没说具体倍速 → 默认 1.25 / 0.75。\n"
    "• “静音” → action: adjust_volume factor=0.0。\n\n"
    "• 当用户提到 '使用人格卡' 时，返回这个人格卡中使用频率前三的操作，并按顺序应用这些操作。\n\n"
    
    "例子：\n"
    "- '使用人格卡剪辑1' → action: trim start=1.0 editor=moviepy\n"
    "- '使用人格卡剪辑1' → action: add_text text=Hello duration=3.0 position=center editor=moviepy"

    # 3) 口语示例（覆盖所有已支持操作）------------------------------------
    # trim
    "- \"把开头 1 秒剪掉\"                 → action: trim start=1.0 editor=moviepy\n"
    "- \"前两秒不要了\"                    → action: trim start=2.0 editor=moviepy\n"
    "- \"砍掉头 0.5 秒\"                  → action: trim start=0.5 editor=moviepy\n"
    # add_transition
    "- \"片头加 1.5 秒淡入淡出\"          → action: add_transition type=fade duration=1.5 editor=moviepy\n"
    "- \"在第 5 秒插 2 秒黑屏转场\"        → action: add_transition type=fade duration=2.0 editor=moviepy\n"
    "- \"结尾前来个 1 秒淡出\"            → action: add_transition type=fade duration=1.0 editor=moviepy\n"
    # speed
    "- \"整体速度调到 1.5 倍\"            → action: speed factor=1.5 editor=moviepy\n"
    "- \"慢一点\"                         → action: speed factor=0.75 editor=moviepy\n"
    "- \"再快一点，大概一倍二\"           → action: speed factor=1.2 editor=moviepy\n"
    # add_text
    "- \"打字幕 Hello 3 秒放左下\"         → action: add_text text=Hello duration=3.0 position=bottom-left editor=moviepy\n"
    "- \"右上角加『完赛』两秒\"            → action: add_text text=完赛 duration=2.0 position=top-right editor=moviepy\n"
    "- \"正中来句『旅行开始』停 4 秒\"     → action: add_text text=旅行开始 duration=4.0 position=center editor=moviepy\n"
    # concatenate
    "- \"把 video2.mp4 接在后面\"          → action: concatenate second_video=video2.mp4 editor=moviepy\n"
    "- \"合并一下 clip_b.mp4\"            → action: concatenate second_video=clip_b.mp4 editor=moviepy\n"
    "- \"把 intro.mp4 拼到最前面\"        → action: concatenate second_video=intro.mp4 editor=moviepy\n"
    # adjust_volume
    "- \"声音小一半\"                     → action: adjust_volume factor=0.5 editor=moviepy\n"
    "- \"静音一下\"                       → action: adjust_volume factor=0.0 editor=moviepy\n"
    "- \"声音大一点 1.3 倍\"              → action: adjust_volume factor=1.3 editor=moviepy\n"
    # rotate
    "- \"视频顺时针转 90 度\"             → action: rotate angle=90.0 editor=moviepy\n"
    "- \"把画面翻到竖屏 270°\"            → action: rotate angle=270.0 editor=moviepy\n"
    "- \"倒过来 180 度\"                  → action: rotate angle=180.0 editor=moviepy\n"
    # crop
    "- \"裁掉左上 100,100 到 300,300\"    → action: crop x1=100.0 y1=100.0 x2=300.0 y2=300.0 editor=moviepy\n"
    "- \"把画面切成正方形从 200 到 800\"  → action: crop x1=200.0 y1=200.0 x2=800.0 y2=800.0 editor=moviepy\n"
    "- \"去掉底部 50 像素黑边\"           → action: crop x1=0.0 y1=0.0 x2=1920.0 y2=1030.0 editor=moviepy\n"
    # add_background_music
    "- \"加首 music.mp3 做背景\"          → action: add_background_music audio_file=music.mp3 mix=false editor=moviepy\n"
    "- \"bgm.mp3 混合原声\"               → action: add_background_music audio_file=bgm.mp3 mix=true editor=moviepy\n"
    "- \"换成 rock.mp3 并保留人声\"       → action: add_background_music audio_file=rock.mp3 mix=true editor=moviepy\n"
    # adjust_brightness
    "- \"亮一点呗\"                       → action: adjust_brightness factor=1.2 editor=moviepy\n"
    "- \"暗一点\"                         → action: adjust_brightness factor=0.8 editor=moviepy\n"
    "- \"亮度提升 30%\"                   → action: adjust_brightness factor=1.3 editor=moviepy\n"
    "- \"别太亮，降到 0.9\"              → action: adjust_brightness factor=0.9 editor=moviepy\n"
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
            # 处理人格卡相关指令
            if "使用人格卡" in user_input:
                card_name = user_input.split("使用人格卡")[1].strip()  # 获取卡片名称
                if card_name:
                    # 调用API来处理人格卡的使用
                    content, confirmation, self.history = self.ask_vivogpt(f"使用人格卡 {card_name}", self.history)
                    # 返回识别到的操作
                    return {
                        "action": content,
                        "response": confirmation,
                        "success": True
                    }



            # 处理特殊命令
            if user_input.lower() in ["撤销", "回退", "取消"]:
                return self._handle_undo()
            elif "帮助" in user_input.lower() or "支持什么功能" in user_input:
                return self._get_help_info()
                
            # 处理常规剪辑指令
            content, confirmation, self.history = self.ask_vivogpt(user_input, self.history)

            if content and content.startswith("action:"):
                self.context["last_operation"] = content
                self.context["total_operations"] += 1
                operation_name = content.split()[1]  # 提取操作名称
                params = {param.split('=')[0]: param.split('=')[1] for param in content.split()[2:]}
                # 更新人格卡的操作偏好
                self.update_personality_card(operation_name, params)
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
        
    def update_personality_card(self, operation_name, params):
        """更新用户偏好并存储到人格卡中"""
        card_name = "剪辑1"  # 假设我们使用的是名为“剪辑1”的人格卡
        card = UserPersonalityCard(card_name)
        card.update_operation(operation_name, params)
            
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
    inputs = ["我想让整个视频速度快一点"]
    for user_input in inputs:
        logger.info(f"处理用户输入: {user_input}")
        content, confirmation, history = process_instruction(user_input)
        print(f"指令: {content}")
        print(f"确认: {confirmation}")  