LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)

# Library name
LOCAL_MODULE := jacic-hash-lib

# Source files
LOCAL_SRC_FILES := \
    jacic_hash_jni.cpp \
    JACICHashLib/writeHashLib.c \
    JACICHashLib/app1.c \
    JACICHashLib/app5.c \
    JACICHashLib/common.c \
    JACICHashLib/exif.c \
    JACICHashLib/sha256.c

# Include directories
LOCAL_C_INCLUDES := $(LOCAL_PATH)/JACICHashLib

# Link libraries
LOCAL_LDLIBS := -llog

include $(BUILD_SHARED_LIBRARY)
