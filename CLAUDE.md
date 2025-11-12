# JACIC Hash Monaca Plugin - 技術ドキュメント

## 概要

このプロジェクトは、JACICHashLibモジュールをMonacaから利用できるようにしたCordovaカスタムプラグインとサンプルアプリケーションです。

JACICHashLibは、JPEGファイルのAPP5領域にハッシュ値を埋め込むネイティブライブラリです。

**注意:** このプラグインは `writeHash` 機能のみを提供します。ハッシュ検証（checkHash）機能は含まれていません。

## プロジェクト構成

```
MonacaSample/
├── cordova-plugin-jacic-hash/        # Cordovaカスタムプラグイン
│   ├── plugin.xml                     # プラグイン定義ファイル
│   ├── www/
│   │   └── JACICHash.js               # JavaScript インターフェース
│   ├── src/
│   │   ├── ios/                       # iOS実装
│   │   │   ├── CDVJACICHash.h
│   │   │   ├── CDVJACICHash.m
│   │   │   └── JACICHashLib/          # JACICネイティブライブラリ (C言語)
│   │   │       ├── writeHashLib.h/c
│   │   │       ├── app1.h/c
│   │   │       ├── app5.h/c
│   │   │       ├── common.h/c
│   │   │       ├── exif.h/c
│   │   │       └── sha256.h/c
│   │   └── android/                   # Android実装
│   │       ├── JACICHashPlugin.java   # Javaラッパー
│   │       └── jni/                   # JNI実装
│   │           ├── jacic_hash_jni.cpp
│   │           ├── Android.mk         # NDKビルド設定 (推奨)
│   │           ├── Application.mk     # NDKアプリケーション設定
│   │           ├── CMakeLists.txt     # CMakeビルド設定 (代替)
│   │           └── JACICHashLib/      # JACICネイティブライブラリ (C言語)
│   │               ├── writeHashLib.h/c
│   │               ├── app1.h/c
│   │               ├── app5.h/c
│   │               ├── common.h/c
│   │               ├── exif.h/c
│   │               └── sha256.h/c
│
└── sample-app/                        # サンプルアプリケーション
    ├── package.json
    └── www/
        ├── config.xml                 # Cordova設定ファイル (Monaca仕様)
        ├── index.html                 # メインHTML
        ├── css/
        │   └── style.css
        └── js/
            └── app.js                 # アプリケーションロジック
```

## プラグインのアーキテクチャ

### レイヤー構造

```
┌─────────────────────────────────────┐
│  Monaca Application (JavaScript)    │  ← サンプルアプリ (sample-app/)
├─────────────────────────────────────┤
│  JACICHash.js (Cordova JS Bridge)   │  ← JavaScript インターフェース
├─────────────────────────────────────┤
│  Platform Bridge                     │
│  ├─ iOS: CDVJACICHash (Obj-C)       │  ← Cordovaプラグインラッパー
│  └─ Android: JACICHashPlugin (Java) │
├─────────────────────────────────────┤
│  JNI Layer (Android only)            │
│  └─ jacic_hash_jni.cpp               │  ← JNIブリッジ
├─────────────────────────────────────┤
│  JACIC Hash Library (C言語)          │  ← オリジナルのネイティブライブラリ
│  - writeHashLib.c                    │
│  - app5.c (APP5セグメント処理)       │
│  - exif.c (EXIF処理)                 │
│  - sha256.c (ハッシュ計算)           │
│  - etc.                              │
└─────────────────────────────────────┘
```

## API仕様

### JavaScript API

#### JACICHash.writeHash(sourceFilePath, destFilePath, successCallback, errorCallback)

JPEGファイルにハッシュ値を埋め込みます。

**パラメータ:**
- `sourceFilePath` (String): 入力JPEGファイルパス
- `destFilePath` (String): 出力JPEGファイルパス
- `successCallback` (Function): 成功時のコールバック
- `errorCallback` (Function): エラー時のコールバック

**成功時の戻り値:**
```javascript
{
  code: 0,
  message: "Hash value written successfully",
  outputPath: "/path/to/output.jpg"
}
```

**エラーコード:**
| コード | 説明 |
|--------|------|
| -101 | 不正なパラメータ |
| -102 | 入力と出力が同じファイルパス |
| -201 | 入力ファイルが存在しない |
| -202 | 出力ファイルが既に存在する |
| -203 | ファイルオープン失敗 |
| -204 | ファイルサイズがゼロ |
| -205 | ファイル書き込み失敗 |
| -206 | ファイルクローズ失敗 |
| -301 | EXIFフォーマットが不正 |
| -302 | APP5セグメントが既に存在する |
| -307 | 日時情報が見つからない |
| -900 | その他のエラー |

