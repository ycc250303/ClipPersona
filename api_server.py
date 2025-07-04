from flask import Flask, request, jsonify, make_response, send_from_directory, send_file
from flask_cors import CORS
import socket
import os
import logging
import netifaces  # 用于获取网络接口信息
from nlp_parser import process_instruction, DialogueManager
from video_editor import MoviePyVideoEditor
import mimetypes
import re

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def get_all_ip_addresses():
    ip_list = []
    interfaces = netifaces.interfaces()
    
    for interface in interfaces:
        addrs = netifaces.ifaddresses(interface)
        if netifaces.AF_INET in addrs:
            for addr in addrs[netifaces.AF_INET]:
                ip = addr['addr']
                if not ip.startswith('127.'):  # 排除本地回环地址
                    ip_list.append((interface, ip))
    return ip_list

app = Flask(__name__)

# 配置 CORS
CORS(app, resources={
    r"/*": {
        "origins": "*",
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Accept"],
        "supports_credentials": True
    }
})

# 文件名映射管理
class FileManager:
    def __init__(self):
        self.file_counter = 0
        self.filename_map = {}  # 原始文件名 -> 简化文件名的映射
        self.reverse_map = {}   # 简化文件名 -> 原始文件名的映射
        
    def get_simplified_name(self, original_filename):
        # 如果原始文件名已经有映射，直接返回
        if original_filename in self.filename_map:
            return self.filename_map[original_filename]
            
        # 生成新的简化文件名
        self.file_counter += 1
        simplified_name = f"{self.file_counter:03d}.mp4"  # 例如：001.mp4
        
        # 保存映射关系
        self.filename_map[original_filename] = simplified_name
        self.reverse_map[simplified_name] = original_filename
        
        return simplified_name
        
    def get_original_name(self, simplified_name):
        return self.reverse_map.get(simplified_name)
        
    def has_file(self, original_filename):
        return original_filename in self.filename_map

# 创建文件管理器实例
file_manager = FileManager()
# 创建对话管理器实例
dialogue_manager = DialogueManager()

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# 错误处理
@app.errorhandler(404)
def not_found(error):
    return make_response(jsonify({'error': 'Not found'}), 404)

@app.errorhandler(500)
def internal_error(error):
    return make_response(jsonify({'error': 'Internal server error'}), 500)

# 健康检查端点
@app.route('/health-check', methods=['GET', 'OPTIONS'])
def health_check():
    if request.method == 'OPTIONS':
        return make_response('', 200)
    client_ip = request.remote_addr
    logger.info(f"收到健康检查请求，来自: {client_ip}")
    return jsonify({
        "status": "ok",
        "message": "服务器运行正常",
        "client_ip": client_ip
    })

# 上传视频端点
@app.route('/upload-video', methods=['POST', 'OPTIONS'])
def upload_video():
    if request.method == 'OPTIONS':
        return make_response('', 200)
        
    try:
        client_ip = request.remote_addr
        logger.info(f"收到视频上传请求，客户端IP: {client_ip}")
        
        if 'video' not in request.files:
            return jsonify({"error": "没有上传文件"}), 400
            
        video_file = request.files['video']
        if video_file.filename == '':
            return jsonify({"error": "未选择文件"}), 400
            
        original_filename = video_file.filename
        simplified_name = file_manager.get_simplified_name(original_filename)
        
        # 保存文件
        upload_folder = 'uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        file_path = os.path.join(upload_folder, simplified_name)
        video_file.save(file_path)
        logger.info(f"视频保存成功: {file_path} (原始文件名: {original_filename})")
        
        return jsonify({
            "status": "success",
            "message": "视频上传成功",
            "file_path": file_path,
            "simplified_name": simplified_name
        })
        
    except Exception as e:
        logger.error(f"上传视频时出错: {str(e)}")
        logger.exception("详细错误信息：")
        return jsonify({"error": str(e)}), 500

# 添加视频文件访问端点
@app.route('/uploads/<path:filename>')
def serve_video(filename):
    try:
        video_path = os.path.join('uploads', filename)
        if not os.path.exists(video_path):
            logger.error(f"视频文件不存在: {video_path}")
            return jsonify({"error": "文件不存在"}), 404

        # 获取文件大小
        file_size = os.path.getsize(video_path)
        
        # 处理范围请求
        range_header = request.headers.get('Range', None)
        if range_header:
            byte1, byte2 = 0, None
            match = re.search('bytes=(\d+)-(\d*)', range_header)
            if match:
                groups = match.groups()
                if groups[0]:
                    byte1 = int(groups[0])
                if groups[1]:
                    byte2 = int(groups[1])
            
            if byte2 is None:
                byte2 = file_size - 1
            length = byte2 - byte1 + 1

            # 打开文件并读取指定范围的数据
            with open(video_path, 'rb') as f:
                f.seek(byte1)
                data = f.read(length)

            response = make_response(data)
            response.headers.add('Content-Type', 'video/mp4')
            response.headers.add('Content-Range', f'bytes {byte1}-{byte2}/{file_size}')
            response.headers.add('Accept-Ranges', 'bytes')
            response.headers.add('Content-Length', str(length))
            response.headers.add('Access-Control-Allow-Origin', '*')
            response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
            response.headers.add('Access-Control-Allow-Headers', 'Range')
            response.status_code = 206
            
            return response
            
        # 非范围请求，返回完整文件
        response = send_file(
            video_path,
            mimetype='video/mp4',
            as_attachment=False,
            conditional=True
        )
        
        response.headers.add('Accept-Ranges', 'bytes')
        response.headers.add('Content-Length', str(file_size))
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'GET, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Range')
        return response

    except Exception as e:
        logger.error(f"访问视频文件失败: {str(e)}")
        logger.exception("详细错误信息：")
        return jsonify({"error": str(e)}), 500

