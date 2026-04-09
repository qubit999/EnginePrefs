# EnginePrefs

A Safari Web Extension for iOS that redirects searches from default search engines to a custom search URL of your choice.

Supported engines: Google, Bing, DuckDuckGo, Yahoo, Ecosia, Yandex, Baidu, and Sogou.

## How it works

1. You enter a search URL with a `%s` placeholder (e.g. `https://search.example.com/search?q=%s`) in the app and tap Save.
2. The extension intercepts searches on supported engines in Safari and redirects them to your custom URL.

The extension uses Safari's `webNavigation` API (Safari 18+) and `declarativeNetRequest` rules (Safari 17.x) to perform the redirect.

## Building from source

### Requirements

- Xcode 16 or later
- iOS 15.0+ deployment target
- An Apple Developer account (free or paid)

### Steps

1. Clone the repository:

   ```
   git clone https://github.com/qubit999/EnginePrefs.git
   cd EnginePrefs
   ```

2. Open the project in Xcode:

   ```
   open EnginePrefs.xcodeproj
   ```

3. Update signing settings for **both** targets:
   - Select the **EnginePrefs** project in the navigator.
   - For each target (`EnginePrefs` and `EnginePrefs Extension`), go to **Signing & Capabilities**.
   - Set **Team** to your Apple Developer account.
   - Change the **Bundle Identifier** to something unique (e.g. replace `com.alxsla` with your own prefix).
   - Make sure the extension's bundle ID is a child of the app's (e.g. `com.yourprefix.EnginePrefs.Extension`).

4. Update the App Group:
   - Both targets use an App Group to share settings between the app and the extension.
   - If you changed the bundle ID prefix, update the App Group ID in **Signing & Capabilities** for both targets so they match.
   - Then update the `AppGroupIdentifier` value in `EnginePrefs/Info.plist` and `EnginePrefs Extension/Info.plist` to match your new App Group ID.

5. Build and run on your device or simulator:
   - Select the **EnginePrefs** scheme and your target device, then press **Cmd+R**.

### Enabling the extension in Safari

After installing the app on your device:

1. Open **Settings**.
2. Go to **Apps** > **Safari** > **Extensions**.
3. Turn on **EnginePrefs**.
4. Set the permission to **Allow** for all websites.
5. Follow the App's instructions

## License

See [LICENSE](LICENSE) for details.
