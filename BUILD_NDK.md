# Android NDKライブラリのビルド手順

このドキュメントでは、JACIC Hash Pluginのネイティブライブラリ(.so)をビルドする方法を説明します。

## 目次

1. [GitHub Actionsでビルド（推奨・無料）](#方法1-github-actionsでビルド)
2. [Dockerでビルド（ローカル/クラウド）](#方法2-dockerでビルド)
3. [ローカル環境でビルド](#方法3-ローカル環境でビルド)

---

## 方法1: GitHub Actionsでビルド（推奨・無料）

GitHubリポジトリを使用している場合、完全無料でクラウドビルドできます。

### 手順:

1. **GitHubリポジトリにプッシュ**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **GitHub Actionsワークフローが自動実行される**
   - `.github/workflows/build-ndk.yml` が既に含まれています
   - リポジトリの "Actions" タブで実行状況を確認

3. **手動実行する場合**
   - GitHubリポジトリの "Actions" タブを開く
   - "Build Android NDK Libraries" ワークフローを選択
   - "Run workflow" ボタンをクリック

4. **ビルド済み.soファイルをダウンロード**
   - ワークフロー実行が完了したら "Artifacts" セクションから `android-native-libs` をダウンロード
   - または、自動的にリポジトリにコミットされます

### 利点:
- ✅ 完全無料（月2000分の無料枠）
- ✅ 環境構築不要
- ✅ 自動化可能
- ✅ 複数アーキテクチャを同時ビルド

---

## 方法2: Dockerでビルド

Docker環境があれば、ローカルまたはクラウド（AWS, GCP, Azure等）でビルドできます。

### 2-1. ローカルDockerでビルド

**前提条件:**
- Docker Desktopがインストール済み

**手順:**

1. **Dockerイメージをビルド**
   ```bash
   cd cordova-plugin-jacic-hash
   docker build -t android-ndk-builder -f Dockerfile.ndk .
   ```

2. **コンテナ内でNDKビルドを実行**
   ```bash
   docker run --rm -v "$(pwd):/workspace" android-ndk-builder bash -c "cd /workspace/src/android/jni && ndk-build && /workspace/build-ndk.sh"
   ```

3. **ビルド結果を確認**
   ```bash
   ls -R src/android/libs/
   ```

### 2-2. Google Cloud Shellでビルド（無料）

**手順:**

1. **Google Cloud Consoleにアクセス**
   - https://console.cloud.google.com/
   - 右上の "Cloud Shell をアクティブにする" をクリック

2. **プロジェクトをアップロード**
   ```bash
   # Cloud Shellで実行
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO/cordova-plugin-jacic-hash
   ```

3. **Dockerイメージをビルドして実行**
   ```bash
   docker build -t android-ndk-builder -f Dockerfile.ndk .
   docker run --rm -v "$(pwd):/workspace" android-ndk-builder bash -c "cd /workspace && ./build-ndk.sh"
   ```

4. **ビルド結果をダウンロード**
   ```bash
   # Cloud Shellから圧縮してダウンロード
   cd src/android
   tar -czf libs.tar.gz libs/
   cloudshell download libs.tar.gz
   ```

### 2-3. AWS Cloud9でビルド

**手順:**

1. **AWS Cloud9環境を作成**
   - AWS Consoleから Cloud9 を開く
   - "Create environment" をクリック
   - t2.micro (無料枠) を選択

2. **NDKをインストール**
   ```bash
   # Cloud9ターミナルで実行
   wget https://dl.google.com/android/repository/android-ndk-r25c-linux.zip
   unzip android-ndk-r25c-linux.zip
   export PATH=$PATH:$(pwd)/android-ndk-r25c
   ```

3. **プロジェクトをクローンしてビルド**
   ```bash
   git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
   cd YOUR_REPO/cordova-plugin-jacic-hash
   chmod +x build-ndk.sh
   ./build-ndk.sh
   ```

---

## 方法3: ローカル環境でビルド

### Windows (WSL2使用)

1. **WSL2とUbuntuをインストール**
   ```powershell
   wsl --install
   ```

2. **Ubuntu内でNDKをインストール**
   ```bash
   cd ~
   wget https://dl.google.com/android/repository/android-ndk-r25c-linux.zip
   unzip android-ndk-r25c-linux.zip
   export PATH=$PATH:~/android-ndk-r25c
   echo 'export PATH=$PATH:~/android-ndk-r25c' >> ~/.bashrc
   ```

3. **ビルド実行**
   ```bash
   cd /mnt/c/Users/user/Dropbox/.../MonacaSample/cordova-plugin-jacic-hash
   chmod +x build-ndk.sh
   ./build-ndk.sh
   ```

### macOS

1. **Homebrewをインストール**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **NDKをインストール**
   ```bash
   brew install android-ndk
   ```

3. **ビルド実行**
   ```bash
   cd ~/path/to/cordova-plugin-jacic-hash
   chmod +x build-ndk.sh
   ./build-ndk.sh
   ```

### Linux

1. **NDKをダウンロード**
   ```bash
   wget https://dl.google.com/android/repository/android-ndk-r25c-linux.zip
   unzip android-ndk-r25c-linux.zip -d ~/
   export PATH=$PATH:~/android-ndk-r25c
   ```

2. **ビルド実行**
   ```bash
   cd ~/path/to/cordova-plugin-jacic-hash
   chmod +x build-ndk.sh
   ./build-ndk.sh
   ```

---

## ビルド後の作業

### 1. ビルド結果の確認

```bash
ls -R src/android/libs/
```

以下のような構造になっているはずです:
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

### 2. plugin.xmlの更新

`plugin.xml` の `<lib-file>` タグのコメントを外します:

```xml
<!-- Prebuilt native libraries for Monaca cloud build -->
<lib-file src="src/android/libs/armeabi-v7a/libjacic-hash-lib.so" arch="armeabi-v7a" />
<lib-file src="src/android/libs/arm64-v8a/libjacic-hash-lib.so" arch="arm64-v8a" />
<lib-file src="src/android/libs/x86/libjacic-hash-lib.so" arch="x86" />
<lib-file src="src/android/libs/x86_64/libjacic-hash-lib.so" arch="x86_64" />
```

### 3. Monacaプロジェクトで使用

```bash
cd ../sample-app
monaca plugin remove cordova-plugin-jacic-hash
monaca plugin add ../cordova-plugin-jacic-hash
```

これで、事前ビルド済みの.soファイルがMonacaクラウドビルドで使用されます。

---

## トラブルシューティング

### エラー: `ndk-build: command not found`

NDKのPATHが設定されていません。以下を実行:

```bash
export PATH=$PATH:/path/to/android-ndk-r25c
```

### エラー: `Permission denied`

スクリプトに実行権限がありません:

```bash
chmod +x build-ndk.sh
```

### ビルドは成功するが.soファイルが見つからない

`obj/local/` ディレクトリを確認:

```bash
ls -R src/android/jni/obj/local/
```

---

## 推奨方法のまとめ

| 方法 | コスト | 難易度 | 推奨度 |
|------|--------|--------|--------|
| **GitHub Actions** | 無料 | ★☆☆☆☆ | ⭐⭐⭐⭐⭐ |
| Google Cloud Shell | 無料 | ★★☆☆☆ | ⭐⭐⭐⭐☆ |
| Docker (ローカル) | 無料 | ★★★☆☆ | ⭐⭐⭐☆☆ |
| WSL2 (Windows) | 無料 | ★★★☆☆ | ⭐⭐⭐☆☆ |
| AWS Cloud9 | 有料 | ★★★★☆ | ⭐⭐☆☆☆ |

**初心者の方には GitHub Actions を強く推奨します。**
