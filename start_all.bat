@echo off
echo =========================================
echo         Starting Rocket Lab System...
echo =========================================
echo _____________@@__@_@@@
echo _____________@__@@_____@
echo ____________@@_@__@_____@
echo ___________@@@_____@@___@@@@@
echo __________@@@@______@@_@____@@
echo _________@@@@_______@@______@_@
echo _________@@@@_______@_______@
echo _________@@@@@_____@_______@
echo __________@@@@@____@______@
echo ___________@@@@@@@______@
echo __@@@_________@@@@@_@
echo @@@@@@@________@@
echo _@@@@@@@_______@
echo __@@@@@@_______@@
echo ___@@_____@_____@
echo ____@______@____@_____@_@@
echo _______@@@@_@__@@_@_@@@@@
echo _____@@@@@@_@_@@__@@@@@@@
echo ____@@@@@@@__@@______@@@@@
echo ____@@@@@_____@_________@@@
echo ____@@_________@__________@
echo _____@_________@
set PY_EXE=py

set PYTHONIOENCODING=utf-8

start cmd /k "title Rocket Lab System && echo Starting Bot and Flask... && set PYTHONPATH=. && %PY_EXE% -m app.bot.main"

start cmd /k "title Ngrok Tunnel && echo Starting Ngrok... && ngrok http --domain=kevin-substructural-luz.ngrok-free.dev 8000"

echo All services launched!
pause