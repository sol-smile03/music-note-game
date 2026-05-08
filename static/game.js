const speechBubble = document.getElementById("speechBubble");
const startBtn = document.getElementById("startBtn");
const staffArea = document.getElementById("staffArea");
const question = document.getElementById("question");
const choices = document.getElementById("choices");
const result = document.getElementById("result");
const scoreText = document.getElementById("score");
const character = document.getElementById("character");
const rangeBox = document.getElementById("rangeBox");
const rangeButtons = document.querySelectorAll(".rangeBtn");

const correctSound = new Audio("/static/sounds/ding.mp3");
const wrongSound = new Audio("/static/sounds/wrong.mp3");

const trebleNotes = [
  { id: "treble_C4", label: "가온 도", key: "C4", clef: "treble", color: "#ff4d4d" },
  { id: "treble_D4", label: "가온 레", key: "D4", clef: "treble", color: "#ff9933" },
  { id: "treble_E4", label: "가온 미", key: "E4", clef: "treble", color: "#ffd633" },
  { id: "treble_F4", label: "가온 파", key: "F4", clef: "treble", color: "#33cc66" },
  { id: "treble_G4", label: "가온 솔", key: "G4", clef: "treble", color: "#3399ff" }
];

const bassNotes = [
  { id: "bass_F3", label: "낮은 파", key: "F3", clef: "bass", color: "#33cc66" },
  { id: "bass_G3", label: "낮은 솔", key: "G3", clef: "bass", color: "#3399ff" },
  { id: "bass_A3", label: "낮은 라", key: "A3", clef: "bass", color: "#3f51b5" },
  { id: "bass_B3", label: "낮은 시", key: "B3", clef: "bass", color: "#9c4dff" },
  { id: "bass_C4", label: "가온 도", key: "C4", clef: "bass", color: "#ff4d4d" }
];

const allNotes = [
  ...bassNotes.filter(note => note.id !== "bass_C4"),
  ...trebleNotes
];

let currentNotes = trebleNotes;
let selectedRange = "treble";
let score = 0;
let answer = null;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
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

  rangeButtons.forEach(btn => {
    btn.classList.remove("selected");
    if (btn.dataset.range === range) {
      btn.classList.add("selected");
    }
  });
}

rangeButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    setRange(btn.dataset.range);
  });
});

function drawNote(noteObj) {
  staffArea.innerHTML = "";

  const VF = VexFlow;
  const keyForStaff = `${noteObj.key[0].toLowerCase()}/${noteObj.key[1]}`;

  const renderer = new VF.Renderer(
    staffArea,
    VF.Renderer.Backends.SVG
  );

  const isMobile = window.innerWidth < 600;

const renderWidth = isMobile ? 760 : 620;
const renderHeight = isMobile ? 340 : 260;

const staveX = isMobile ? 80 : 140;
const staveY = isMobile ? 90 : 60;
const staveWidth = isMobile ? 520 : 300;

renderer.resize(renderWidth, renderHeight);

const context = renderer.getContext();

const stave = new VF.Stave(staveX, staveY, staveWidth);
stave.addClef(noteObj.clef);
stave.setContext(context).draw();

const note = new VF.StaveNote({
  clef: noteObj.clef,
  keys: [keyForStaff],
  duration: "w"
});

  const tickContext = new VF.TickContext();
  tickContext.addTickable(note).preFormat();

  const noteStartX = stave.getNoteStartX();
  const noteEndX = stave.getNoteEndX();
  const centerX = (noteStartX + noteEndX) / 2;

  const noteWidth = note.getWidth();
  const finalX = centerX - (noteWidth / 2) - 180;

  tickContext.setX(finalX);

  note.setTickContext(tickContext);
  note.setStave(stave);
  note.setContext(context).draw();
}

function makeQuestion() {
  result.textContent = "";
  result.className = "";
  choices.innerHTML = "";

  character.src = "static/images/character_idle.png";

  answer = currentNotes[Math.floor(Math.random() * currentNotes.length)];

  drawNote(answer);
  question.textContent = "오선의 음표를 보고 맞는 계이름을 고르세요.";

  let options = currentNotes;

  options.forEach(noteObj => {
    const btn = document.createElement("button");
    btn.textContent = noteObj.label;
    btn.dataset.id = noteObj.id;

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

    btn.onclick = () => checkAnswer(noteObj.id, btn);
    choices.appendChild(btn);
  });
}

function disableChoiceButtons() {
  const buttons = choices.querySelectorAll("button");
  buttons.forEach(btn => {
    btn.disabled = true;
  });
}

function highlightCorrectButton() {
  const buttons = choices.querySelectorAll("button");
  buttons.forEach(btn => {
    if (btn.dataset.id === answer.id) {
      btn.classList.add("correct-glow");
    }
  });
}

function checkAnswer(selectedId, clickedBtn) {
  disableChoiceButtons();

  if (selectedId === answer.id) {
    result.textContent = `딩동댕! 정답은 ${answer.label}`;
    result.className = "result-correct";

    character.src = "static/images/character_happy.png";

    correctSound.currentTime = 0;
    correctSound.play();

    clickedBtn.classList.add("correct-glow");
    score += 1;
  } else {
    result.textContent = `아쉬워요! 정답은 ${answer.label}`;
    result.className = "result-wrong";

    character.src = "static/images/character_sad.png";

    wrongSound.currentTime = 0;
    wrongSound.play();

    clickedBtn.classList.add("wrong-shake");
    highlightCorrectButton();
  }

  scoreText.textContent = `점수: ${score}`;

  setTimeout(makeQuestion, 1400);
}

startBtn.addEventListener("click", () => {
  speechBubble.classList.add("fade-out");
  startBtn.classList.add("fade-out");
  rangeBox.classList.add("fade-out");

  setTimeout(() => {
    speechBubble.style.display = "none";
    startBtn.style.display = "none";
    rangeBox.style.display = "none";
    makeQuestion();
  }, 400);
});
