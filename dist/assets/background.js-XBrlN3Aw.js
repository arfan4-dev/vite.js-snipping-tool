chrome.runtime.onMessage.addListener(function(n,t,e){return chrome.tabs.captureVisibleTab(null,{format:"jpeg"},function(r){e({dataUrl:r})}),!0});
