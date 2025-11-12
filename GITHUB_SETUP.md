# GitHub連携とNDKビルドの手順

## ステップ1: GitHubリポジトリの作成

### 1-1. GitHubにアクセス

1. https://github.com にアクセスしてログイン
2. 右上の「+」アイコン → 「New repository」をクリック

### 1-2. リポジトリ設定

以下のように設定:

- **Repository name**: `jacic-hash-monaca-plugin` (または任意の名前)
- **Description**: `JACIC Hash Cordova Plugin for Monaca`
- **Public** または **Private**: どちらでも可
- ⚠️ **重要**: 以下のチェックボックスは**すべて外す**:
  - ❌ Add a README file
  - ❌ Add .gitignore
  - ❌ Choose a license

**理由**: 空のリポジトリを作成する必要があるため

「**Create repository**」をクリック

### 1-3. リポジトリURLを確認

作成後に表示されるURLをメモ（例）:
```
https://github.com/YOUR_USERNAME/jacic-hash-monaca-plugin.git
```

---

## ステップ2: ローカルでGit設定

MonacaSampleディレクトリで以下を実行:

### 2-1. Gitの初期化と設定

```bash
cd "c:\Users\user\Dropbox\10案件\ネスペ\J-COMCIA資料\信憑性確認(改ざん検知機能)\ライブラリ\DCPMI対応版\サンプルプログラム\MonacaSample"

# Git初期化（既に実行済みの場合はスキップ）
git init

# Gitユーザー設定（初回のみ）
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2-2. .gitignoreの作成（重要）

大きなファイルや不要なファイルを除外:

```bash
# MonacaSampleディレクトリで実行
cat > .gitignore << 'EOL'
# Node modules
node_modules/
sample-app/node_modules/

# Build artifacts
cordova-plugin-jacic-hash/src/android/jni/obj/
cordova-plugin-jacic-hash/src/android/jni/libs/

# Platform builds
sample-app/platforms/
sample-app/plugins/

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Monaca
.monaca/
EOL
```

### 2-3. ファイルをステージング

```bash
# すべてのファイルを追加
git add .

# 追加されたファイルを確認
git status
```

### 2-4. 初回コミット

```bash
git commit -m "Initial commit: JACIC Hash Plugin with NDK build setup"
```

---

## ステップ3: GitHubにプッシュ

### 3-1. リモートリポジトリを追加

⚠️ **YOUR_USERNAMEとYOUR_REPO_NAMEを実際の値に置き換えてください**

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 確認
git remote -v
```

### 3-2. ブランチ名を確認・変更

```bash
# 現在のブランチを確認
git branch

# mainブランチに変更（必要な場合）
git branch -M main
```

### 3-3. プッシュ

```bash
# GitHubにプッシュ
git push -u origin main
```

**認証が求められた場合**:
- **Username**: GitHubのユーザー名
- **Password**: GitHubのパスワード（または Personal Access Token）

**Personal Access Tokenが必要な場合**:
1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 「Generate new token」をクリック
3. `repo` スコープにチェック
4. 生成されたトークンをパスワード欄に入力

---

## ステップ4: GitHub Actionsの自動実行

プッシュが完了すると、GitHub Actionsが自動的にトリガーされます。

### 4-1. 実行状況を確認

1. GitHubリポジトリページにアクセス
2. 「**Actions**」タブをクリック
3. 「**Build Android NDK Libraries**」ワークフローをクリック
4. 実行状況を確認（約5-10分）

### 4-2. ビルド結果の確認

ワークフローが完成したら:

#### 方法A: Artifactsからダウンロード

1. 完了したワークフロー実行をクリック
2. 「**Artifacts**」セクションを見つける
3. `android-native-libs` をクリックしてダウンロード
4. ZIPを解凍して `cordova-plugin-jacic-hash/src/android/libs/` に配置

#### 方法B: 自動コミット（設定済み）

ワークフローが自動的に以下を実行:
- ビルド済み.soファイルをリポジトリにコミット
- `cordova-plugin-jacic-hash/src/android/libs/` に配置

最新のコミットをプルして取得:

```bash
git pull origin main
```

---

## ステップ5: plugin.xmlの更新

### 5-1. コメントを外す

`cordova-plugin-jacic-hash/plugin.xml` を開いて、以下のコメントを外します:

**変更前:**
```xml
<!-- Prebuilt native libraries for Monaca cloud build -->
<!-- Uncomment these lines if you have prebuilt .so files:
<lib-file src="src/android/libs/armeabi-v7a/libjacic-hash-lib.so" arch="armeabi-v7a" />
<lib-file src="src/android/libs/arm64-v8a/libjacic-hash-lib.so" arch="arm64-v8a" />
<lib-file src="src/android/libs/x86/libjacic-hash-lib.so" arch="x86" />
<lib-file src="src/android/libs/x86_64/libjacic-hash-lib.so" arch="x86_64" />
-->
```

**変更後:**
```xml
<!-- Prebuilt native libraries for Monaca cloud build -->
<lib-file src="src/android/libs/armeabi-v7a/libjacic-hash-lib.so" arch="armeabi-v7a" />
<lib-file src="src/android/libs/arm64-v8a/libjacic-hash-lib.so" arch="arm64-v8a" />
<lib-file src="src/android/libs/x86/libjacic-hash-lib.so" arch="x86" />
<lib-file src="src/android/libs/x86_64/libjacic-hash-lib.so" arch="x86_64" />
```

### 5-2. 変更をコミット

```bash
git add cordova-plugin-jacic-hash/plugin.xml
git commit -m "Enable prebuilt native libraries"
git push origin main
```

---

## ステップ6: Monacaプロジェクトで使用

### 6-1. プラグインを再インストール

```bash
cd sample-app

# 既存のプラグインを削除
monaca plugin remove cordova-plugin-jacic-hash

# 最新版を追加
monaca plugin add ../cordova-plugin-jacic-hash

# インストール確認
monaca plugin list
```

### 6-2. ビルドとテスト

```bash
# Monacaでビルド
monaca remote build android

# または
monaca debug
```

---

## トラブルシューティング

### エラー: `fatal: remote origin already exists`

```bash
# 既存のリモートを削除
git remote remove origin

# 再度追加
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

### エラー: `Authentication failed`

Personal Access Token (PAT) を使用:

1. GitHub → Settings → Developer settings → Personal access tokens
2. 「Generate new token (classic)」
3. `repo` にチェック
4. トークンをコピー
5. パスワード欄にトークンを入力

### GitHub Actionsが実行されない

1. リポジトリの「Actions」タブを確認
2. Actionsが有効になっているか確認
3. `.github/workflows/build-ndk.yml` が正しくプッシュされているか確認:

```bash
git ls-files .github/workflows/
```

### ビルドに失敗する

1. GitHub Actionsのログを確認
2. エラーメッセージを確認
3. 必要に応じて `.github/workflows/build-ndk.yml` を修正

---

## 完了チェックリスト

- [ ] GitHubリポジトリを作成
- [ ] ローカルでgit init実行
- [ ] .gitignoreを作成
- [ ] git add . でファイルを追加
- [ ] git commit で初回コミット
- [ ] git remote add でリモート追加
- [ ] git push でプッシュ
- [ ] GitHub Actionsが実行完了
- [ ] ビルド済み.soファイルを取得
- [ ] plugin.xmlのコメントを外す
- [ ] Monacaプラグインを再インストール
- [ ] Monacaビルドが成功

おめでとうございます！これでMonacaクラウドビルドでネイティブライブラリが使えるようになりました。
