#!/usr/bin/env bash
# Озвучка роликов Milana голосом Яндекс SpeechKit (API v1).
# Ключ НЕ хранить в файлах и не коммитить — только в переменной окружения:
#   export YC_API_KEY="ваш_ключ"
#   bash yandex_tts.sh lines-promo.txt out-promo        # или lines-app.txt out-app
# Голос по умолчанию marina (friendly). Другой: VOICE=jane EMOTION=good bash yandex_tts.sh ...
# Ударение: «+» перед ударной гласной (Мил+ана). Числа писать словами.
set -euo pipefail
LINES=${1:?файл с репликами}; OUT=${2:-voice-out}
VOICE=${VOICE:-marina}; EMOTION=${EMOTION:-friendly}; SPEED=${SPEED:-1.0}
: "${YC_API_KEY:?нужна переменная YC_API_KEY}"
mkdir -p "$OUT"
while IFS='|' read -r key text; do
  [ -z "$key" ] && continue
  curl -sS --fail -X POST "https://tts.api.cloud.yandex.net/speech/v1/tts:synthesize" \
    -H "Authorization: Api-Key ${YC_API_KEY}" \
    --data-urlencode "text=${text}" -d "lang=ru-RU" -d "voice=${VOICE}" -d "emotion=${EMOTION}" \
    -d "speed=${SPEED}" -d "format=mp3" -o "$OUT/${key}.mp3"
  echo "готово: $OUT/${key}.mp3"
done < "$LINES"
