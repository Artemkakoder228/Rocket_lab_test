@echo off
echo =========================================
echo         Starting Rocket Lab System...
echo =========================================

:: На Windows найкраще використовувати 'py', який автоматично знайде потрібну версію
set PY_EXE=py

:: Встановлюємо правильне кодування для консолі, щоб емодзі не ламали запуск
set PYTHONIOENCODING=utf-8

:: 1. Запуск всієї системи (Бот + Веб-сервер стартують разом в main.py)
start cmd /k "title Rocket Lab System && echo Starting Bot and Flask... && set PYTHONPATH=. && %PY_EXE% -m app.bot.main"

:: 2. Запуск тунелю ngrok
start cmd /k "title Ngrok Tunnel && echo Starting Ngrok... && ngrok http --domain=kevin-substructural-luz.ngrok-free.dev 8000"

echo All services launched!
pause