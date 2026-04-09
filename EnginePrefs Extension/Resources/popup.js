var display = document.getElementById("url-display");

browser.runtime.sendMessage({ action: "getSearchEngineURL" })
    .then(function (response) {
        if (response && response.url) {
            display.textContent = response.url;
            display.classList.add("active");
        } else {
            display.textContent = "No custom URL set";
            display.classList.add("inactive");
        }
    })
    .catch(function () {
        display.textContent = "No custom URL set";
        display.classList.add("inactive");
    });
