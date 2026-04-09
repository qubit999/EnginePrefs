// rule-builder.js
// Loaded before background.js. Provides DNR rule management for Safari 17.x
// and exports globals that background.js depends on.

var versionMajor = 0;
try {
    var versionString = navigator.userAgent.split("Version/")[1].split(" ")[0];
    versionMajor = parseInt(versionString);
} catch (e) {
    // Can't parse Safari version; DNR will be skipped
}

// Every known domain for each search engine
var domainMap = {
    "Google": [
        "google.com", "google.co.uk", "google.ca", "google.com.au",
        "google.de", "google.fr", "google.co.jp", "google.co.in",
        "google.es", "google.it", "google.com.br", "google.nl",
        "google.pl", "google.ru", "google.com.mx", "google.se",
        "google.ch", "google.at", "google.be", "google.pt",
        "google.dk", "google.no", "google.fi", "google.ie",
        "google.co.nz", "google.co.za", "google.co.kr", "google.co.id",
        "google.com.tw", "google.co.th", "google.com.ar", "google.com.ua",
        "google.com.tr", "google.com.ph", "google.com.eg", "google.com.pk",
        "google.com.co", "google.com.vn", "google.com.ng", "google.com.pe",
        "google.com.my", "google.com.sg", "google.com.hk", "google.com.bd",
        "google.ro", "google.hu", "google.cz", "google.gr",
        "google.bg", "google.rs", "google.hr", "google.sk",
        "google.si", "google.lt", "google.lv", "google.ee",
        "google.cl", "google.com.ec", "google.com.do", "google.com.gt",
        "google.co.ve", "google.com.bo", "google.com.py", "google.com.uy",
        "google.co.cr", "google.com.pa", "google.hn", "google.com.sv",
        "google.com.ni", "google.co.ke", "google.co.tz", "google.co.ug",
        "google.com.gh", "google.com.et", "google.co.zw", "google.co.zm",
        "google.com.ly", "google.dz", "google.tn", "google.co.ma",
        "google.com.sa", "google.ae", "google.com.qa", "google.com.kw",
        "google.com.om", "google.com.bh", "google.jo", "google.iq",
        "google.ps", "google.com.lb", "google.az", "google.ge",
        "google.kz", "google.am", "google.com.np", "google.lk",
        "google.com.mm", "google.com.kh", "google.la", "google.com.bn",
        "google.mn", "google.com.af", "google.com.pk", "google.com.na",
        "google.co.bw", "google.co.ls", "google.mw", "google.co.mz",
        "google.rw", "google.bi", "google.cd", "google.cg",
        "google.cm", "google.ci", "google.sn", "google.ml",
        "google.bf", "google.tg", "google.bj", "google.ne",
        "google.mg", "google.mu", "google.sc", "google.dj",
        "google.ga", "google.td", "google.cf", "google.com.cu",
        "google.com.jm", "google.tt", "google.com.pr", "google.bs",
        "google.gy", "google.sr", "google.com.bz", "google.ht",
        "google.dm", "google.com.ag", "google.com.vc", "google.ms",
        "google.com.ai", "google.vg", "google.co.vi", "google.pn",
        "google.ws", "google.to", "google.nu", "google.nr",
        "google.ki", "google.fm", "google.tl", "google.com.sb",
        "google.vu", "google.com.fj", "google.com.pg", "google.as",
        "google.co.ck", "google.gl", "google.is", "google.im",
        "google.je", "google.gg", "google.sh", "google.st",
        "google.cv", "google.sm", "google.ad", "google.li",
        "google.lu", "google.mk", "google.al", "google.ba",
        "google.me", "google.md", "google.by", "google.com.mt",
        "google.com.gi", "google.cat", "google.co.hu", "google.co.uz",
        "google.co.ao", "google.com.tj", "google.tm", "google.kg",
        "google.bt", "google.mv", "google.so", "google.gm",
        "google.com.sl", "google.com.cy", "google.cn",
        "google.com.gr", "google.com.ru"
    ],
    "DuckDuckGo": [
        "duckduckgo.com", "duckduckgo.co.uk", "duckduckgo.ca",
        "duckduckgo.com.au", "duckduckgo.pl", "duckduckgo.jp",
        "duckduckgo.co", "duckduckgo.com.mx", "duckduckgo.com.tw",
        "duckduckgo.dk", "duckduckgo.in", "duckduckgo.ke",
        "duckduckgo.mx", "duckduckgo.nl", "duckduckgo.org",
        "duckduckgo.sg", "duckduckgo.uk", "duckgo.com",
        "ddg.co", "ddg.gg", "duck.co", "duck.com"
    ],
    "Yahoo": ["search.yahoo.com"],
    "Ecosia": ["ecosia.org"],
    "Bing": ["bing.com"],
    "Sogou": ["sogou.com", "m.sogou.com", "so.com", "m.so.com"],
    "Baidu": ["baidu.com", "m.baidu.com"],
    "Yandex": [
        "yandex.ru", "yandex.com", "yandex.ua", "yandex.by",
        "yandex.com.ru", "yandex.com.ua", "yandex.eu",
        "yandex.ee", "yandex.lt", "yandex.lv", "yandex.md",
        "yandex.uz", "yandex.mx", "yandex.de", "yandex.ie",
        "yandex.in", "yandex.qa", "yandex.so", "yandex.nu",
        "yandex.tj", "yandex.dk", "yandex.es", "yandex.pt",
        "yandex.pl", "yandex.lu", "yandex.it", "yandex.az",
        "yandex.ro", "yandex.rs", "yandex.sk", "yandex.no",
        "yandex.org", "yandex.net", "yandex.net.ru", "yandex.do",
        "yandex.tm", "yandex.asia", "yandex.mobi", "ya.ru"
    ]
};

