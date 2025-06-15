from flask import Flask, request, jsonify
import os
import uuid
import oss2
from http import HTTPStatus
from dashscope.audio.asr import Transcription
import dashscope
from werkzeug.utils import secure_filename
import logging
from flask_cors import CORS
import requests  # Added for downloading transcription results

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('speech_processing.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# 配置OSS
OSS_AUTH = oss2.Auth(
    # TODO
)
OSS_BUCKET = oss2.Bucket(
    OSS_AUTH,
      # TODO
)

# 达摩院API密钥
dashscope.api_key =  # TODO

# 临时存储目录
UPLOAD_FOLDER = 'temp_uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/process_audio', methods=['POST'])
def process_audio():
    """处理音频文件并返回识别结果"""
    try:
        # 检查是否有文件
        if 'audio' not in request.files:
            logger.error('未找到音频文件')
            return jsonify({'error': '未找到音频文件'}), 400

        audio_file = request.files['audio']
        if audio_file.filename == '':
            logger.error('收到空文件名')
            return jsonify({'error': '无效的音频文件'}), 400

        logger.info('成功接收音频文件')
        print('成功接收音频文件')

        # 保存临时文件
        file_extension = os.path.splitext(audio_file.filename)[1].lower()
        if file_extension not in ['.wav', '.mp3']:
            logger.error(f'不支持的文件格式: {file_extension}')
            return jsonify({'error': '仅支持WAV或MP3格式'}), 400

        filename = secure_filename(f"{uuid.uuid4().hex}{file_extension}")
        temp_path = os.path.join(UPLOAD_FOLDER, filename)
        audio_file.save(temp_path)
        logger.info(f'临时文件已保存: {temp_path}')

        # 上传到OSS
        oss_key = f"audio_records/{filename}"
        OSS_BUCKET.put_object_from_file(oss_key, temp_path)
        audio_url = OSS_BUCKET.sign_url('GET', oss_key, 3600 * 24 * 365)
        logger.info(f'文件已上传到OSS: {audio_url}')

        # 调用语音识别API - 使用新方法
        logger.info('开始调用语音识别API...')

        # 1. 提交语音识别任务
        task_response = Transcription.async_call(
            model='paraformer-v2',
            file_urls=[audio_url],
            language_hints=['zh', 'en']
        )

        # 2. 等待任务完成
        transcribe_response = Transcription.wait(task=task_response.output.task_id)

        if transcribe_response.status_code == HTTPStatus.OK:
            # 3. 获取识别结果 URL
            transcription_url = transcribe_response.output["results"][0]["transcription_url"]

            # 4. 下载 JSON 文件并提取文本
            response = requests.get(transcription_url)
            if response.status_code == 200:
                transcription_data = response.json()

                # 提取识别文本
                if "transcripts" in transcription_data and len(transcription_data["transcripts"]) > 0:
                    recognized_text = transcription_data["transcripts"][0]["text"]
                    logger.info(f'识别结果: {recognized_text}')

                    return jsonify({
                        'success': True,
                        'transcription': recognized_text,
                        'audio_url': audio_url
                    })
                else:
                    error_msg = "未找到识别文本"
                    logger.error(error_msg)
                    return jsonify({
                        'success': False,
                        'error': error_msg
                    }), 500
            else:
                error_msg = f"下载识别结果失败: {response.status_code}"
                logger.error(error_msg)
                return jsonify({
                    'success': False,
                    'error': error_msg
                }), 500
        else:
            error_msg = f"语音识别失败: {transcribe_response.message}"
            logger.error(error_msg)
            return jsonify({
                'success': False,
                'error': error_msg
            }), 500

    except Exception as e:
        error_msg = f"处理出错: {str(e)}"
        logger.error(error_msg, exc_info=True)
        return jsonify({
            'success': False,
            'error': error_msg
        }), 500

    finally:
        # 清理临时文件
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
            logger.info(f'临时文件已删除: {temp_path}')


if __name__ == '__main__':
    print('等待接收音频文件...')
    app.run(host='0.0.0.0', port=5001, debug=True)
