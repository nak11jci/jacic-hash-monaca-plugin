#!/bin/bash

# Android NDKビルドスクリプト
# 使い方: ./build-ndk.sh

set -e

echo "=========================================="
echo "Android NDK Build Script"
echo "=========================================="

# スクリプトのディレクトリを取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
JNI_DIR="${SCRIPT_DIR}/src/android/jni"
LIBS_DIR="${SCRIPT_DIR}/src/android/libs"

echo "JNI Directory: ${JNI_DIR}"
echo "Libs Directory: ${LIBS_DIR}"

# 既存のlibsディレクトリをクリーンアップ
if [ -d "${LIBS_DIR}" ]; then
    echo "Cleaning existing libs directory..."
    rm -rf "${LIBS_DIR}"
fi

# JNIディレクトリに移動
cd "${JNI_DIR}"

# NDKビルド実行
echo "Running ndk-build..."
ndk-build NDK_PROJECT_PATH=. APP_BUILD_SCRIPT=Android.mk

# ビルド結果をlibsディレクトリにコピー
echo "Copying built libraries..."
mkdir -p "${LIBS_DIR}"

# objディレクトリから各アーキテクチャのlibsをコピー
for arch in armeabi-v7a arm64-v8a x86 x86_64; do
    if [ -d "obj/local/${arch}" ]; then
        echo "Copying ${arch}..."
        mkdir -p "${LIBS_DIR}/${arch}"
        cp "obj/local/${arch}/libjacic-hash-lib.so" "${LIBS_DIR}/${arch}/"
    fi
done

# クリーンアップ
echo "Cleaning build artifacts..."
rm -rf obj libs

echo "=========================================="
echo "Build completed successfully!"
echo "=========================================="
echo "Built libraries are in: ${LIBS_DIR}"
ls -R "${LIBS_DIR}"
