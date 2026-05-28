const speechBubble = document.getElementById("speechBubble");
const startBtn = document.getElementById("startBtn");
const staffArea = document.getElementById("staffArea");
const question = document.getElementById("question");
const choices = document.getElementById("choices");
const result = document.getElementById("result");
const scoreText = document.getElementById("score");
const starBox = document.getElementById("starBox");

const character = document.getElementById("character");
const rangeBox = document.getElementById("rangeBox");
const rangeButtons = document.querySelectorAll(".rangeBtn");
const countBox = document.getElementById("countBox");
const countButtons = document.querySelectorAll(".countBtn");

const correctSound = new Audio("/static/sounds/ding.mp3");
const wrongSound = new Audio("/static/sounds/wrong.mp3");

const trebleNotes = [
  { id: "treble_C4", answerKey: "C4", label: "가온 도", key: "C4", clef: "treble", color: "#ff4d4d" },
  { id: "treble_D4", answerKey: "D4", label: "가온 레", key: "D4", clef: "treble", color: "#ff9933" },
  { id: "treble_E4", answerKey: "E4", label: "가온 미", key: "E4", clef: "treble", color: "#ffd633" },
  { id: "treble_F4", answerKey: "F4", label: "가온 파", key: "F4", clef: "treble", color: "#33cc66" },
  { id: "treble_G4", answerKey: "G4", label: "가온 솔", key: "G4", clef: "treble", color: "#3399ff" }
];

const bassNotes = [
  { id: "bass_F3", answerKey: "F3", label: "낮은 파", key: "F3", clef: "bass", color: "#33cc66" },
  { id: "bass_G3", answerKey: "G3", label: "낮은 솔", key: "G3", clef: "bass", color: "#3399ff" },
  { id: "bass_A3", answerKey: "A3", label: "낮은 라", key: "A3", clef: "bass", color: "#3f51b5" },
  { id: "bass_B3", answerKey: "B3", label: "낮은 시", key: "B3", clef: "bass", color: "#9c4dff" },
  { id: "bass_C4", answerKey: "C4", label: "가온 도", key: "C4", clef: "bass", color: "#ff4d4d" }
];

// 전체 모드 버튼용: 가온 도는 하나만 보이게 함
const allNotes = [
  ...bassNotes.filter(note => note.id !== "bass_C4"),
  ...trebleNotes
];

let currentNotes = trebleNotes;
let selectedRange = "treble";
let questionCount = 1;

let score = 0;
let stars = 0;
let answerSequence = [];
let userSequence = [];
let lastAnswerKeys = [];

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function addStar() {
  stars++;

  const star = document.createElement("span");
  star.textContent = "⭐";
  star.classList.add("star-pop");

  starBox.appendChild(star);
}

function setRange(range) {
  selectedRange = range;

  if (range === "treble") {
    currentNotes = trebleNotes;
  } else if (range === "bass") {
    currentNotes = bassNotes;
  } else {
    currentNotes = allNotes;
  }

  lastAnswerKeys = [];

  rangeButtons.forEach(btn => {
    btn.classList.remove("selected");
    if (btn.dataset.range === range) {
      btn.classList.add("selected");
    }
  });
}

function setQuestionCount(count) {
  questionCount = count;
  lastAnswerKeys = [];

  countButtons.forEach(btn => {
    btn.classList.remove("selected");
    if (Number(btn.dataset.count) === count) {
      btn.classList.add("selected");
    }
  });
}

rangeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    setRange(btn.dataset.range);
  });
});

countButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    setQuestionCount(Number(btn.dataset.count));
  });
});

function pickQuestionNotes() {
  let sourceNotes;

  if (selectedRange === "all") {
    sourceNotes = Math.random() < 0.5 ? bassNotes : trebleNotes;
  } else {
    sourceNotes = currentNotes;
  }

  let availableNotes = sourceNotes.filter(note => {
    return !lastAnswerKeys.includes(note.answerKey);
  });

  if (availableNotes.length < questionCount) {
    availableNotes = sourceNotes;
  }

  const pickedNotes = shuffle(availableNotes).slice(0, questionCount);

  lastAnswerKeys = pickedNotes.map(note => note.answerKey);

  return pickedNotes;
}

function getOptions() {
  if (selectedRange === "treble") {
    return trebleNotes;
  }

  if (selectedRange === "bass") {
    return bassNotes;
  }

  return allNotes;
}

