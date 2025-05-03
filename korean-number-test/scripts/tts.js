var voice = null;
var voices = [];

/* Since the onvoiceschanged event does not work in every browser, we need to
 * periodically check if the voices are already loaded. */
function startLoadingVoices() {
  var tryCount = 0;
  var voiceChkerId = setInterval(() => {
      var voicesList = window.speechSynthesis.getVoices().filter((v) => {return v.lang=='ko_KR' || v.lang=='ko-KR';});
      if (voices.length > 0 && voicesList.length == voices.length || tryCount >= 10) {
        clearInterval(voiceChkerId);
      } else {
        voices = voicesList;
        voicesChangedHandler();
        tryCount += 1;
        if (voices.length > 0)
          $("#TtsNotFoundAlert").hide();
      }
    }, 1000);
}

function voicesChangedHandler() {
  var selectIndex = -1;
  $('#tts-select').find('option').remove()
  $('#tts-select').append($('<option>', { value: -1, text: "off"}));
  for (let i = 0; i < voices.length; i++) {
    if (selectIndex == -1 || voices[i].localService)
      selectIndex = i;
    let opt = $('<option>', { value: i, text: voices[i].name });
    $('#tts-select').append(opt);
  }
  $('#tts-select')[0].value = selectIndex;
  voice = voices[selectIndex];
}

function readAloud(s) {
  if (voice != null) {
    setTimeout(function() {
      var utterance = new SpeechSynthesisUtterance(s);
      utterance.voice = voice;
      utterance.lang = 'ko-KR';
      utterance.rate = $("#tempoSlider").slider('getValue')/100.0;
      speechSynthesis.cancel();
      speechSynthesis.speak(utterance);
      }, 100);
  }
}

function selectVoice(index) {
  voice = (index >= 0) ? voices[index] : null;
}
