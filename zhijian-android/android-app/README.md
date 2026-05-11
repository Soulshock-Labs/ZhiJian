# Android Packaging (Quick Start)

This project is a fast Android shell app for your existing cloud web app.

## 1) Open project

Open Android Studio and select this folder:

`android-app/`

## 2) Sync + build

1. Wait for Gradle sync.
2. Run app on emulator/device, or use `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

## 3) What this app does

- Opens cloud URL: `https://api.zhijian.me`
- Supports file upload picker in WebView.
- Supports document download into Android `Download` folder.

## 4) If you want to change backend URL

Edit:

`app/src/main/java/com/smartteacher/android/MainActivity.kt`

Constant:

`HOME_URL`
