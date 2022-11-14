/*
global browser, chrome
*/
var browser = browser || chrome

function saveOptions (e) {
  e.preventDefault()

  var newOptions = {
    openNewTab: document.querySelector('#openNewTab').checked
  }

  browser.storage.local.set({
    options: newOptions
  })

  browser.runtime.sendMessage({ 'action': 'updateOptions' })
}

function restoreOptions () {
  function setCurrentOptions (result) {
    document.querySelector('#openNewTab').checked = result.options.openNewTab
  }

  browser.storage.local.get('options', setCurrentOptions)
}

function initOptionEvents () {
  restoreOptions()

  document.querySelector('#settings').addEventListener('submit', saveOptions)
}

document.addEventListener('DOMContentLoaded', initOptionEvents)
