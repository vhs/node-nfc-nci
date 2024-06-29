cmake_minimum_required(VERSION 3.22.0)

# Include ExternalProject module
include(ExternalProject)

# Name of the project (will be the name of the plugin)
project(node-nfc-nci)

# Variables
set(VENDOR_PREFIX "${CMAKE_SOURCE_DIR}/vendor")
set(VENDOR_INCLUDES "${VENDOR_PREFIX}/include")
set(VENDOR_LIBS "${VENDOR_PREFIX}/lib")

if(EXISTS "${CMAKE_SOURCE_DIR}/node_modules/")
    set(NODE_MODULES_PREFIX "${CMAKE_CURRENT_SOURCE_DIR}/node_modules")
else()
    set(NODE_MODULES_PREFIX "${CMAKE_CURRENT_SOURCE_DIR}/../../")
endif()

# Resolve common make command
find_program(MAKE_EXE NAMES gmake nmake make)

# Source files
file(GLOB SOURCE_FILES "src/*.cpp" "src/*.h")

#
# nfc nci linux library
#
ExternalProject_Add(libnfc_nci_linux
    GIT_REPOSITORY https://github.com/vhs/linux_libnfc-nci.git
    GIT_SHALLOW 1
    UPDATE_DISCONNECTED 1
    PREFIX ${VENDOR_PREFIX}
    CONFIGURE_COMMAND ./setup.sh ./configure --enable-alt --prefix ${VENDOR_PREFIX}
    BUILD_COMMAND ${MAKE_EXE}
    BUILD_IN_SOURCE 1
    LOG_DIR "${VENDOR_PREFIX}/logs"
    LOG_CONFIGURE 1
    LOG_BUILD 1
    BUILD_BYPRODUCTS "${VENDOR_LIBS}/libnfc_nci_linux.so"
)

# Build a shared library named after the project from the files in `src/`
add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES})

# Gives our library file a .node extension without any "lib" prefix
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")

#
# Includes
#

# Common node includes
target_include_directories(${PROJECT_NAME} PRIVATE "/usr/include/node")

# Node Addon API
target_include_directories(${PROJECT_NAME} PRIVATE "${NODE_MODULES_PREFIX}/node-addon-api")

# Node API
target_include_directories(${PROJECT_NAME} PRIVATE "${NODE_MODULES_PREFIX}/node-api-headers/include")

# Project dependencies
target_include_directories(${PROJECT_NAME} PRIVATE ${VENDOR_INCLUDES})

# Required CMake includes
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_JS_INC})

#
# Linking
#

# Required CMake targets
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})

# Add nfc library dependency
add_dependencies(${PROJECT_NAME} libnfc_nci_linux)
target_link_libraries(${PROJECT_NAME} "${VENDOR_LIBS}/libnfc_nci_linux.so")
