var practiceType = "sino"; /* sino, native, date, clock */
var answerMode = "number"; /* number, korean */
var waiting = false;
var clock = null;
var clock_ans = null;

var answer = "";

function randInt(a, b) {
  return Math.floor(Math.random() * (b - a + 1)) + a;
}
function isNumberKoreanChecked() {
  return $("#number-korean").is(":checked");
}
function isClockChecked() {
  return $("#time-show-clock").is(":checked");
}
function getSigfig() {
  return parseInt($("#sigfig").val());
}
function animateElement(element, opacity, callback) {
  $(element).animate({ opacity: opacity }, 200, callback);
}
function readQuestion() {
  readAloud($("#question").text());
}

function focusAns() {
  if ($("#ans").css("display") != "none") {
    $("#ans").focus();
  } else {
    $("#btn_show_answer").focus();
  }
}

function checkState() {
  practiceType = $("#practice-type-select")[0].value;
  $("#rangeSliderDiv,#sigFigDiv").css("display", (practiceType == 'sino') ? "flex" : "none");
  $("#timeSettingsDiv,#timeSettings2Div").css("display", (practiceType == 'clock') ? "flex" : "none");
  if (['date','clock'].includes(practiceType)) {
    $('#ans').css("display", "none");
    $('#btn_show_answer').css("display", "inline");
  } else {
    $('#ans').css("display", "inline");
    $('#btn_show_answer').css("display", "none");
  }
  if (practiceType == 'clock' && isClockChecked()) {
    if (isNumberKoreanChecked()) {
      $("#question,#clockCanvas-ans").css("display", "none");
      $("#clockCanvas").css("display", "block");
    } else {
      $("#question,#clockCanvas-ans").css("display", "block");
      $("#clockCanvas").css("display", "none");
    }
  } else {
    $("#question").css("display", "block");
    $('#clockCanvas,#clockCanvas-ans').css("display", "none");
  }

  if (isNumberKoreanChecked()) {
    answerMode = "korean";
    $("#ans")[0].type = "text";
  } else {
    answerMode = "number";
    $("#ans")[0].type = "number";
  }
  genQuestion();
}

function genQuestion() {
  var hangul = "";
  var number = "";
  if (practiceType == "native") {
    number = randInt(0, 99);
    hangul = number_to_native(number, false);
    number = number.toString();
  } else if (practiceType == "sino") {
    var [lowBound, upperBound] = $("#rangeSlider").slider("getValue");
    var mag = randInt(lowBound, upperBound); // 1 - 11
    var sigfig = Math.min(parseInt(getSigfig()), mag); // 1 - 11
    number = (randInt(Math.pow(10, sigfig - 1), Math.pow(10, sigfig) - 1) * (Math.pow(10, mag - sigfig))).toString(); // 1 - 1e11
    hangul = number_to_sino(number);
  } else if (practiceType == "clock") {
    var number_hour = randInt(0, 23);
    var number_minute = isClockChecked() ? randInt(0, 11) * 5 : randInt(0, 59);
    hangul = number_to_time(number_hour, number_minute, $('#time-use-short').is(":checked"))

    const time = new Date(2025, 1, 1, number_hour, number_minute);
    //const options = { dayPeriod:'narrow', hour: 'numeric', minute: '2-digit' }
    const options = { hour: 'numeric', minute: '2-digit', hour12:false }
    number = time.toLocaleTimeString(undefined, options);
  } else if (practiceType == "date") {
    /* note: june and october are exceptions: 유월, 시월*/
    const months = ["일월", "이월", "삼월", "사월", "오월", "유월", "칠월", "팔월", "구월", "시월", "십일월", "십이월"];

    const months_len = [31,29,31,30,31,30,31,31,30,31,30,31];
    var number_month = randInt(0, 11);
    var number_day = randInt(1, months_len[number_month])

    hangul = months[number_month] + " " + number_to_sino(number_day.toString()) + "일";
    const date = new Date(Date.UTC(2025, number_month /* 0..11 */, number_day));
    const options = { month: 'long', day: 'numeric' };
    number = date.toLocaleDateString(undefined, options);
  }
  hangul = hangul.trim();
  var questionText = "";
  if (answerMode == "number") {
    questionText = hangul;
    answer = number;
    if (practiceType == 'clock') {
      clock_ans.drawClock(number_hour, number_minute);
    }
  } else {
    questionText = number;
    answer = hangul;
    if (practiceType == 'clock') {
      clock.drawClock(number_hour, number_minute);
    }
  }
  $("#question").text(questionText);
  $("#ans").val("").attr("disabled", false);

  if (answerMode == "number") {
    readQuestion();
  }

  focusAns();
}

