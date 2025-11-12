# Android NDKライブラリのビルド手順

このドキュメントでは、JACIC Hash Pluginのネイティブライブラリ(.so)をビルドする方法を説明します。

## GitHub Actionsで自動ビルド（推奨）

このプラグインは**GitHub Actions**を使用して自動的にネイティブライブラリをビルドします。

### 前提条件

- GitHubアカウント
- GitHubリポジトリ（PublicまたはPrivate）

### 手順

#### 1. GitHubリポジトリの作成とプッシュ

詳細な手順は [GITHUB_SETUP.md](../../GITHUB_SETUP.md) を参照してください。

```bash
# リポジトリの初期化
git init
git add .
git commit -m "Initial commit: JACIC Hash Plugin"

# GitHubリポジトリに接続
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

#### 2. GitHub Actionsの自動実行

プッシュすると、`.github/workflows/build-ndk.yml` が自動的に実行されます。

**トリガー条件:**
- `cordova-plugin-jacic-hash/src/android/jni/` 配下のファイルが変更された時
- 手動実行（Actions タブから "Run workflow" をクリック）

#### 3. ビルド状況の確認

1. GitHubリポジトリページを開く
2. **「Actions」** タブをクリック
3. **「Build Android NDK Libraries」** ワークフローを選択
4. 実行状況を確認（約5-10分）

#### 4. ビルド結果の取得

**方法A: 自動コミット（推奨）**

ワークフローが完了すると、ビルド済み.soファイルが自動的にリポジトリにコミットされます:

```bash
# 最新の変更をプル
git pull origin main
```

**方法B: Artifactsからダウンロード**

1. 完了したワークフロー実行をクリック
2. **「Artifacts」** セクションから `android-native-libs` をダウンロード
3. ZIPを解凍して `cordova-plugin-jacic-hash/src/android/libs/` に配置

### ビルドされるファイル

```
src/android/libs/
├── armeabi-v7a/
│   └── libjacic-hash-lib.so
├── arm64-v8a/
│   └── libjacic-hash-lib.so
├── x86/
│   └── libjacic-hash-lib.so
└── x86_64/
    └── libjacic-hash-lib.so
```

### GitHub Actionsの利点

- ✅ **完全無料**（月2000分の無料枠、Privateリポジトリでも可）
- ✅ **環境構築不要**（NDKインストール不要）
- ✅ **自動化**（コード変更時に自動ビルド）
- ✅ **複数アーキテクチャ対応**（4つのアーキテクチャを同時ビルド）
- ✅ **クリーンな環境**（毎回新しい環境でビルド）

---

## ワークフローの詳細

### ワークフローファイル

`.github/workflows/build-ndk.yml`

```yaml
name: Build Android NDK Libraries

on:
  workflow_dispatch:  # 手動実行を許可
  push:
    paths:
      - 'cordova-plugin-jacic-hash/src/android/jni/**'

