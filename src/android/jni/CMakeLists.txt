cmake_minimum_required(VERSION 3.4.1)

# Set library name
set(LIB_NAME jacic-hash-lib)

# Add JACIC Hash Library source files
set(JACIC_LIB_DIR ${CMAKE_CURRENT_SOURCE_DIR}/JACICHashLib)

file(GLOB JACIC_SOURCES
    ${JACIC_LIB_DIR}/*.c
)

# Add JNI wrapper
set(JNI_WRAPPER ${CMAKE_CURRENT_SOURCE_DIR}/jacic_hash_jni.cpp)

# Create shared library
add_library(
    ${LIB_NAME}
    SHARED
    ${JNI_WRAPPER}
    ${JACIC_SOURCES}
)

# Include directories
target_include_directories(
    ${LIB_NAME}
    PRIVATE
    ${JACIC_LIB_DIR}
)

# Link libraries
target_link_libraries(
    ${LIB_NAME}
    log
)
