# JACIC Hash Monaca Plugin

MonacaでJPEG画像のAPP5領域にハッシュ値を埋め込むためのCordovaプラグインとサンプルアプリです。

## プロジェクト構成

```
MonacaSample/
├── cordova-plugin-jacic-hash/    # Cordovaカスタムプラグイン
├── sample-app/                    # サンプルアプリケーション
├── CLAUDE.md                      # 詳細な技術ドキュメント
└── README.md                      # このファイル
```

## クイックスタート

### 1. Monaca Web IDEでの設定（重要）

**Android 11以降のビルドに必要な設定:**

1. Monaca IDEにログイン
2. プロジェクトを開く
3. **設定 → Androidアプリ設定 → スプラッシュスクリーン**
4. 以下のいずれかを選択:
   - **「スプラッシュスクリーンなし」** (推奨)
   - または「オートリサイズモード」でデフォルト画像を使用

### 2. プラグインのインストール

```bash
cd sample-app
monaca plugin add ../cordova-plugin-jacic-hash
monaca plugin add cordova-plugin-file
monaca plugin add cordova-plugin-camera
monaca plugin add cordova-plugin-whitelist
```

### 3. アプリの実行

```bash
monaca debug
```

## 機能

- **写真撮影**: カメラで撮影した写真にハッシュ値を自動埋め込み
- **画像選択**: フォトライブラリから選択した画像にハッシュ値を自動埋め込み
- **writeHash API**: JPEG画像にハッシュ値を埋め込む（プログラム用API）

## サンプルアプリの使い方

1. アプリを起動
2. 「写真を撮影」または「フォトライブラリから選択」をタップ
3. 画像を選択/撮影すると**自動的にハッシュ値が埋め込まれます**
4. 結果が表示されます

## API使用例

```javascript
// プログラムからハッシュ値を埋め込む
JACICHash.writeHash(
    sourceFilePath,
    destFilePath,
    function(result) {
        console.log('Success:', result);
    },
    function(error) {
        console.error('Error:', error);
    }
);
```

## 対応プラットフォーム

- iOS 12.0+
- Android 5.0+ (API Level 21+)

## ディレクトリ構造

### cordova-plugin-jacic-hash/

Cordovaカスタムプラグイン本体

- `plugin.xml`: プラグイン定義
- `www/JACICHash.js`: JavaScript API
- `src/ios/`: iOS実装 (Objective-C + C)
- `src/android/`: Android実装 (Java + JNI + C)

### sample-app/

Monacaサンプルアプリケーション

- `www/index.html`: メインUI
- `www/js/app.js`: アプリロジック
- `www/config.xml`: Cordova設定（Monaca仕様でwww配下）

## 詳細ドキュメント

技術的な詳細、API仕様、トラブルシューティングについては [CLAUDE.md](CLAUDE.md) をご覧ください。

## ライセンス

Apache License 2.0

## 作成者

DATT JAPAN Inc.