# 修改处理视频编辑请求的函数
@app.route('/process-video', methods=['POST', 'OPTIONS'])
def process_video():
    if request.method == 'OPTIONS':
        return make_response('', 200)
    
    try:
        logger.info(f"收到视频处理请求，来自: {request.remote_addr}")
        
        # 检查文件和指令
        if 'video' not in request.files:
            return jsonify({"error": "请上传视频文件"}), 400
        if 'instruction' not in request.form:
            return jsonify({"error": "请提供处理指令"}), 400
            
        video_file = request.files['video']
        instruction = request.form['instruction']
        
        if video_file.filename == '':
            return jsonify({"error": "未选择文件"}), 400
            
        # 获取或创建简化文件名
        original_filename = video_file.filename
        simplified_name = file_manager.get_simplified_name(original_filename)
        
        # 保存视频文件
        upload_folder = 'uploads'
        if not os.path.exists(upload_folder):
            os.makedirs(upload_folder)
            
        video_path = os.path.join(upload_folder, simplified_name)
        
        # 如果文件不存在才保存
        if not os.path.exists(video_path):
            video_file.save(video_path)
            logger.info(f"视频保存成功: {video_path} (原始文件名: {original_filename})")
            
        # 处理视频
        dialogue_manager.set_current_video(video_path)
        action, confirmation, _ = process_instruction(instruction)
        
        if action:
            editor = MoviePyVideoEditor(video_path)
            result = editor.execute_action(action)
            
            # 为处理后的视频创建新的简化文件名
            output_simplified_name = f"output_{simplified_name}"
            output_path = os.path.join(upload_folder, output_simplified_name)
            
            # 保存处理后的视频
            editor.output_path = output_path
            editor.save()
            editor.close()

            # 确保输出文件存在
            if not os.path.exists(output_path):
                raise Exception("处理后的视频文件未生成")

            # 构建相对路径的URL
            video_url = f"/uploads/{output_simplified_name}"
            
            logger.info(f"视频处理完成，输出URL: {video_url}")
            
            return jsonify({
                "status": "success",
                "message": confirmation,
                "result": result,
                "output_path": video_url,
                "simplified_name": output_simplified_name
            })
        else:
            return jsonify({
                "status": "error",
                "message": confirmation
            }), 400
            
    except Exception as e:
        logger.error(f"处理请求时出错: {str(e)}")
        logger.exception("详细错误信息：")
        return jsonify({"error": str(e)}), 500

# 检查文件是否已上传
@app.route('/check-file', methods=['POST'])
def check_file():
    try:
        data = request.json
        if not data or 'filename' not in data:
            return jsonify({"error": "未提供文件名"}), 400
            
        original_filename = data['filename']
        is_uploaded = file_manager.has_file(original_filename)
        
        if is_uploaded:
            simplified_name = file_manager.get_simplified_name(original_filename)
            return jsonify({
                "status": "success",
                "exists": True,
                "simplified_name": simplified_name
            })
        else:
            return jsonify({
                "status": "success",
                "exists": False
            })
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    print("\n" + "="*50)
    print("服务器启动配置:")
    print("="*50)
    
    # 获取所有可用的 IP 地址
    ip_addresses = get_all_ip_addresses()
    print("\n可用的网络接口和IP地址:")
    for interface, ip in ip_addresses:
        print(f"接口: {interface}")
        print(f"IP地址: {ip}")
        print("-" * 30)
    
    print("\n请尝试使用以上任一IP地址访问服务器")
    print(f"端口: 8000")
    print("\n提示:")
    print("1. 请确保手机和电脑在同一网络下")
    print("2. 依次尝试使用上述每个IP地址")
    print("3. 在手机浏览器中访问 http://[IP地址]:8000/health-check")
    print("4. 如果仍然无法访问，请检查防火墙设置")
    print("="*50 + "\n")
    
    try:
        # 启动 Flask 服务器
        app.run(
            host='0.0.0.0',
            port=8000,
            debug=True,
            threaded=True,
            use_reloader=False
        )
    except Exception as e:
        print(f"\n启动服务器时出错: {e}")
        print("请检查端口 8000 是否被占用")