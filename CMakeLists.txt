cmake_minimum_required(VERSION 3.22.0)

# Include ExternalProject module
include(ExternalProject)

# Name of the project (will be the name of the plugin)
project(node-nfc-nci)

# Variables
set(PROJECT_DEPENDENCIES_PREFIX "${CMAKE_SOURCE_DIR}/vendor")
set(PROJECT_DEPENDENCIES_INCLUDES "${PROJECT_DEPENDENCIES_PREFIX}/include")
set(PROJECT_DEPENDENCIES_LIBS "${PROJECT_DEPENDENCIES_PREFIX}/lib")

set(NODE_MODULES_PREFIX "${CMAKE_SOURCE_DIR}/node_modules")

# Resolve common make command
find_program(MAKE_EXE NAMES gmake nmake make)

# Source files
file(GLOB SOURCE_FILES "src/*.cpp" "src/*.h")

#
# nfc nci linux library
#
ExternalProject_Add(libnfc_nci_linux
  GIT_REPOSITORY    https://github.com/vhs/linux_libnfc-nci
  GIT_SHALLOW       true
  PREFIX            ${PROJECT_DEPENDENCIES_PREFIX}
  CONFIGURE_COMMAND ./setup.sh ./configure --enable-alt --prefix ${PROJECT_DEPENDENCIES_PREFIX}
  BUILD_IN_SOURCE   1
  BUILD_COMMAND     ${MAKE_EXE}
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
find_path(NAPI_H_PATH napi.h PATHS "${NODE_MODULES_PREFIX}/*" PATH_SUFFIXES include REQUIRED)
target_include_directories(${PROJECT_NAME} PRIVATE ${NAPI_H_PATH})

# Node API
find_path(NODE_API_H_PATH node_api.h PATHS "${NODE_MODULES_PREFIX}/*" PATH_SUFFIXES include REQUIRED)
target_include_directories(${PROJECT_NAME} PRIVATE ${NODE_API_H_PATH})

# Project dependencies
target_include_directories(${PROJECT_NAME} PRIVATE ${PROJECT_DEPENDENCIES_INCLUDES})

# Required CMake includes
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_JS_INC})

#
# Linking
#

# Required CMake targets
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})

# Add nfc library dependency
add_dependencies(${PROJECT_NAME} libnfc_nci_linux)
target_link_libraries(${PROJECT_NAME} "${PROJECT_DEPENDENCIES_LIBS}/libnfc_nci_linux.so")