permissions:
  contents: write  # ビルド結果をコミットするために必要

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v4

    - name: Setup NDK
      uses: nttld/setup-ndk@v1
      with:
        ndk-version: r25c
        add-to-path: true

    - name: Build native libraries
      run: |
        cd cordova-plugin-jacic-hash/src/android/jni
        ndk-build NDK_PROJECT_PATH=. APP_BUILD_SCRIPT=Android.mk

    - name: Create libs directory structure
      run: |
        mkdir -p cordova-plugin-jacic-hash/src/android/libs
        cp -r cordova-plugin-jacic-hash/src/android/jni/obj/local/* cordova-plugin-jacic-hash/src/android/libs/

    - name: Upload built libraries
      uses: actions/upload-artifact@v4
      with:
        name: android-native-libs
        path: cordova-plugin-jacic-hash/src/android/libs/
        retention-days: 30

    - name: Commit and push if changed
      run: |
        git config --global user.name 'GitHub Actions'
        git config --global user.email 'actions@github.com'
        git add cordova-plugin-jacic-hash/src/android/libs/
        git diff --quiet && git diff --staged --quiet || (git commit -m "Update prebuilt NDK libraries" && git push)
```

### 使用しているビルド設定

**Android.mk** (`src/android/jni/Android.mk`):
```makefile
LOCAL_PATH := $(call my-dir)
include $(CLEAR_VARS)

LOCAL_MODULE := jacic-hash-lib

LOCAL_SRC_FILES := \
    jacic_hash_jni.cpp \
    JACICHashLib/writeHashLib.c \
    JACICHashLib/app1.c \
    JACICHashLib/app5.c \
    JACICHashLib/common.c \
    JACICHashLib/exif.c \
    JACICHashLib/sha256.c

LOCAL_C_INCLUDES := $(LOCAL_PATH)/JACICHashLib
LOCAL_LDLIBS := -llog

include $(BUILD_SHARED_LIBRARY)
```

**Application.mk** (`src/android/jni/Application.mk`):
```makefile
APP_ABI := armeabi-v7a arm64-v8a x86 x86_64
APP_PLATFORM := android-21
APP_STL := c++_shared
```

---

## Monacaプロジェクトでの使用

### 1. ビルド済みライブラリの確認

```bash
ls -R cordova-plugin-jacic-hash/src/android/libs/
```

### 2. plugin.xmlの確認

`plugin.xml` の `<lib-file>` タグが有効になっていることを確認:

```xml
<!-- Prebuilt native libraries (built by GitHub Actions) -->
<lib-file src="src/android/libs/armeabi-v7a/libjacic-hash-lib.so" arch="armeabi-v7a" />
<lib-file src="src/android/libs/arm64-v8a/libjacic-hash-lib.so" arch="arm64-v8a" />
<lib-file src="src/android/libs/x86/libjacic-hash-lib.so" arch="x86" />
<lib-file src="src/android/libs/x86_64/libjacic-hash-lib.so" arch="x86_64" />
```

### 3. プラグインのインストール

```bash
cd sample-app

# 既存のプラグインを削除（必要に応じて）
monaca plugin remove cordova-plugin-jacic-hash

# 最新版を追加
monaca plugin add ../cordova-plugin-jacic-hash

# インストール確認
monaca plugin list
```

### 4. Monacaビルド

```bash
# Androidビルド
monaca remote build android

# またはデバッグモード
monaca debug
```

---

## トラブルシューティング

### GitHub Actionsが実行されない

**確認事項:**
1. リポジトリの「Actions」タブでActionsが有効になっているか
2. `.github/workflows/build-ndk.yml` が正しくプッシュされているか確認:
   ```bash
   git ls-files .github/workflows/
   ```
3. Privateリポジトリの場合、`permissions: contents: write` が設定されているか

### ビルドエラーが発生する

1. GitHub Actionsのログを確認
2. エラーメッセージの内容を確認
3. `src/android/jni/` 配下のソースファイルに問題がないか確認

### 403 Permission Denied エラー

Privateリポジトリで発生する場合、ワークフローに `permissions: contents: write` を追加:

```yaml
permissions:
  contents: write
```

### 手動実行したい

1. GitHubリポジトリの「Actions」タブを開く
2. 「Build Android NDK Libraries」ワークフローを選択
3. 右上の「Run workflow」ボタンをクリック
4. ブランチを選択して「Run workflow」を実行

---

## まとめ

- **GitHub Actions**を使用することで、ローカル環境にNDKをインストールする必要がありません
- ソースコードを変更してプッシュするだけで、自動的にビルドが実行されます
- ビルド済みの.soファイルはMonacaクラウドビルドでそのまま使用できます
- 完全無料で使用できます（月2000分の無料枠）

詳細な初期セットアップ手順については、[GITHUB_SETUP.md](../../GITHUB_SETUP.md) を参照してください。
