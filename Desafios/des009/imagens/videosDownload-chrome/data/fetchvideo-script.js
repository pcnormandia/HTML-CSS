/*
global browser, chrome, jQuery
*/
var browser = browser || chrome

var $jq = jQuery.noConflict(true)

function c2mHandleMessage (message) {
  if (message.action === '_setDownloadLinkAndFormat') {
    var inp = $jq('#form1 #input1').val()
    if (inp !== '' && inp.indexOf('youtube.com/watch?v=') > 0) {
      if (message.format === 'mp3') {
        if ($jq('#form1 #input1').val() !== '') {
          $jq('#grab1').trigger('click')
        }
      }
    }
  }
}

browser.runtime.onMessage.addListener(c2mHandleMessage)

browser.runtime.sendMessage({ 'action': 'getDownloadLinkAndFormat' })