## Monaca特有の注意事項

### config.xmlの配置

**重要:** Monacaでは`config.xml`を`www/`ディレクトリ配下に配置する必要があります。

```
sample-app/
└── www/
    ├── config.xml    ← Monaca仕様（www配下に必須）
    ├── index.html
    └── js/
```

標準的なCordovaプロジェクトではルートに配置しますが、Monacaのビルドシステムは`www/config.xml`を参照する設計になっています。この配置は設定で変更できません。

## セットアップ手順

### 1. Monaca Web IDEでの事前設定（必須）

**Android 11以降でビルドする場合の必須設定:**

1. Monaca IDEにログイン
2. プロジェクトを開く
3. **設定 → Androidアプリ設定 → スプラッシュスクリーン**
4. 以下のいずれかを選択:
   - **「スプラッシュスクリーンなし」** (最も簡単)
   - または「オートリサイズモード」を選択してデフォルト画像を使用

> **注意**: この設定を行わないと、Android Platform 11以降のビルドで以下のエラーが発生します:
> 「Android Platform 11 以降が設定されています。Androidアプリ設定画面にて、スプラッシュファイルをオートリサイズモードで設定してください。」

### 2. プラグインのインストール

Monacaプロジェクトにプラグインをインストールします。

**ローカルパスからのインストール:**
```bash
cd sample-app
monaca plugin add ../cordova-plugin-jacic-hash
```

または、Monaca IDEの場合:
1. Cordovaプラグインの管理 → カスタムプラグインの追加
2. プラグインのパスを指定: `../cordova-plugin-jacic-hash`

### 3. 必要な依存プラグインのインストール

```bash
monaca plugin add cordova-plugin-file
monaca plugin add cordova-plugin-camera
monaca plugin add cordova-plugin-whitelist
```

**注意:** サンプルアプリはCamera Pluginを使用して画像選択と撮影を行います。

### 4. サンプルアプリの実行

```bash
cd sample-app
monaca preview    # ブラウザプレビュー (プラグインは動作しません)
monaca debug      # デバイスでのデバッグ実行
```

## 使用例

### 基本的な使い方

```javascript
// Cordovaの初期化を待つ
document.addEventListener('deviceready', function() {
    // ハッシュ値の埋め込み
    JACICHash.writeHash(
        '/path/to/source.jpg',
        '/path/to/output.jpg',
        function(result) {
            console.log('Success:', result.message);
            console.log('Output:', result.outputPath);
        },
        function(error) {
            console.error('Error:', error.message);
            console.error('Code:', error.code);
        }
    );
});
```

### Camera Pluginを使用した実装例（推奨）

サンプルアプリでは、Camera Pluginを使用してフォトライブラリからの画像選択と写真撮影の両方に対応しています。

```javascript
// フォトライブラリから画像を選択
function onSelectFile() {
    navigator.camera.getPicture(
        function(imageURI) {
            // 画像選択成功 - 自動的にハッシュ埋め込み処理へ
            handleImageSelected(imageURI, 'selected');
        },
        function(error) {
            console.error('選択エラー:', error);
        },
        {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            mediaType: Camera.MediaType.PICTURE
        }
    );
}

// カメラで写真を撮影
function onTakePicture() {
    navigator.camera.getPicture(
        function(imageURI) {
            // 撮影成功 - 自動的にハッシュ埋め込み処理へ
            handleImageSelected(imageURI, 'captured');
        },
        function(error) {
            console.error('撮影エラー:', error);
        },
        {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.CAMERA,
            mediaType: Camera.MediaType.PICTURE,
            correctOrientation: true,
            saveToPhotoAlbum: true,
            encodingType: Camera.EncodingType.JPEG
        }
    );
}

// 画像選択/撮影後の共通処理
function handleImageSelected(imageURI, sourceType) {
    window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
        var sourcePath = fileEntry.nativeURL;

        // 出力パスを生成
        var timestamp = new Date().getTime();
        var outputFileName = 'JACIC_' + timestamp + '.jpg';

        window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(dirEntry) {
            var outputPath = dirEntry.nativeURL + outputFileName;

            // 自動的にハッシュ埋め込み実行
            JACICHash.writeHash(sourcePath, outputPath,
                function(result) {
                    console.log('ハッシュ埋め込み成功:', result);
                },
                function(error) {
                    console.error('ハッシュ埋め込み失敗:', error);
                }
            );
        });
    });
}
```