function drawNotes(noteList) {
  staffArea.innerHTML = "";

  const VF = VexFlow;

  const renderer = new VF.Renderer(
    staffArea,
    VF.Renderer.Backends.SVG
  );

  const renderWidth = 620;
  const renderHeight = 380;

  renderer.resize(renderWidth, renderHeight);

  const context = renderer.getContext();

  const stave = new VF.Stave(140, 70, 300);
  stave.addClef(noteList[0].clef);
  stave.setContext(context).draw();

  const noteStartX = stave.getNoteStartX();
  const noteEndX = stave.getNoteEndX();

  const leftPadding = 30;
  const rightPadding = 30;

  const usableStartX = noteStartX + leftPadding;
  const usableEndX = noteEndX - rightPadding;
  const usableWidth = usableEndX - usableStartX;

  noteList.forEach((noteObj, index) => {
    const keyForStaff = `${noteObj.key[0].toLowerCase()}/${noteObj.key[1]}`;

    const note = new VF.StaveNote({
      clef: noteObj.clef,
      keys: [keyForStaff],
      duration: "w"
    });

    const tickContext = new VF.TickContext();
    tickContext.addTickable(note).preFormat();

    const noteWidth = note.getWidth();

    let finalX;

    if (noteList.length === 1) {
      finalX = usableStartX + (usableWidth / 2) - (noteWidth / 2);
    } else if (noteList.length === 2) {
      finalX = usableStartX + (usableWidth * (index + 1) / 3) - (noteWidth / 2);
    } else {
      finalX = usableStartX + (usableWidth * (index + 1) / 4) - (noteWidth / 2);
    }

    finalX = finalX - 190;

    tickContext.setX(finalX);

    note.setTickContext(tickContext);
    note.setStave(stave);
    note.setContext(context).draw();

    const noteGroup = staffArea.querySelectorAll(".vf-stavenote")[index];

    if (noteGroup) {
      noteGroup.setAttribute("transform", "translate(0, 0.5)");
    }
  });

  const svg = staffArea.querySelector("svg");

  if (svg) {
    const isMobile = window.innerWidth <= 600;

    svg.style.transform = "scale(1.3, 2)";
    svg.style.transformOrigin = "top center";
    svg.style.display = "block";

    if (isMobile) {
      svg.style.height = "150px";
      svg.style.marginTop = "-70px";
    } else {
      svg.style.height = "240px";
      svg.style.marginTop = "-20px";
    }
  }
}

function makeQuestion() {
  result.textContent = "";
  result.className = "";
  choices.innerHTML = "";
  userSequence = [];

  character.src = "/static/images/character_idle.png";

  answerSequence = pickQuestionNotes();

  drawNotes(answerSequence);

  if (questionCount === 1) {
    question.textContent = "오선의 음표를 보고 맞는 계이름을 고르세요.";
  } else {
    question.textContent = `오선의 음표 ${questionCount}개를 보고 순서대로 계이름을 눌러보세요.`;
  }

  const options = getOptions();

  options.forEach(noteObj => {
    const btn = document.createElement("button");
    btn.textContent = noteObj.label;
    btn.dataset.answerKey = noteObj.answerKey;

    btn.style.backgroundColor = noteObj.color;
    btn.style.border = "none";

    if (
      noteObj.label === "가온 미" ||
      noteObj.label === "낮은 시"
    ) {
      btn.style.color = "#000";
    } else {
      btn.style.color = "#fff";
    }

    btn.onclick = () => checkAnswer(noteObj.answerKey, btn);
    choices.appendChild(btn);
  });
}

function disableChoiceButtons() {
  const buttons = choices.querySelectorAll("button");
  buttons.forEach(btn => {
    btn.disabled = true;
  });
}

function highlightCorrectSequence() {
  const buttons = choices.querySelectorAll("button");

  buttons.forEach(btn => {
    const isCorrect = answerSequence.some(note => {
      return note.answerKey === btn.dataset.answerKey;
    });

    if (isCorrect) {
      btn.classList.add("correct-glow");
    }
  });
}

function checkAnswer(selectedKey, clickedBtn) {
  userSequence.push(selectedKey);

  const currentIndex = userSequence.length - 1;
  const correctAnswerKey = answerSequence[currentIndex].answerKey;

  if (selectedKey !== correctAnswerKey) {
    disableChoiceButtons();

    result.textContent = `아쉬워요! 다시 해볼까요?`;
    result.className = "result-wrong";

    character.src = "/static/images/character_sad.png";

    wrongSound.currentTime = 0;
    wrongSound.play();

    clickedBtn.classList.add("wrong-shake");
    highlightCorrectSequence();

    setTimeout(makeQuestion, 1600);
    return;
  }

  clickedBtn.classList.add("correct-glow");

  if (userSequence.length === answerSequence.length) {
    disableChoiceButtons();

    if (questionCount === 1) {
      result.textContent = `딩동댕! 정답은 ${answerSequence[0].label}`;
    } else {
      result.textContent = `딩동댕! 모두 맞았어요!`;
    }

    result.className = "result-correct";

    character.src = "/static/images/character_happy.png";

    correctSound.currentTime = 0;
    correctSound.play();

    score += 1;
    scoreText.textContent = `점수: ${score}`;

    if (score % 10 === 0) {
      addStar();

      result.textContent = "⭐ 별을 획득했어요!";
      result.className = "result-correct";
    }

    setTimeout(makeQuestion, 1600);
  } else {
    result.textContent = `${userSequence.length}번째 정답! 다음 음은?`;
  }
}

startBtn.addEventListener("click", () => {
  speechBubble.classList.add("fade-out");
  startBtn.classList.add("fade-out");
  rangeBox.classList.add("fade-out");
  countBox.classList.add("fade-out");

  setTimeout(() => {
    speechBubble.style.display = "none";
    startBtn.style.display = "none";
    rangeBox.style.display = "none";
    countBox.style.display = "none";
    makeQuestion();
  }, 400);
});
