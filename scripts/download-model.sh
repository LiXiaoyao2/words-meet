#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
dest="$root/models/paraphrase-multilingual-MiniLM-L12-v2"
revision=2c4055b12046f11709e9df2c122e59ffbdc2f900
base="https://huggingface.co/Xenova/paraphrase-multilingual-MiniLM-L12-v2/resolve/$revision"
mkdir -p "$dest/onnx"
fetch() {
  file=$1 expected=$2
  if [ -f "$dest/$file" ] && printf '%s  %s\n' "$expected" "$dest/$file" | sha256sum -c - >/dev/null 2>&1; then
    printf '已存在：%s\n' "$file"; return
  fi
  printf '下载：%s\n' "$file"
  curl -fL --retry 3 --connect-timeout 20 "$base/$file" -o "$dest/$file.part"
  if ! printf '%s  %s\n' "$expected" "$dest/$file.part" | sha256sum -c -; then rm -f "$dest/$file.part"; return 1; fi
  mv "$dest/$file.part" "$dest/$file"
}
fetch config.json 05b570bff786faa5c4604152aa16f19f77ed6dfc31e47dd0f3dd987078693ac7
fetch special_tokens_map.json 06e405a36dfe4b9604f484f6a1e619af1a7f7d09e34a8555eb0b77b66318067f
fetch tokenizer.json b60b6b43406a48bf3638526314f3d232d97058bc93472ff2de930d43686fa441
fetch tokenizer_config.json 3f5961b9ac86288cccdb97f32fb848d6187c78e1603958c53f3ea1f296b7d8a2
fetch onnx/model_quantized.onnx 66fc00f5f29afcaff34092e1bdd20008ca3918265a82fb9695a551e510cc4ebc
