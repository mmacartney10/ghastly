var page = require('webpage').create();
var fs = require('fs');
var currentSelector;

var path = '';
var referenceFolder = 'reference/';
var testFolder = 'test/';

var args = require('system').args;
var isReference = args[1] === 'Test' ? false : true;
var data = JSON.parse(args[2]);
var viewportName = args[3];
var viewports = args[4];
var currentDirectory = args[5] + '/ocular/screenshots/';

function openPage () {
  page.open(data.pageUrl, function (status) {
    if(status !== 'success') return;

    checkIfIsReference();
    setViewPortSize();
    loopThroughEachComponent();

    phantom.exit();
  });
}

function checkIfIsReference () {
  path = currentDirectory;
  path += isReference ? referenceFolder : testFolder;
}

function setViewPortSize () {
  var viewportsArray = viewports.split(',');

  page.viewportSize = {
    width: viewportsArray[0],
    height: viewportsArray[1]
  };
}

function loopThroughEachComponent () {
  for (var selector in data.selectorList) {
    currentSelector = selector;
    handleEachComponent();
  }
}

function handleEachComponent () {
  clipPageToComponent(data.selectorList[currentSelector]);
  screenshotElement();
  handleBase64();
}

function clipPageToComponent (selector) {
  page.clipRect = page.evaluate (function (selector) {
    return document.querySelectorAll(selector)[0].getBoundingClientRect();
  }, selector);
}

function screenshotElement () {
  var imageScreenShotPath = path + screenShotName() + '.png';
  page.render(imageScreenShotPath);
  logReferenceMessage();
}

function logReferenceMessage () {
  console.log(screenShotName());
}

function handleBase64 () {
  var base64Path = getBase64Path();
  writeBase64(base64Path);
}

function writeBase64 (base64Path) {
  fs.write(base64Path, getBase64Image(), 'w');
}

function screenShotName () {
  return viewportName + '--' + currentSelector;
}

function getBase64Image () {
  return page.renderBase64('PNG');
}

function getBase64Path () {
  return path + screenShotName() + '.txt';
}

openPage();
