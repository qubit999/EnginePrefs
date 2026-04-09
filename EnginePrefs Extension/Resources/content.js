// content.js
// Fallback redirect for cases where webNavigation/DNR didn't fire in time.
// Runs on all URLs at document_start but exits immediately on non-search pages.

(function () {
    var host = location.hostname;
    if (host.startsWith("www.")) host = host.slice(4);

    // Map of search engine domains to their query parameter
    var engines = {
        "q": [
            "google.", "duckduckgo.", "bing.com", "ecosia.org",
            "so.com", "m.so.com", "ddg.co", "ddg.gg",
            "duck.co", "duck.com", "duckgo.com"
        ],
        "p": ["search.yahoo.com"],
        "text": ["yandex."],
        "wd": ["baidu.com"],
        "word": ["m.baidu.com"],
        "query": ["sogou.com"],
        "keyword": ["m.sogou.com"]
    };

    var paramName = null;
    var paramKeys = Object.keys(engines);

    for (var i = 0; i < paramKeys.length; i++) {
        var key = paramKeys[i];
        var patterns = engines[key];
        for (var j = 0; j < patterns.length; j++) {
            var pattern = patterns[j];
            if (host === pattern || host.indexOf(pattern) !== -1) {
                paramName = key;
                break;
            }
        }
        if (paramName) break;
    }

    if (!paramName) return;

    // For Google domains, only act on /search paths
    if (host.indexOf("google.") !== -1 && location.pathname.indexOf("/search") !== 0) return;

    var query = new URLSearchParams(location.search).get(paramName);
    if (!query) return;

    browser.runtime.sendMessage({ action: "getSearchEngineURL" })
        .then(function (response) {
            if (!response || !response.url) return;

            var target = response.url.replace("%s", encodeURIComponent(query));

            // Don't redirect if we're already on the target domain
            try {
                var targetHost = new URL(target).hostname;
                if (location.hostname === targetHost) return;
                if ("www." + location.hostname === targetHost) return;
                if (location.hostname === "www." + targetHost) return;
            } catch (e) {}

            location.replace(target);
        })
        .catch(function () {
            // Extension context unavailable, ignore
        });
})();

