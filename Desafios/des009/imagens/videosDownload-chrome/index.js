/*
global browser, chrome, XMLHttpRequest
*/
var browser = browser || chrome

var modifications = []
var videoURL = ''
var videoTitle = ''
var downloadLink = ''
var downloadFormat = ''
var activeTabId = null
var options = null
var serverHostProto = 'https'
var serverHost = 'catchvideo.net'
var serverMP3Host = serverHost + '/convert-youtube-to-mp3'
var isDebug = false

String.prototype.format = function () { // eslint-disable-line no-extend-native
  var a = this
  for (var k in arguments) {
    a = a.replace('{' + k + '}', arguments[k])
  }
  return a
}

// load add-on options
function getCurrentOptions (result) {
  if (result.options) {
    options = result.options
  } else {
    let initialOptions = { openNewTab: true }

    browser.storage.local.set({
      options: initialOptions
    })

    options = initialOptions
  }
}

browser.storage.local.get('options', function (result) {
  getCurrentOptions(result)
})

// load add-on config
function loadAddonConfig () {
  var xhttp = new XMLHttpRequest()
  xhttp.onreadystatechange = function () {
    if (this.readyState === 4) {
      var config = JSON.parse(this.responseText)

      if (config.modifications) {
        modifications = config.modifications
      }
    }
  }
  xhttp.open('GET', browser.extension.getURL('data/configuration.json'), true)
  xhttp.overrideMimeType('application/json')
  xhttp.send()
}

loadAddonConfig()

// disable action by default
browser.browserAction.disable()

browser.tabs.onActivated.addListener(
  function (activeInfo) {
    activeTabId = activeInfo.tabId
    browser.browserAction.disable()
    browser.tabs.sendMessage(activeInfo.tabId, { 'action': '_checkURL' })
  }
)

function handleMessage (message, sender) {
  if (message.action === 'updateOptions') {
    browser.storage.local.get('options', function (result) {
      getCurrentOptions(result)
    })
  } else if (message.action === 'doDownload') {
    downloadLink = message.url
    downloadFormat = message.type
    var _serverHost = serverHost
    var _arg = '{0}://{1}?url={2}&addon=1&browser=ch'

    if (downloadLink.indexOf('youtube.com/watch?v=') > 0) {
      if (downloadFormat === 'mp3') {
        _serverHost = serverMP3Host
        _arg += '&auto=1'
      } else if (downloadFormat === 'other') {
        _serverHost = serverMP3Host
      }
    }

    if (options.openNewTab) {
      browser.tabs.create({ url: _arg.format(serverHostProto, _serverHost, downloadLink) })
    } else {
      browser.tabs.update(activeTabId, { url: _arg.format(serverHostProto, _serverHost, downloadLink) })
    }
  } else if (message.action === 'getModifications') {
    for (var i = 0; i < modifications.length; i++) {
      var content = modifications[i].content

      content = content.replace('##download##', browser.i18n.getMessage('download'))
      content = content.replace('##download-icon-url##', browser.extension.getURL('data/download-w.png'))
      content = content.replace('##download_other_formats##', browser.i18n.getMessage('download_other_formats'))

      browser.tabs.sendMessage(sender.tab.id,
        {
          'action': '_applyModifications',
          'type': modifications[i].type,
          'selector': modifications[i].selector,
          'content': content,
          'content_id': modifications[i].content_id
        })
    }

    browser.tabs.sendMessage(sender.tab.id, { 'action': '_applyActions' }) // setup red button
  } else if (message.action === 'getVideoData') {
    browser.runtime.sendMessage(
      { 'action': '_setVideoData',
        'url': videoURL,
        'title': videoTitle }
    )
  } else if (message.action === 'setVideoData') {
    videoURL = ''
    videoTitle = ''

    if (sender.tab.id === activeTabId) {
      videoURL = message.url
      videoTitle = message.title
    }

    browser.runtime.sendMessage({ 'action': '_setVideoData', 'url': videoURL, 'title': videoTitle })

    browser.browserAction.enable()
  }
}

browser.runtime.onMessage.addListener(handleMessage)

// install handler
function handleInstalled (details) {
  if (details.reason === 'install') {
    if (!isDebug) {
      browser.tabs.create({
        url: '{0}://{1}/addons/chrome/install'.format(serverHostProto, serverHost)
      })
    }
  }
}

if (!isDebug) {
  browser.runtime.setUninstallURL('{0}://{1}/addons/chrome/uninstall'.format(serverHostProto, serverHost))
}

if (browser.runtime.onInstalled) {
  browser.runtime.onInstalled.addListener(handleInstalled)
}
