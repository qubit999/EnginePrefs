//
//  EnginePrefs_macOSTests.swift
//  EnginePrefs macOSTests
//
//  Created by Alexander on 6/17/26.
//

import Testing
@testable import EnginePrefs_macOS

struct EnginePrefs_macOSTests {

    @Test func rejectsEmptyInput() {
        #expect(validateSearchURL("   ") == .invalid("Please enter a URL."))
    }

    @Test func acceptsHTTPForLANInstances() {
        #expect(validateSearchURL("http://192.168.1.10:5000/search?q=%s")
            == .valid("http://192.168.1.10:5000/search?q=%s"))
    }

    @Test func rejectsUnsupportedScheme() {
        #expect(validateSearchURL("ftp://example.com/?q=%s")
            == .invalid("URL must start with http:// or https://"))
    }

    @Test func rejectsMissingHost() {
        #expect(validateSearchURL("https://?q=%s")
            == .invalid("Enter a valid URL, e.g. https://example.com/search?q=%s"))
    }

    @Test func rejectsMissingPlaceholder() {
        #expect(validateSearchURL("https://example.com/search")
            == .invalid("URL must contain %s as a query placeholder."))
    }

    @Test func acceptsValidTemplateAndTrims() {
        #expect(validateSearchURL("  https://example.com/search?q=%s  ")
            == .valid("https://example.com/search?q=%s"))
    }
}
