/*
global browser, chrome, location, jQuery, MutationObserver
*/
var browser = browser || chrome

var $jq = jQuery.noConflict(true)
var oldUrl = location.href
var oldTitle = document.title

function modHandleMessage (message) {
  if (message.action === '_applyModifications') {
    var element = ''
    if (message.type === 'change') {
      element = $jq(message.selector)
      if (element) {
        element.html(message.content)
      }
    } else if (message.type === 'append') {
      element = $jq(message.selector)
      var existing = $jq('#' + message.content_id).length
      if (element && !existing) {
        element.append(message.content)
      }
    } else if (message.type === 'remove') {
      element = $jq(message.selector)
      if (element) {
        element.remove()
      }
    }
  } else if (message.action === '_applyActions') {
    var button = $jq('#youtube-download-button')
    button.unbind('click')
    button.click(function (event) {
      var title = getVideoTitle()

      $jq('#download-mp4').text(title + '.mp4')
      $jq('#download-mp4').parent().unbind('click')
      $jq('#download-mp4').parent().click(function (event) {
        browser.runtime.sendMessage({ 'action': 'doDownload', 'url': location.href, 'type': 'mp4' })
      })

      $jq('#download-mp3').text(title + '.mp3')
      $jq('#download-mp3').parent().unbind('click')
      $jq('#download-mp3').parent().click(function (event) {
        browser.runtime.sendMessage({ 'action': 'doDownload', 'url': location.href, 'type': 'mp3' })
      })

      $jq('#download-other').parent().unbind('click')
      $jq('#download-other').parent().click(function (event) {
        browser.runtime.sendMessage({ 'action': 'doDownload', 'url': location.href, 'type': 'other' })
      })

      var buttonOffset = $jq('#youtube-download-button').offset()
      var panelTop = buttonOffset.top + $jq('#youtube-download-button').height()
      var panelLeft = buttonOffset.left

      $jq('#youtube-download-panel').css({ top: panelTop, left: panelLeft })
      $jq('#youtube-download-panel').toggle()
    })

    $jq(document).click(function (event) {
      if (event.target.getAttribute('id') !== 'youtube-download-button') {
        $jq('#youtube-download-panel').hide()
      }
    })
  } else if (message.action === '_checkURL') {
    checkURL()
  }
}

browser.runtime.onMessage.addListener(modHandleMessage)

function getVideoTitle () {
  return document.title.replace(' - YouTube', '').trim()
}

function checkURL () {
  if (location.href.indexOf('youtube.com/watch?v=') !== -1) {
    browser.runtime.sendMessage({ 'action': 'setVideoData', 'url': location.href, 'title': getVideoTitle() })
  } else {
    browser.runtime.sendMessage({ 'action': 'setVideoData', 'url': location.href, 'title': '' })
  }
}

function checkModifications () {
  var button = $jq('#youtube-download-button')

  if (!button.length) {
    setTimeout(checkModifications, 2000)
  }
  if (typeof chrome.app.isInstalled !== 'undefined') {
    browser.runtime.sendMessage({ 'action': 'getModifications' })
  }
}

function checkReload () {
  if (oldUrl !== location.href || oldTitle !== document.title) {
    checkURL()
    checkModifications()
    oldUrl = location.href
    oldTitle = document.title
  }
}

// create an observer instance
var observer = new MutationObserver(function (mutations) {
  mutations.forEach(function (mutation) {
    checkReload()
  })
})

// configuration of the observer
var config = {
  attributes: true,
  childList: true,
  subtree: true,
  characterData: true
}

// pass in the target node, as well as the observer options
observer.observe(document.body, config)

checkURL()
checkModifications()
