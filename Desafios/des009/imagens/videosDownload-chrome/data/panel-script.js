/*
global browser,chrome
*/
var browser = browser || chrome

var videoURL = ''

function ypHandleMessage (message) {
  if (message.action === '_setVideoData') {
    videoURL = message.url
    var html = ''
    var s = 0
    if (message.title !== '') {
      html += '<div class="panel-item" id="div-download-mp4"><img class="panel-item-icon" src="download.png" /><a id="download-mp4" href="#">' + message.title + '.mp4' + '</a></div>'
      html += '<div class="panel-item" id="div-download-mp3"><img class="panel-item-icon" src="download.png" /><a id="download-mp3" href="#">' + message.title + '.mp3' + '</a></div>'
      html += '<div class="panel-item" id="div-download-other"><img class="panel-item-icon" src="download.png" /><a id="download-other" href="#">' + browser.i18n.getMessage('download_other_formats') + '</a></div>'
      s = 1
    } else {
      html += '<div class="panel-item" id="div-download-other"><img class="panel-item-icon" src="download.png" /><a id="download-other" href="#">' + browser.i18n.getMessage('download_other_videos') + '</a></div>'
    }
    document.getElementById('my-pannel').innerHTML = html
    if (s === 1) {
      document.getElementById('download-mp4').onclick = function () {
        browser.runtime.sendMessage({ 'action': 'doDownload', 'url': videoURL, 'type': 'mp4' })
      }

      document.getElementById('download-mp3').onclick = function () {
        browser.runtime.sendMessage({ 'action': 'doDownload', 'url': videoURL, 'type': 'mp3' })
      }
    }
    document.getElementById('download-other').onclick = function () {
      browser.runtime.sendMessage({ 'action': 'doDownload', 'url': videoURL, 'type': 'other' })
    }
  }
}

browser.runtime.onMessage.addListener(ypHandleMessage)

browser.runtime.sendMessage({ 'action': 'getVideoData' })
