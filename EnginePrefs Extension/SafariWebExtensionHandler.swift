//
//  SafariWebExtensionHandler.swift
//  EnginePrefs Extension
//
//  Created by Alexander on 4/9/26.
//

import SafariServices
import os.log

class SafariWebExtensionHandler: NSObject, NSExtensionRequestHandling {

    private let urlKey = "searchEngineURL"

    func beginRequest(with context: NSExtensionContext) {
        let request = context.inputItems.first as? NSExtensionItem

        let message: Any?
        if #available(iOS 15.0, macOS 11.0, *) {
            message = request?.userInfo?[SFExtensionMessageKey]
        } else {
            message = request?.userInfo?["message"]
        }

        os_log(.default, "Received message from browser.runtime.sendNativeMessage: %@", String(describing: message))

        var responseData: [String: Any] = [:]

        if let msg = message as? [String: Any],
           let action = msg["action"] as? String,
           action == "getSearchEngineURL" {
            let groupID = Bundle.main.object(forInfoDictionaryKey: "AppGroupIdentifier") as? String
            if let url = groupID.flatMap({ UserDefaults(suiteName: $0) })?.string(forKey: urlKey) {
                responseData["url"] = url
            }
        }

        let response = NSExtensionItem()
        if #available(iOS 15.0, macOS 11.0, *) {
            response.userInfo = [ SFExtensionMessageKey: responseData ]
        } else {
            response.userInfo = [ "message": responseData ]
        }

        context.completeRequest(returningItems: [ response ], completionHandler: nil)
    }

}