function checkAns() {
  var correct = false;
  if ($("#ans").val().replace(" ", "") == answer.replace(" ", "")) {
    $("#correct-ans").removeClass("text-danger").addClass("text-success")
    $("#correct-ans").text("Correct!")
    correct = true;
  } else {
    $("#correct-ans").removeClass("text-success").addClass("text-danger")
    if ((answerMode == "number") && (practiceType == "native" || practiceType == "sino")) {
      $("#correct-ans").text(parseInt(answer).toLocaleString());
    } else {
      $("#correct-ans").text(answer);
    }
  }
  if (correct) {
    waiting = true;
    animateElement("#correct-ans,#clockCanvas-ans", 1, () => {
      animateElement("#main", 0, () => {
        genQuestion();
        animateElement("#main", 1, () => {
          waiting = false;
        });
      });
      animateElement("#correct-ans,#clockCanvas-ans", 0);
    });
  } else {
    animateElement("#correct-ans,#clockCanvas-ans", 1, () => {
      $("#correct-ans").focus();
    });
    if (isNumberKoreanChecked() && answerMode == "korean") {
      readAloud(answer);
    }
  }
}

$(() => {
  $("#rangeSlider").slider().on('slideStop', genQuestion);
  clock = new Clock(document.getElementById('clockCanvas'));
  clock_ans = new Clock(document.getElementById('clockCanvas-ans'));

  $("#tempoSlider").slider().on('slideStop', readQuestion);

  $("#sigfig").val("11");
  $("#sigfig").on("input", () => {
    $("#sigFigDisplay").text(getSigfig());
  });
  $("#sigfig").change(checkState);

  const submitHandler = (e) => {
    if ($("#correct-ans").hasClass("text-danger") && $("#correct-ans").css("opacity") != "0") {
      waiting = true;
      animateElement("#main", 0, () => {
        genQuestion();
        animateElement("#main", 1, () => {
          waiting = false;
        });
      });
      animateElement("#correct-ans,#clockCanvas-ans", 0);
    } else {
      checkAns();
    }
    return false;
  }

  $("#btn_show_answer").click((e) => {
    submitHandler(e);
  });

  $("#ans").keydown((e) => {
    if (waiting) return false;

    // Submit Handler
    if (e.key == "Enter") {
      submitHandler(e);
    }

    if ($("#correct-ans").css("opacity") != "0") {
      return false;
    }

    // Validate Numbers Only
    if (answerMode == "korean") return true;
    valid = false;
    validKeys = ["Backspace", "ArrowLeft", "ArrowRight"]
    validKeys.forEach(key => {
      if (key == e.key) valid = true
    });
    if (!valid) {
      valid = (e.key.search(/[0-9]/) == 0);
    }
    if (!valid) {
      return false;
    }
  });

  checkState()

  $("#practice-type-select").change(checkState);
  $("#number-korean").change(checkState);
  $("#time-show-clock").change(checkState);
  $('#time-use-short').change(checkState);

  focusAns();
  
  startLoadingVoices();
  $('#tts-select').on("change", () => {
    const index = $('#tts-select')[0].value;
    selectVoice(index);
    readQuestion();
  });

  $("#question").click(() => {
    readQuestion();
  })
});
