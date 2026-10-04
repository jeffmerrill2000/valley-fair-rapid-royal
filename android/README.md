# Orchard Drop for Android

Full-screen app that opens the published game at <https://valley-fair-rapid-royal.grok.me/>.

The installable file is [orchard-drop.apk](orchard-drop.apk). It is signed with the debug key, which is enough to install on your own phone. It is not a Play Store build.

## Install on a phone

1. Download `orchard-drop.apk` from this folder.
2. On the phone, allow installs from your browser or the Files app.
3. Open the APK and tap Install.
4. The game needs a network connection. Your best score stays on that phone.

## Build it yourself

You need JDK 17 and an Android SDK with platform 35 and build-tools 35.

```bash
export ANDROID_HOME="$HOME/Android/Sdk"
cd android
./gradlew assembleDebug
```

The new APK is `app/build/outputs/apk/debug/app-debug.apk`.
