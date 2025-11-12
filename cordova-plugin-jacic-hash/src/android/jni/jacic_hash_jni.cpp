#include <jni.h>
#include <string>
#include <android/log.h>
#include "JACICHashLib/writeHashLib.h"

#define TAG "JACICHashJNI"

extern "C" {

/**
 * Write hash value to JPEG file
 * JNI wrapper for JACIC_WriteHashValue
 */
JNIEXPORT jint JNICALL
Java_jp_ne_datt_plugin_JACICHashPlugin_nativeWriteHash(
        JNIEnv *env,
        jobject /* this */,
        jstring sourceFilePath,
        jstring destFilePath) {

    __android_log_print(ANDROID_LOG_DEBUG, TAG, "JNI nativeWriteHash called");

    const char *srcPath = env->GetStringUTFChars(sourceFilePath, NULL);
    const char *dstPath = env->GetStringUTFChars(destFilePath, NULL);

    if (!srcPath || !dstPath) {
        __android_log_print(ANDROID_LOG_ERROR, TAG, "Failed to get UTF chars");
        if (srcPath) env->ReleaseStringUTFChars(sourceFilePath, srcPath);
        if (dstPath) env->ReleaseStringUTFChars(destFilePath, dstPath);
        return -101;
    }

    __android_log_print(ANDROID_LOG_DEBUG, TAG, "Source: %s", srcPath);
    __android_log_print(ANDROID_LOG_DEBUG, TAG, "Dest: %s", dstPath);

    int result = JACIC_WriteHashValue(srcPath, dstPath);

    __android_log_print(ANDROID_LOG_DEBUG, TAG, "JACIC_WriteHashValue returned: %d", result);

    env->ReleaseStringUTFChars(sourceFilePath, srcPath);
    env->ReleaseStringUTFChars(destFilePath, dstPath);

    return result;
}

} // extern "C"