// Maps each param name to the set of domains that use it
var paramDomainMap = {
    "q": function () {
        return [].concat(
            domainMap["Google"],
            domainMap["DuckDuckGo"],
            domainMap["Ecosia"],
            domainMap["Bing"],
            ["so.com", "m.so.com"]
        );
    },
    "p": function () { return domainMap["Yahoo"]; },
    "text": function () { return domainMap["Yandex"]; },
    "wd": function () { return ["baidu.com"]; },
    "word": function () { return ["m.baidu.com"]; },
    "query": function () { return ["sogou.com"]; },
    "keyword": function () { return ["m.sogou.com"]; }
};

// Flat list of every supported domain
var allSupportedDomains = [].concat(
    domainMap["Google"], domainMap["DuckDuckGo"], domainMap["Ecosia"],
    domainMap["Bing"], domainMap["Yahoo"], domainMap["Sogou"],
    domainMap["Yandex"], domainMap["Baidu"]
);

function stringIsValid(s) {
    return s != null && typeof s === "string" && s.trim().length > 0;
}

// Extract the hostname from the user's custom search URL
function getCustomSearchHost(customURL) {
    if (!stringIsValid(customURL)) return null;
    try {
        return new URL(customURL.replace("%s", "test")).hostname;
    } catch (e) {
        return null;
    }
}

// Build DNR redirect rules for all engines that use the given param key
function buildRulesForParam(paramKey, domains, customURL, startId) {
    var regexSub = customURL.replace("%s", "\\1");
    var regexFilter = "^https?.*[?&]" + paramKey + "=([^&#]*).*$";

    var requestDomains = [];
    for (var i = 0; i < domains.length; i++) {
        var d = domains[i];
        requestDomains.push(d);
        if (d.indexOf("www.") !== 0) {
            requestDomains.push("www." + d);
        }
    }

    var excludedInitiatorDomains = [];
    var customHost = getCustomSearchHost(customURL);
    if (customHost) {
        excludedInitiatorDomains.push(customHost);
        if (customHost.indexOf("www.") === 0) {
            excludedInitiatorDomains.push(customHost.slice(4));
        } else {
            excludedInitiatorDomains.push("www." + customHost);
        }
    }

    return [{
        id: startId,
        priority: 1,
        action: {
            type: "redirect",
            redirect: { regexSubstitution: regexSub }
        },
        condition: {
            resourceTypes: ["main_frame"],
            requestDomains: requestDomains,
            regexFilter: regexFilter,
            excludedInitiatorDomains: excludedInitiatorDomains
        }
    }];
}

function getRedirectRules(customURL) {
    if (!stringIsValid(customURL)) return [];

    var rules = [];
    var idCounter = 1;
    var paramKeys = Object.keys(paramDomainMap);

    for (var i = 0; i < paramKeys.length; i++) {
        var paramKey = paramKeys[i];
        var domains = paramDomainMap[paramKey]();
        var newRules = buildRulesForParam(paramKey, domains, customURL, idCounter);
        rules = rules.concat(newRules);
        idCounter += newRules.length;
    }
    return rules;
}

async function clearDynamicRules() {
    try {
        var currentRules = await browser.declarativeNetRequest.getDynamicRules();
        if (currentRules.length > 0) {
            var ids = currentRules.map(function (r) { return r.id; });
            await browser.declarativeNetRequest.updateDynamicRules({ removeRuleIds: ids });
        }
    } catch (e) {
        console.log("EnginePrefs: failed to clear DNR rules", e);
    }
}

async function synchronizeRules(customURL) {
    await clearDynamicRules();

    if (!stringIsValid(customURL)) return;

    try {
        var rules = getRedirectRules(customURL);
        if (rules.length > 0) {
            await browser.declarativeNetRequest.updateDynamicRules({ addRules: rules });
            console.log("EnginePrefs: registered " + rules.length + " DNR rules");
        }
    } catch (e) {
        console.error("EnginePrefs: DNR rule registration failed", e);
    }
}

// DNR is needed for Safari 17.x. Safari 18+ works with webNavigation alone.
function shouldUseDNR() {
    return versionMajor >= 17 && versionMajor < 18;
}

async function initialize() {
    if (shouldUseDNR()) {
        try {
            var data = await browser.storage.local.get("searchEngineURL");
            var url = data.searchEngineURL;
            if (stringIsValid(url)) {
                await synchronizeRules(url);
            }
        } catch (e) {
            console.error("EnginePrefs: error during DNR initialization", e);
        }
    } else if (versionMajor >= 18) {
        // Safari 18+: clear any leftover DNR rules, rely on webNavigation
        await clearDynamicRules();
    }
}
