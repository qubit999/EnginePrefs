//
//  ContentView.swift
//  EnginePrefs macOS
//

import SwiftUI

enum SearchURLValidation: Equatable {
    case valid(String)
    case invalid(String)
}

/// Validates a user-entered search-engine URL template: requires https://, a
/// non-empty host, and the %s query placeholder. Pure so it can be unit-tested.
func validateSearchURL(_ input: String) -> SearchURLValidation {
    let url = input.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !url.isEmpty else { return .invalid("Please enter a URL.") }
    guard let scheme = ["https://", "http://"].first(where: url.hasPrefix) else {
        return .invalid("URL must start with http:// or https://")
    }
    let host = url.dropFirst(scheme.count).prefix { $0 != "/" && $0 != "?" }
    guard !host.isEmpty else {
        return .invalid("Enter a valid URL, e.g. https://example.com/search?q=%s")
    }
    guard url.contains("%s") else {
        return .invalid("URL must contain %s as a query placeholder.")
    }
    return .valid(url)
}

struct ContentView: View {
    @State private var urlText = ""
    @State private var statusMessage: String?
    @State private var statusIsError = false

    private let urlKey = "searchEngineURL"
    private let supportEmail = "support@qlinxx.com"
    private let infoURLString = "https://qlinxx.com/engineprefs/info"

    private var sharedDefaults: UserDefaults? {
        guard let groupID = Bundle.main.object(forInfoDictionaryKey: "AppGroupIdentifier") as? String else { return nil }
        return UserDefaults(suiteName: groupID)
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Spacer()
                    VStack(spacing: 8) {
                        Image(nsImage: NSApplication.shared.applicationIconImage ?? NSImage())
                            .resizable()
                            .frame(width: 72, height: 72)
                        Text("EnginePrefs")
                            .font(.system(size: 24, weight: .bold))
                    }
                    Spacer()
                }
                .padding(.bottom, 8)

                Text("Search Engine URL")
                    .font(.system(size: 15, weight: .semibold))

                TextField("https://example.com/search?q=%s", text: $urlText)
                    .textFieldStyle(.roundedBorder)

                Text("Use %s where the search query should go.")
                    .font(.system(size: 13))
                    .foregroundStyle(.secondary)
                    .padding(.bottom, 12)

                Button("Save", action: saveTapped)
                    .buttonStyle(.borderedProminent)
                    .controlSize(.large)
                    .frame(maxWidth: .infinity)

                Button("Reset to Safari Default", action: resetTapped)
                    .buttonStyle(.bordered)
                    .tint(.red)
                    .controlSize(.large)
                    .frame(maxWidth: .infinity)

                if let msg = statusMessage {
                    Text(msg)
                        .foregroundStyle(statusIsError ? Color.red : Color.green)
                        .frame(maxWidth: .infinity, alignment: .center)
                        .font(.system(size: 14))
                }

                VStack(alignment: .leading, spacing: 6) {
                    Text("How to enable in Safari")
                        .font(.system(size: 15, weight: .semibold))
                    Text("1. Open Safari\n2. Go to Safari \u{2192} Settings\n3. Click Extensions\n4. Turn on EnginePrefs\n5. Click Allow Access to All Websites when prompted")
                        .font(.system(size: 13))
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(NSColor.controlBackgroundColor))
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .padding(.top, 12)

                VStack(alignment: .leading, spacing: 6) {
                    Text("Support")
                        .font(.system(size: 15, weight: .semibold))
                    Text("Need help or want to read the terms and privacy policy?")
                        .font(.system(size: 13))
                        .foregroundStyle(.secondary)
                    Link(supportEmail, destination: URL(string: "mailto:\(supportEmail)")!)
                    Link("qlinxx.com/engineprefs/info", destination: URL(string: infoURLString)!)
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(Color(NSColor.controlBackgroundColor))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
            .padding(32)
        }
        .frame(width: 480)
        .onAppear(perform: loadSavedURL)
    }

    private func loadSavedURL() {
        urlText = sharedDefaults?.string(forKey: urlKey) ?? ""
    }

    private func saveTapped() {
        switch validateSearchURL(urlText) {
        case .valid(let url):
            sharedDefaults?.set(url, forKey: urlKey)
            showStatus("Saved!", isError: false)
        case .invalid(let message):
            showStatus(message, isError: true)
        }
    }

    private func resetTapped() {
        sharedDefaults?.removeObject(forKey: urlKey)
        urlText = ""
        showStatus("Reset! Safari will use its default search engine.", isError: false)
    }

    private func showStatus(_ message: String, isError: Bool) {
        statusMessage = message
        statusIsError = isError
        guard !isError else { return }
        Task { @MainActor in
            try? await Task.sleep(for: .seconds(3))
            statusMessage = nil
        }
    }
}
