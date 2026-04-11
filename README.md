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

## Building a Sideloadly IPA with GitHub Actions

The default repo identifiers (`com.alexsla.EnginePrefs` and `group.com.alexsla.EnginePrefs`) only work for the Apple account that owns them. If you want a sideloadable IPA that can still use the shared App Group, build it with your own identifiers.

1. Open **Actions** in your fork of the repository.
2. Run **Build and Release IPA** with **Run workflow**.
3. Set these inputs:
   - `app_bundle_id`: a bundle ID your Apple account can sign, such as `com.yourname.EnginePrefs`
   - `app_group_id`: a matching App Group, such as `group.com.yourname.EnginePrefs`
4. Download the generated IPA and install it with Sideloadly.
5. In Sideloadly, keep the app and extension on the same signing identity and do not switch them to unrelated bundle IDs after the IPA is built.

This matches the behavior that works in Xcode: both targets must share the same App Group value, and that group must belong to the Apple account used for the final signing step.

### Enabling the extension in Safari

After installing the app on your device:

1. Open **Settings**.
2. Go to **Apps** > **Safari** > **Extensions**.
3. Turn on **EnginePrefs**.
4. Set the permission to **Allow** for all websites.
5. Follow the App's instructions

## License

See [LICENSE](LICENSE) for details.
