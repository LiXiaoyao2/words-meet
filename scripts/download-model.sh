#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
dest="$root/models/bge-small-zh-v1.5"
revision=75c43b069aac4d136ba6bc1122f995fedcfd2781
base="https://huggingface.co/Xenova/bge-small-zh-v1.5/resolve/$revision"
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
fetch config.json d4193ead3a810fd694fa8a31d7fc72fbaebc0668b603e398734bf2f6538ff42f
fetch special_tokens_map.json b6d346be366a7d1d48332dbc9fdf3bf8960b5d879522b7799ddba59e76237ee3
fetch tokenizer.json 48cea5d44424912a6fd1ea647bf4fe50b55ab8b1e5879c3275f80e339e8fae26
fetch tokenizer_config.json e6f3b96db926a37d4039995fbf5ad17de158dfb8f6343d607e4dbaad18d75f5a
fetch onnx/model_quantized.onnx 15b717c382bcb518ba457b93ea6850ede7f4f1cd8937454aa06972366cd19bcc
