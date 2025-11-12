package jp.ne.datt.plugin;

import android.util.Log;
import org.apache.cordova.CallbackContext;
import org.apache.cordova.CordovaPlugin;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * JACIC Hash Cordova Plugin for Android
 * Wrapper for JACIC Hash native library
 */
public class JACICHashPlugin extends CordovaPlugin {

    private static final String TAG = "JACICHashPlugin";

    // Load native library
    static {
        try {
            System.loadLibrary("jacic-hash-lib");
            Log.d(TAG, "Native library loaded successfully");
        } catch (UnsatisfiedLinkError e) {
            Log.e(TAG, "Failed to load native library: " + e.getMessage());
        }
    }

    // Native method
    private native int nativeWriteHash(String sourceFilePath, String destFilePath);

    @Override
    public boolean execute(String action, JSONArray args, CallbackContext callbackContext) throws JSONException {
        Log.d(TAG, "execute() called with action: " + action);
        if ("writeHash".equals(action)) {
            String sourceFilePath = args.getString(0);
            String destFilePath = args.getString(1);
            Log.d(TAG, "Source: " + sourceFilePath);
            Log.d(TAG, "Dest: " + destFilePath);
            writeHash(sourceFilePath, destFilePath, callbackContext);
            return true;
        }
        return false;
    }

    /**
     * Write hash value to JPEG file
     */
    private void writeHash(final String sourceFilePath, final String destFilePath, final CallbackContext callbackContext) {
        cordova.getThreadPool().execute(new Runnable() {
            @Override
            public void run() {
                try {
                    // Validate parameters
                    if (sourceFilePath == null || sourceFilePath.isEmpty() ||
                        destFilePath == null || destFilePath.isEmpty()) {
                        JSONObject error = new JSONObject();
                        error.put("code", -101);
                        error.put("message", "Invalid parameters: sourceFilePath and destFilePath are required");
                        callbackContext.error(error);
                        return;
                    }

                    // Remove file:// prefix if present (Android native code expects absolute paths)
                    String srcPath = sourceFilePath.replace("file://", "");
                    String dstPath = destFilePath.replace("file://", "");

                    Log.d(TAG, "Cleaned source path: " + srcPath);
                    Log.d(TAG, "Cleaned dest path: " + dstPath);
                    Log.d(TAG, "Calling native method...");

                    // Call native method
                    int result = nativeWriteHash(srcPath, dstPath);

                    Log.d(TAG, "Native method returned: " + result);

                    // Return result
                    JSONObject response = new JSONObject();
                    response.put("code", result);

                    if (result == 0) {
                        Log.d(TAG, "Success - sending success callback");
                        response.put("message", "Hash value written successfully");
                        response.put("outputPath", destFilePath);
                        callbackContext.success(response);
                    } else {
                        Log.e(TAG, "Error - code: " + result + ", message: " + getErrorMessage(result));
                        response.put("message", getErrorMessage(result));
                        response.put("sourcePath", sourceFilePath);
                        response.put("destPath", destFilePath);
                        callbackContext.error(response);
                    }
                } catch (JSONException e) {
                    Log.e(TAG, "JSON error: " + e.getMessage(), e);
                    callbackContext.error("JSON error: " + e.getMessage());
                } catch (Exception e) {
                    Log.e(TAG, "Unexpected error: " + e.getMessage(), e);
                    callbackContext.error("Unexpected error: " + e.getMessage());
                }
            }
        });
    }

    /**
     * Get error message for writeHash error codes
     */
    private String getErrorMessage(int errorCode) {
        switch (errorCode) {
            case -101: return "Incorrect parameter";
            case -102: return "Same file path for source and destination";
            case -201: return "Source file does not exist";
            case -202: return "Destination file already exists";
            case -203: return "Failed to open file";
            case -204: return "File size is zero";
            case -205: return "Failed to write file";
            case -206: return "Failed to close file";
            case -301: return "Incorrect EXIF format";
            case -302: return "APP5 segment already exists";
            case -307: return "Date information not found";
            case -900: return "Other error";
            default: return "Unknown error (code: " + errorCode + ")";
        }
    }
}
