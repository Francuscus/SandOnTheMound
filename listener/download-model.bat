@echo off
echo ==========================================
echo   Downloading Whisper Model (base.en)
echo   This is a one-time download (~150MB)
echo ==========================================
echo.

mkdir C:\whisper\models 2>nul

echo Downloading model file...
curl -L -o C:\whisper\models\ggml-base.en.bin https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin

if exist C:\whisper\models\ggml-base.en.bin (
    echo.
    echo SUCCESS! Model downloaded to C:\whisper\models\ggml-base.en.bin
    echo You're all set!
) else (
    echo.
    echo FAILED - download didn't work.
    echo Try downloading manually from:
    echo https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-base.en.bin
    echo Save it to: C:\whisper\models\ggml-base.en.bin
)

echo.
pause
