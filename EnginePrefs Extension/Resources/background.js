// background.js
// Loaded after rule-builder.js. Handles webNavigation-based redirect (Safari 18+),
// native messaging with the container app, and message routing.

// Flat domain-to-param lookup built from domainMap (defined in rule-builder.js)
var googleUrls = {};
(function () {
    var gDomains = domainMap["Google"];
    for (var i = 0; i < gDomains.length; i++) {
        googleUrls[gDomains[i]] = "q";
        googleUrls["www." + gDomains[i]] = "q";
    }
})();

var ddgUrls = {};
(function () {
    var d = domainMap["DuckDuckGo"];
    for (var i = 0; i < d.length; i++) {
        ddgUrls[d[i]] = "q";
        ddgUrls["www." + d[i]] = "q";
    }
})();

var yandexUrls = {};
(function () {
    var d = domainMap["Yandex"];
    for (var i = 0; i < d.length; i++) {
        yandexUrls[d[i]] = "text";
        yandexUrls["www." + d[i]] = "text";
    }
})();

var baiduUrls = { "baidu.com": "wd", "www.baidu.com": "wd", "m.baidu.com": "word" };
var sogouUrls = { "sogou.com": "query", "www.sogou.com": "query", "m.sogou.com": "keyword", "so.com": "q", "www.so.com": "q", "m.so.com": "q" };
var ecosiaUrls = { "ecosia.org": "q", "www.ecosia.org": "q" };
var yahooUrls = { "search.yahoo.com": "p", "www.search.yahoo.com": "p" };
var bingUrls = { "bing.com": "q", "www.bing.com": "q" };

var builtInEngines = Object.assign({}, googleUrls, ddgUrls, yandexUrls, baiduUrls, sogouUrls, ecosiaUrls, yahooUrls, bingUrls);

var currentSearchURL = null;
var flagFetchedPreferences = false;

// Extract the search query from a navigation URL
function captureQuery(urlString) {
    try {
        var url = new URL(urlString);
        var host = url.hostname;
        if (host.startsWith("www.")) {
            var bare = host.slice(4);
            // Try bare first, then www
            if (bare in builtInEngines) host = bare;
        }
        if (host === "www.search.yahoo.com" || host === "search.yahoo.com") {
            host = "search.yahoo.com";
        }
        var param = builtInEngines[host];
        if (!param) return null;
        // For Google, only redirect from actual search pages
        if (host in googleUrls && !url.pathname.startsWith("/search")) return null;
        var query = new URLSearchParams(url.search).get(param);
        return query || null;
    } catch (e) {
        return null;
    }
}

// Check if URL belongs to the user's custom search domain (prevent loops)
function isOwnSearchDomain(urlString) {
    if (!currentSearchURL) return false;
    var customHost = getCustomSearchHost(currentSearchURL);
    if (!customHost) return false;
    try {
        var navHost = new URL(urlString).hostname;
        if (navHost === customHost) return true;
        if (navHost === "www." + customHost) return true;
        if ("www." + navHost === customHost) return true;
    } catch (e) {}
    return false;
}

// Primary redirect via webNavigation (used on Safari 18+)
function checkForSearch(details) {
    if (!flagFetchedPreferences) {
        getPreferencesFromStorage(function () {
            _checkForSearch(details);
        });
    } else {
        _checkForSearch(details);
    }
}

function _checkForSearch(details) {
    if (details.parentFrameId !== -1) return;
    if (details.tabId < 1) return;
    if (!stringIsValid(currentSearchURL)) return;
    if (isOwnSearchDomain(details.url)) return;

    var query = captureQuery(details.url);
    if (!query) return;

    var redirectURL = currentSearchURL.replace("%s", encodeURIComponent(query));
    browser.tabs.update(details.tabId, {
        url: redirectURL,
        loadReplace: true
    });
}

// Build hostContains filters from all supported domains
var defaultFilter = {
    url: allSupportedDomains.map(function (d) {
        return { hostContains: d };
    })
};

browser.webNavigation.onBeforeNavigate.addListener(checkForSearch, defaultFilter);

// Fetch URL from native app and cache in browser.storage.local
function getPreferencesFromStorage(callback) {
    browser.runtime.sendNativeMessage("application.id", { action: "getSearchEngineURL" })
        .then(function (response) {
            if (response && stringIsValid(response.url)) {
                currentSearchURL = response.url;
                browser.storage.local.set({ searchEngineURL: response.url });
            } else {
                // Native app returned no URL (reset or not configured).
                // Clear the cached value so stale data doesn't persist.
                currentSearchURL = null;
                browser.storage.local.remove("searchEngineURL");
                // Clear any leftover DNR rules since there's no redirect target
                clearDynamicRules();
            }
        })
        .catch(function () {
            // Native messaging failed, fall back to cached storage value.
            return browser.storage.local.get("searchEngineURL").then(function (data) {
                currentSearchURL = data.searchEngineURL || null;
            }).catch(function () {});
        })
        .finally(function () {
            flagFetchedPreferences = true;
            if (typeof callback === "function") callback();
        });
}

// Handle messages from content scripts and popup
browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "getSearchEngineURL") {
        return Promise.resolve({ url: currentSearchURL });
    }
    if (request.action === "updatePreferences") {
        return (async function () {
            await new Promise(function (resolve) { getPreferencesFromStorage(resolve); });
            if (shouldUseDNR()) {
                await synchronizeRules(currentSearchURL);
            }
            return { ok: true };
        })();
    }
    return false;
});

// Startup: fetch prefs then initialize DNR if needed
getPreferencesFromStorage(function () {
    console.log("EnginePrefs: preferences loaded on startup");
});

(async function () { await initialize(); })();

