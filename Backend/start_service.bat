@echo off
echo Video process service is starting...

:: 激活虚拟环境
call activate videoedit

:: 启动 FastAPI 服务器
python api_server.py

:: 如果服务器停止，等待用户输入
pause 