**サンプルアプリの動作フロー:**
1. ユーザーが「フォトライブラリから選択」または「写真を撮影」ボタンをクリック
2. Camera Pluginで画像を取得
3. 画像情報を表示
4. **自動的にハッシュ埋め込み処理を実行**（ボタンクリック不要）
5. 結果を表示

## ネイティブ実装の詳細

### iOS実装 (Objective-C)

[CDVJACICHash.m](cordova-plugin-jacic-hash/src/ios/CDVJACICHash.m:56)で、Cordovaのコマンドを受け取り、C言語のJACIC_WriteHashValue関数を呼び出します。

```objective-c
int result = JACIC_WriteHashValue([sourceFilePath UTF8String],
                                  [destFilePath UTF8String]);
```

### Android実装 (Java + JNI + C)

Androidでは3層構造で実装されています:

1. **Java層** ([JACICHashPlugin.java](cordova-plugin-jacic-hash/src/android/JACICHashPlugin.java))
   - Cordovaからの呼び出しを受け取る
   - ファイルパスのクリーニング（`file://`プレフィックス削除）
   - JNIメソッド呼び出し
   ```java
   String srcPath = sourceFilePath.replace("file://", "");
   String dstPath = destFilePath.replace("file://", "");
   int result = nativeWriteHash(srcPath, dstPath);
   ```

2. **JNI層** ([jacic_hash_jni.cpp](cordova-plugin-jacic-hash/src/android/jni/jacic_hash_jni.cpp))
   - JavaとC言語の橋渡し
   - Java StringをC文字列に変換
   - JACIC_WriteHashValue関数を呼び出し
   ```cpp
   const char *srcPath = env->GetStringUTFChars(sourceFilePath, NULL);
   const char *dstPath = env->GetStringUTFChars(destFilePath, NULL);
   int result = JACIC_WriteHashValue(srcPath, dstPath);
   ```

3. **C層** (JACICHashLib)
   - 実際のハッシュ計算とJPEG埋め込み処理

### Androidネイティブライブラリのビルド

ネイティブライブラリ (`libjacic-hash-lib.so`) のビルドには2つの方法を用意しています:

#### 1. Android.mk方式（推奨）

[Android.mk](cordova-plugin-jacic-hash/src/android/jni/Android.mk)と[Application.mk](cordova-plugin-jacic-hash/src/android/jni/Application.mk)を使用した従来のNDKビルド方式。Monacaや古いCordovaバージョンでの互換性が高いです。

**Android.mk の主要部分:**
```makefile
LOCAL_MODULE := jacic-hash-lib
LOCAL_SRC_FILES := \
    jacic_hash_jni.cpp \
    JACICHashLib/writeHashLib.c \
    JACICHashLib/app1.c \
    JACICHashLib/app5.c \
    JACICHashLib/common.c \
    JACICHashLib/exif.c \
    JACICHashLib/sha256.c
```

**Application.mk:**
```makefile
APP_ABI := armeabi-v7a arm64-v8a x86 x86_64
APP_PLATFORM := android-21
APP_STL := c++_shared
```

この設定により、複数のアーキテクチャ用のネイティブライブラリが自動的にビルドされます。

#### 2. CMake方式（代替）

[CMakeLists.txt](cordova-plugin-jacic-hash/src/android/jni/CMakeLists.txt)を使用した新しいビルド方式。

**主要部分:**
```cmake
add_library(jacic-hash-lib SHARED
    ${JNI_WRAPPER}
    ${JACIC_SOURCES}
)
target_link_libraries(jacic-hash-lib log)
```

[plugin.xml](cordova-plugin-jacic-hash/plugin.xml:89-97)で両方のビルドファイルを含めているため、ビルドシステムに応じて適切な方法が自動選択されます。

### JACIC Hash Library (C言語)

コアライブラリは以下の機能を提供:

- **writeHashLib.c**: メイン処理
- **app5.c**: APP5セグメントの読み書き
- **app1.c**: APP1セグメント (EXIF) 処理
- **exif.c**: EXIF情報の解析
- **sha256.c**: SHA-256ハッシュ計算
- **common.c**: 共通ユーティリティ

## ビルド設定

### iOS

[plugin.xml](cordova-plugin-jacic-hash/plugin.xml:33)でソースファイルを指定:

```xml
<header-file src="src/ios/CDVJACICHash.h" />
<source-file src="src/ios/CDVJACICHash.m" />
<header-file src="src/ios/JACICHashLib/writeHashLib.h" />
<source-file src="src/ios/JACICHashLib/writeHashLib.c" />
<!-- ... その他のライブラリファイル ... -->
```

Xcodeプロジェクトに自動的に追加され、コンパイルされます。

### Android

#### Android.mk方式（推奨）

