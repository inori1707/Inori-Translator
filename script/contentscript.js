"use strict";

let iconPopover
let resPopover
let selection
let queryPos

function createResPopover() {
    let elem = document.createElement('div')
    elem.classList.add('inori-popover')

    let fragment = document.createDocumentFragment()

    let h5 = document.createElement('h5')
    h5.classList.add('original-word')
    fragment.appendChild(h5)

    let hr = document.createElement('hr')
    fragment.appendChild(hr)

    let p = document.createElement('p')
    p.classList.add('translate-result')
    fragment.appendChild(p)

    elem.appendChild(fragment)

    return elem
}

function removeResPopover() {
    if (resPopover) {
        resPopover.parentNode.removeChild(resPopover)
        resPopover = null
    }
}

function displayResPopover() {
    const resPopoverWidth = 250
    const resPopoverHeight = 150

    if (!resPopover) {
        resPopover = createResPopover()
        document.body.appendChild(resPopover)
        setTimeout(() => resPopover && (resPopover.style.opacity = 1), 0)
    }

    [resPopover.style.left, resPopover.style.top] = calcPopoverPos(resPopoverWidth, resPopoverHeight)
}

function createIconPopover() {
    let elem = document.createElement('div')
    elem.classList.add('inori-mini-button')
    elem.addEventListener('click', doQuery)
    return elem
}

function removeIconPopover() {
    if (iconPopover) {
        iconPopover.parentNode.removeChild(iconPopover)
        iconPopover = null
    }
}

function displayIconPopover() {
    const iconPopoverWidth = 35
    const iconPopoverHeight = 35

    if (!iconPopover) {
        iconPopover = createIconPopover()
        document.body.appendChild(iconPopover)
        setTimeout(() => iconPopover && (iconPopover.style.opacity = 0.9), 0)
    }

    [iconPopover.style.left, iconPopover.style.top] = calcPopoverPos(iconPopoverWidth, iconPopoverHeight)
}

function calcPopoverPos(popoverWidth, popoverHeight) {
    const winScrollX = window.scrollX
    const winScrollY = window.scrollY
    const popoverOffsetX = 0
    const popoverOffsetY = 0
    let maxX, maxY
    let basePointX, basePointY
    let popoverX, popoverY

    maxX = winScrollX + window.innerWidth
    maxY = winScrollY + window.innerHeight

    if (selection.valid) {
        basePointX = winScrollX + selection.range.left + selection.range.width
        basePointY = winScrollY + selection.range.top + selection.range.height
    } else {
        basePointX = winScrollX + 　queryPos.x
        basePointY = winScrollY + 　queryPos.y
    }

    popoverX = (basePointX + popoverWidth > maxX ? basePointX - popoverWidth > maxX ? maxX : basePointX - popoverWidth : basePointX + popoverOffsetX) + 'px'
    popoverY = (basePointY + popoverHeight > maxY ? basePointY - popoverHeight > maxY ? maxY : basePointY - popoverHeight : basePointY + popoverOffsetY) + 'px'

    return [popoverX, popoverY]
}

function getCurrentSelection() {
    let selection = window.getSelection()
    let text = selection.toString().trim()
    let valid = selection.type === 'Range' && text
    let range = valid && selection.getRangeAt(0).getBoundingClientRect()

    text = text ? text.replace(/-\n/g, '').replace(/\r\n/g, ' ') : ''
    return {
        text,
        valid,
        range
    }
}

function isClickingPopover(event) {
    return (iconPopover && (event.target === iconPopover || iconPopover.contains(event.target))) || (resPopover && (event.target === resPopover || resPopover.contains(event.target)))
}

function doQuery() {
    removeIconPopover()
    displayResPopover()
    resPopover.getElementsByClassName('original-word').item(0).innerText = selection.text
    resPopover.getElementsByClassName('translate-result').item(0).innerText = '查询中...'

    chrome.runtime.sendMessage({
        query: selection.text
    }, function(response) {
        if (response.data.status === 0) {
            resPopover.getElementsByClassName('translate-result').item(0).innerText = response.data.res
        } else {
            resPopover.getElementsByClassName('translate-result').item(0).classList.add('translate-error')
            resPopover.getElementsByClassName('translate-result').item(0).innerText = '查询失败！' + response.data.error_msg
        }
    })
}


document.addEventListener('mouseup', function(event) {
    if (event.button == 2) {
        queryPos = {
            x: event.clientX,
            y: event.clientY,
        }
    }

    if (!isClickingPopover(event)) {
        selection = getCurrentSelection()
        if (selection.valid) {
            displayIconPopover()
        }
    }
})

document.addEventListener('mousedown', function(event) {
    if (!isClickingPopover(event)) {
        removeIconPopover()
        removeResPopover()
    }
})

document.addEventListener('dblclick', function() {
    if (selection.valid) {
        doQuery()
    }
})

chrome.runtime.onMessage.addListener(function(msg) {
    switch (msg.type) {
        case 'GET_REQUEST_FROM_CONTEXTMENU':
            displayResPopover()
            resPopover.getElementsByClassName('original-word').item(0).innerText = msg.data.query
            return

        case 'TRANSLATE_RESULT':
            if (!resPopover) {
                return
            }

            if (msg.data.status === 0) {
                resPopover.getElementsByClassName('translate-result').item(0).innerText = msg.data.res
            } else {
                resPopover.getElementsByClassName('translate-result').item(0).classList.add('translate-error')
                resPopover.getElementsByClassName('translate-result').item(0).innerText = '查询失败！' + msg.data.error_msg
            }
            return
    }
})