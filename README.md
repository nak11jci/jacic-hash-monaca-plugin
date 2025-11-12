# cordova-plugin-jacic-hash

JPEGファイルのAPP5領域にハッシュ値を埋め込むCordovaプラグイン

## インストール

### ローカルパスから

```bash
cordova plugin add /path/to/cordova-plugin-jacic-hash
```

### Monacaの場合

```bash
monaca plugin add ../cordova-plugin-jacic-hash
```

## 対応プラットフォーム

- iOS (12.0以降)
- Android (API Level 21以降)

## API

### writeHash

JPEGファイルにハッシュ値を埋め込みます。

```javascript
JACICHash.writeHash(sourceFilePath, destFilePath, successCallback, errorCallback);
```

**パラメータ:**
- `sourceFilePath` (String): 元のJPEGファイルパス
- `destFilePath` (String): 出力先JPEGファイルパス
- `successCallback` (Function): 成功時のコールバック
- `errorCallback` (Function): エラー時のコールバック

**成功時のレスポンス:**
```javascript
{
  code: 0,
  message: "Hash value written successfully",
  outputPath: "/path/to/output.jpg"
}
```

**エラーコード:**
- `-101`: パラメータ不正
- `-102`: 入力と出力が同じファイルパス
- `-201`: 入力ファイルが存在しない
- `-202`: 出力ファイルが既に存在する
- `-203`: ファイルオープン失敗
- `-204`: ファイルサイズがゼロ
- `-205`: ファイル書き込み失敗
- `-206`: ファイルクローズ失敗
- `-301`: EXIFフォーマット不正
- `-302`: APP5セグメントが既に存在する
- `-307`: 日時情報が見つからない
- `-900`: その他のエラー

## 使用例

### 基本的な使い方

```javascript
document.addEventListener('deviceready', function() {
    // ハッシュ値を埋め込む
    JACICHash.writeHash(
        '/path/to/source.jpg',
        '/path/to/output.jpg',
        function(result) {
            console.log('成功:', result.message);
            console.log('出力先:', result.outputPath);
        },
        function(error) {
            console.error('エラー:', error.message);
        }
    );
});
```

### Camera Pluginと併用（推奨）

```javascript
// フォトライブラリから選択
navigator.camera.getPicture(
    function(imageURI) {
        window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
            var sourcePath = fileEntry.nativeURL;
            var outputPath = cordova.file.dataDirectory + 'JACIC_' + Date.now() + '.jpg';

            JACICHash.writeHash(sourcePath, outputPath,
                function(result) { console.log('成功:', result); },
                function(error) { console.error('エラー:', error); }
            );
        });
    },
    function(error) { console.error('カメラエラー:', error); },
    {
        quality: 100,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        mediaType: Camera.MediaType.PICTURE
    }
);
```

## ネイティブライブラリについて

### Android

このプラグインには**事前ビルド済みのネイティブライブラリ**(.so)が含まれています:

- `src/android/libs/armeabi-v7a/libjacic-hash-lib.so`
- `src/android/libs/arm64-v8a/libjacic-hash-lib.so`
- `src/android/libs/x86/libjacic-hash-lib.so`
- `src/android/libs/x86_64/libjacic-hash-lib.so`

これらのライブラリは**GitHub Actions**で自動的にビルドされており、Monacaクラウドビルドでそのまま使用できます。

**開発者向け**: ネイティブライブラリを再ビルドする必要がある場合は、[BUILD_NDK.md](BUILD_NDK.md)を参照してください。

### iOS

Xcodeのビルドシステムで自動的にコンパイルされます。事前ビルドは不要です。

## 依存関係

- cordova-plugin-file (ファイルシステムアクセス用)
- cordova-plugin-camera (オプション、サンプルアプリ用)

## License

Apache 2.0

## Author

DATT JAPAN Inc.
