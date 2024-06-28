cmake_minimum_required(VERSION 3.22.0)

include(ExternalProject)

# Name of the project (will be the name of the plugin)
project(node-nfc-nci)

# Build a shared library named after the project from the files in `src/`
file(GLOB SOURCE_FILES "src/*.cpp" "src/*.h")
add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES})

# Gives our library file a .node extension without any "lib" prefix
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")

target_include_directories(${PROJECT_NAME} PRIVATE "/usr/include/node")

# Include N-API wrappers
target_include_directories(${PROJECT_NAME} PRIVATE "${CMAKE_SOURCE_DIR}/node_modules/node-addon-api")
target_include_directories(${PROJECT_NAME} PRIVATE "${CMAKE_SOURCE_DIR}/node_modules/node-api-headers/include")
target_include_directories(${PROJECT_NAME} PRIVATE "${CMAKE_SOURCE_DIR}/dependencies/includes")

# Essential include files to build a node addon,
# You should add this line in every CMake.js based project
target_include_directories(${PROJECT_NAME} PRIVATE ${CMAKE_JS_INC})

find_program(MAKE_EXE NAMES gmake nmake make)

ExternalProject_Add(libnfc_nci_linux
  GIT_REPOSITORY    https://github.com/vhs/linux_libnfc-nci
  GIT_SHALLOW       true
  PREFIX            "${CMAKE_SOURCE_DIR}/build/dependencies"
  CONFIGURE_COMMAND ./bootstrap && ./configure --enable-alt --prefix "${CMAKE_SOURCE_DIR}/build/dependencies"
  BUILD_IN_SOURCE   true
  BUILD_COMMAND     ${MAKE_EXE}
)

# Essential library files to link to a node addon
# You should add this line in every CMake.js based project
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})

add_dependencies(${PROJECT_NAME} libnfc_nci_linux)
target_link_libraries(${PROJECT_NAME} "${CMAKE_SOURCE_DIR}/build/dependencies/lib/libnfc_nci_linux.so")
