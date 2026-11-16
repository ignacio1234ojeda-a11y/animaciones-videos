#!/bin/bash
# One-shot setup for a fresh workspace. Run from the engine folder: bash setup.sh
# Downloads the Kokoro voice + subtitle font (allowed hosts), creates work dirs. Prints OK when ready.
set -e
cd "$(dirname "$0")"
mkdir -p vo qa out
get() { [ -s "$2" ] || curl -sSL -o "$2" "$1"; }
get https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/onnx/model_quantized.onnx model_quantized.onnx &
get https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/am_puck.bin am_puck.bin &
get https://huggingface.co/hexgrad/Kokoro-82M/resolve/main/config.json config.json &
get https://raw.githubusercontent.com/hexgrad/misaki/main/misaki/data/us_gold.json us_gold.json &
get https://raw.githubusercontent.com/hexgrad/misaki/main/misaki/data/us_silver.json us_silver.json &
wait
if ! fc-list | grep -qi "Poppins.*Bold Italic"; then
  mkdir -p ~/.fonts && curl -sSL -o ~/.fonts/Poppins-BoldItalic.ttf https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/Poppins-BoldItalic.ttf && fc-cache -f >/dev/null
fi
python3 -c "import playwright, cv2, onnxruntime, scipy, PIL, numpy" 2>/dev/null || pip install -q --break-system-packages playwright opencv-python-headless onnxruntime scipy pillow numpy
[ -x /usr/bin/google-chrome ] || echo "WARN: no /usr/bin/google-chrome"
ls -la model_quantized.onnx am_puck.bin config.json us_gold.json us_silver.json >/dev/null && echo OK