[Android.mk](cordova-plugin-jacic-hash/src/android/jni/Android.mk)でネイティブライブラリをビルド:

```makefile
LOCAL_MODULE := jacic-hash-lib
LOCAL_SRC_FILES := \
    jacic_hash_jni.cpp \
    JACICHashLib/writeHashLib.c \
    JACICHashLib/app1.c \
    ...
LOCAL_LDLIBS := -llog
```

[Application.mk](cordova-plugin-jacic-hash/src/android/jni/Application.mk)でビルド設定を指定:

```makefile
APP_ABI := armeabi-v7a arm64-v8a x86 x86_64
APP_PLATFORM := android-21
APP_STL := c++_shared
```

#### CMake方式（代替）

[CMakeLists.txt](cordova-plugin-jacic-hash/src/android/jni/CMakeLists.txt)でもビルド可能:

```cmake
add_library(jacic-hash-lib SHARED
    ${JNI_WRAPPER}
    ${JACIC_SOURCES}
)
```

[plugin.xml](cordova-plugin-jacic-hash/plugin.xml:89-97)では両方のビルド設定ファイルを含めています。Gradle/NDKビルド経由で自動的にビルドされます。

## パーミッション

### iOS (Info.plist)

[config.xml](sample-app/www/config.xml:35)で定義:

```xml
<edit-config target="NSPhotoLibraryUsageDescription" file="*-Info.plist" mode="merge">
    <string>JPEG画像にハッシュ値を埋め込むため、フォトライブラリへのアクセスが必要です。</string>
</edit-config>
```

### Android (AndroidManifest.xml)

[config.xml](sample-app/www/config.xml:49)で定義:

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
                 android:maxSdkVersion="28" />
```

## トラブルシューティング

### プラグインが見つからない

**症状:** `window.JACICHash is undefined`

**解決策:**
1. プラグインが正しくインストールされているか確認
   ```bash
   monaca plugin list
   ```
2. `deviceready` イベント後にプラグインを使用しているか確認
   ```javascript
   document.addEventListener('deviceready', function() {
       // ここでプラグインを使用
   });
   ```

### iOS: ビルドエラー

**症状:** "file not found" エラー

**解決策:**
1. Xcodeでプロジェクトを開く
2. Build Phasesで全てのソースファイルが追加されているか確認
3. Header Search Pathsを確認

### Android: ネイティブライブラリのリンクエラー

**症状:** `UnsatisfiedLinkError: dlopen failed`

**解決策:**
1. [CMakeLists.txt](cordova-plugin-jacic-hash/src/android/jni/CMakeLists.txt)の設定を確認
2. build.gradleのndk設定を確認
3. クリーンビルドを実行
   ```bash
   monaca remote build android --clean
   ```

### ファイルパスの問題

**症状:** エラーコード -201 (ファイルが存在しない)

**解決策:**
1. `nativeURL` または `toURL()` を使用してファイルパスを取得
   ```javascript
   var filePath = fileEntry.nativeURL;  // OK
   // var filePath = fileEntry.fullPath;  // NG (パスが不正)
   ```
2. cordova-plugin-fileが正しくインストールされているか確認

## セキュリティ考慮事項

1. **ファイルパス検証**: 入力パスと出力パスが異なることを確認
2. **パーミッション**: 必要最小限のパーミッションのみを要求
3. **ファイル上書き防止**: 出力ファイルが既に存在する場合はエラー (-202)
4. **ハッシュアルゴリズム**: SHA-256を使用

## ライセンス

Apache License 2.0

## 作成者

DATT JAPAN Inc.

## 更新履歴

- **v1.0.0** (2024): 初回リリース
  - iOS/Android対応のCordovaプラグイン
  - サンプルアプリケーション
  - writeHash機能 (ハッシュ埋め込み)
  - Camera Plugin統合（フォトライブラリ選択と写真撮影）
  - 自動ハッシュ埋め込み処理

## 参考資料

- [Cordova Plugin Development Guide](https://cordova.apache.org/docs/en/latest/guide/hybrid/plugins/)
- [Monaca Documentation](https://docs.monaca.io/)
- JACIC (一般財団法人 日本建設情報総合センター)

## サポート

問題が発生した場合は、以下を確認してください:

1. プラグインのバージョン: `monaca plugin list`
2. Cordovaのバージョン: `monaca info`
3. エラーログ: デバイスのログを確認
4. プラットフォーム固有の問題: iOSまたはAndroidのネイティブログを確認

---

このドキュメントは、MonacaでJACICHashLibを利用するための完全なガイドです。
質問や問題がある場合は、開発チームまでお問い合わせください。
