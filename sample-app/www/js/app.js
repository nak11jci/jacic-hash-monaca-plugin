/**
 * JACIC Hash Sample Application
 *
 * This application demonstrates how to use the JACIC Hash Plugin
 * to embed hash values in JPEG files.
 */

// Global variables
var selectedFile = null;
var selectedFilePath = null;
var outputFilePath = null;

// Wait for Cordova to load
document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    addLog('Cordova initialized', 'success');

    // Check if plugin is available
    if (window.JACICHash) {
        addLog('JACIC Hash Plugin loaded successfully', 'success');
    } else {
        addLog('ERROR: JACIC Hash Plugin not found!', 'error');
        alert('JACIC Hash Plugin is not installed.');
        return;
    }

    // Check Camera plugin
    if (!navigator.camera) {
        addLog('ERROR: Camera Plugin not found!', 'error');
        alert('Camera Plugin is not installed.');
        return;
    }

    // Setup event listeners
    document.getElementById('selectFileBtn').addEventListener('click', onSelectFile);
    document.getElementById('takePictureBtn').addEventListener('click', onTakePicture);
}

/**
 * File selection handler using Camera plugin
 */
function onSelectFile() {
    addLog('Opening photo library...', 'info');

    // Use Camera plugin to select from photo library
    navigator.camera.getPicture(
        function(imageURI) {
            // Success - got image URI
            addLog('Image selected from library', 'success');
            handleImageSelected(imageURI, 'selected');
        },
        function(error) {
            // Error or user cancelled
            if (error !== 'No Image Selected' && error !== 'Selection cancelled.') {
                addLog('ERROR: Camera plugin error - ' + error, 'error');
                alert('画像の選択に失敗しました: ' + error);
            } else {
                addLog('Image selection cancelled', 'info');
            }
        },
        {
            quality: 100,
            destinationType: Camera.DestinationType.FILE_URI,
            sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
            mediaType: Camera.MediaType.PICTURE,
            correctOrientation: false,
            saveToPhotoAlbum: false
        }
    );
}

/**
 * Take picture handler using Camera plugin
 */
function onTakePicture() {
    addLog('Opening camera...', 'info');

    // Use Camera plugin to take a picture
    navigator.camera.getPicture(
        function(imageURI) {
            // Success - got image URI
            addLog('Photo captured successfully', 'success');
            handleImageSelected(imageURI, 'captured');
        },
        function(error) {
            // Error or user cancelled
            if (error !== 'Camera cancelled.' && error !== 'no image selected') {
                addLog('ERROR: Camera error - ' + error, 'error');
                alert('写真の撮影に失敗しました: ' + error);
            } else {
                addLog('Camera cancelled', 'info');
            }
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

/**
 * Handle image selected or captured
 */
function handleImageSelected(imageURI, sourceType) {
    // Get file entry to get file info
    window.resolveLocalFileSystemURL(imageURI, function(fileEntry) {
        selectedFilePath = fileEntry.nativeURL;

        fileEntry.file(function(fileObj) {
            // Display file info
            var fileInfo = document.getElementById('fileInfo');
            var sourceLabel = sourceType === 'captured' ? '撮影された画像' : '選択された画像';
            fileInfo.innerHTML =
                '<strong>' + sourceLabel + ':</strong><br>' +
                '名前: ' + fileEntry.name + '<br>' +
                'サイズ: ' + formatFileSize(fileObj.size) + '<br>' +
                'パス: ' + selectedFilePath;
            fileInfo.classList.add('show');

            addLog('File info retrieved: ' + fileEntry.name, 'success');

            // Automatically start hash embedding
            writeHashToImage();
        }, function(error) {
            addLog('ERROR: Failed to get file info - ' + JSON.stringify(error), 'error');
        });
    }, function(error) {
        addLog('ERROR: Failed to resolve file URI - ' + JSON.stringify(error), 'error');
        alert('ファイルの取得に失敗しました。');
    });
}

/**
 * Write hash to image (called automatically after image selection/capture)
 */
function writeHashToImage() {
    if (!selectedFilePath) {
        addLog('ERROR: No file path available', 'error');
        return;
    }

    addLog('Starting hash write operation...', 'info');

    // Generate output file path
    var timestamp = new Date().getTime();
    var outputFileName = 'JACIC_' + timestamp + '.jpg';

    // Androidでは外部ストレージを使用（書き込み可能）
    var targetDir = cordova.file.externalDataDirectory || cordova.file.dataDirectory;

    addLog('Target directory: ' + targetDir, 'info');

    // Get application directory
    window.resolveLocalFileSystemURL(targetDir, function(dirEntry) {
        // nativeURLが'/'で終わっているか確認して、適切にパスを結合
        var basePath = dirEntry.nativeURL;
        if (!basePath.endsWith('/')) {
            basePath += '/';
        }
        outputFilePath = basePath + outputFileName;

        addLog('Source: ' + selectedFilePath, 'info');
        addLog('Output: ' + outputFilePath, 'info');
        addLog('Calling JACICHash.writeHash...', 'info');

        // Call plugin
        JACICHash.writeHash(
            selectedFilePath,
            outputFilePath,
            function(result) {
                addLog('SUCCESS callback received', 'success');
                // Success
                addLog('Hash write completed successfully', 'success');
                addLog('Result code: ' + result.code, 'info');

                var resultDiv = document.getElementById('writeResult');
                resultDiv.innerHTML =
                    '<h3>ハッシュ埋め込み成功</h3>' +
                    '<p><strong>リターンコード:</strong> ' + result.code + '</p>' +
                    '<p><strong>メッセージ:</strong> ' + result.message + '</p>' +
                    '<p><strong>出力ファイル:</strong> ' + result.outputPath + '</p>';
                resultDiv.className = 'result success show';
            },
            function(error) {
                addLog('ERROR callback received', 'error');
                // Error
                addLog('Hash write failed', 'error');
                addLog('Error code: ' + error.code + ' - ' + error.message, 'error');
                addLog('Source path: ' + selectedFilePath, 'error');
                addLog('Output path: ' + outputFilePath, 'error');

                var resultDiv = document.getElementById('writeResult');
                resultDiv.innerHTML =
                    '<h3>ハッシュ埋め込み失敗</h3>' +
                    '<p><strong>エラーコード:</strong> ' + error.code + '</p>' +
                    '<p><strong>メッセージ:</strong> ' + error.message + '</p>' +
                    '<p><strong>入力パス:</strong> ' + (error.sourcePath || selectedFilePath) + '</p>' +
                    '<p><strong>出力パス:</strong> ' + (error.destPath || outputFilePath) + '</p>';
                resultDiv.className = 'result error show';
            }
        );
    }, function(error) {
        addLog('ERROR: Failed to get directory - ' + error, 'error');
        alert('ディレクトリの取得に失敗しました。');
    });
}


/**
 * Format file size for display
 */
function formatFileSize(bytes) {
    if (bytes < 1024) {
        return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        return (bytes / 1024).toFixed(2) + ' KB';
    } else {
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
}

/**
 * Add log entry to log area
 */
function addLog(message, type) {
    var logArea = document.getElementById('logArea');
    var logEntry = document.createElement('div');
    logEntry.className = 'log-entry';

    var time = new Date().toLocaleTimeString('ja-JP');
    var logClass = type ? 'log-' + type : '';

    logEntry.innerHTML =
        '<span class="log-time">[' + time + ']</span>' +
        '<span class="log-message ' + logClass + '">' + message + '</span>';

    logArea.appendChild(logEntry);
    logArea.scrollTop = logArea.scrollHeight;

    console.log('[JACIC] ' + message);
}
