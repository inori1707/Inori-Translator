"use strict";

chrome.contextMenus.create({
    title: '翻译: "%s"',
    contexts: ["selection"],
    onclick: function(info) {
        let query = info.selectionText.trim().replace(/-\n/g, '').replace(/\r\n/g, ' ')

        chrome.tabs.query({
            currentWindow: true,
            active: true
        }, function(tab) {
            chrome.tabs.sendMessage(tab[0].id, {
                type: 'GET_REQUEST_FROM_CONTEXTMENU',
                data: {
                    query: query
                }
            })

            doQuery(query, chrome.tabs.sendMessage.bind(null, tab[0].id))
        })
    }
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    doQuery(request.query, sendResponse)
    return true
})

function doQuery(query, sendResponse) {
    const appid = 'your appid here'
    const key = 'your key here'
    const salt = (new Date).getTime()
    const from = 'auto'
    const to = 'zh'
    const sign = MD5(appid + query + salt + key)
    let xhr = new XMLHttpRequest()
    xhr.open('GET', `http://api.fanyi.baidu.com/api/trans/vip/translate?q=${encodeURI(query)}&from=${from}&to=${to}&appid=${appid}&salt=${salt}&sign=${sign}`)
    xhr.onload = function() {
        let res = JSON.parse(xhr.response)
        if (res.error_msg) {
            sendResponse({
                type: 'TRANSLATE_RESULT',
                data: {
                    src: query,
                    res: null,
                    error_msg: res.error_msg,
                    status: -1
                }
            })
        } else {
            let count = localStorage.getItem('inori-translator-count') || 0
            localStorage.setItem('inori-translator-count', (+count) + query.length)

            sendResponse({
                type: 'TRANSLATE_RESULT',
                data: {
                    src: query,
                    res: res.trans_result[0].dst,
                    error_msg: null,
                    status: 0
                }
            })
        }
    }
    xhr.onerror = function() {
        sendResponse({
            type: 'TRANSLATE_RESULT',
            data: {
                src: query,
                res: null,
                error_msg: '网络错误',
                status: -1
            }
        })
    }
    xhr.send(null)
}