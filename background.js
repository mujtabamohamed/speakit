let popupWindowId = null;

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "speak",
        title: "Speak this text",
        contexts: ["selection"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "speak") {
        chrome.storage.sync.set({ selectedText: info.selectionText }, () => {
            if (popupWindowId) {
                // If popup window is already open, focus on it and update the text
                chrome.windows.update(popupWindowId, { focused: true }, (window) => {
                    // Send a message to the popup to update the text
                    chrome.runtime.sendMessage({ action: 'updateText', text: info.selectionText });
                });
            } else {
                // Otherwise, create a new popup window
                chrome.windows.create({
                    url: chrome.runtime.getURL("popup.html"),
                    type: "popup",
                    width: 365,
                    height: 630
                }, (window) => {
                    popupWindowId = window.id;
                });
            }
        });
    }
});

chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === popupWindowId) {
        popupWindowId = null;
    }
});
