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

## ネイティブライブラリのビルド

### Android

Androidでは2つのビルド方式をサポートしています:

#### Android.mk方式（推奨）

従来のNDKビルド方式。Monacaや古いCordovaバージョンでの互換性が高いです。

- `src/android/jni/Android.mk` - ビルド定義
- `src/android/jni/Application.mk` - アプリケーション設定

#### CMake方式（代替）

新しいビルドシステムに対応。

- `src/android/jni/CMakeLists.txt` - CMakeビルド定義

プラグインには両方のビルド設定ファイルが含まれており、ビルドシステムに応じて自動的に適切な方法が選択されます。

### iOS

Xcodeのビルドシステムで自動的にコンパイルされます。

## 依存関係

- cordova-plugin-file (ファイルシステムアクセス用)
- cordova-plugin-camera (オプション、サンプルアプリ用)

## License

Apache 2.0

## Author

DATT JAPAN Inc.
