const speechBubble = document.getElementById("speechBubble");
const startBtn = document.getElementById("startBtn");
const staffArea = document.getElementById("staffArea");
const question = document.getElementById("question");
const choices = document.getElementById("choices");
const result = document.getElementById("result");
const scoreText = document.getElementById("score");
const character = document.getElementById("character");
const correctSound = new Audio("/static/sounds/ding.mp3");
const wrongSound = new Audio("/static/sounds/wrong.mp3");

const notes = [
  { label: "도", key: "C4", clef: "treble", color: "#ff4d4d" },
  { label: "레", key: "D4", clef: "treble", color: "#ff9933" },
  { label: "미", key: "E4", clef: "treble", color: "#ffd633" },
  { label: "파", key: "F4", clef: "treble", color: "#4dff88" },
  { label: "솔", key: "G4", clef: "treble", color: "#4da6ff" }
];

let score = 0;
let answer = null;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function drawNote(noteObj) {
  staffArea.innerHTML = "";

  const VF = VexFlow;
  const keyForStaff = `${noteObj.key[0].toLowerCase()}/${noteObj.key[1]}`;

  const renderer = new VF.Renderer(
    staffArea,
    VF.Renderer.Backends.SVG
  );
  renderer.resize(620, 220);

  const context = renderer.getContext();

  const stave = new VF.Stave(140, 40, 300);
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

  character.src = "/static/images/character_idle.png";

  answer = notes[Math.floor(Math.random() * notes.length)];

  drawNote(answer);
  question.textContent = "오선의 음표를 보고 맞는 계이름을 고르세요.";

  let options = shuffle(notes);

  options.forEach(noteObj => {
    const btn = document.createElement("button");
    btn.textContent = noteObj.label;
    btn.dataset.label = noteObj.label;

    btn.style.backgroundColor = noteObj.color;
    btn.style.border = "none";

    if (noteObj.label === "미") {
      btn.style.color = "#000";
    } else {
      btn.style.color = "#fff";
    }

    btn.onclick = () => checkAnswer(noteObj.label, btn);
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
    if (btn.dataset.label === answer.label) {
      btn.classList.add("correct-glow");
    }
  });
}

function checkAnswer(selected, clickedBtn) {
  disableChoiceButtons();

  if (selected === answer.label) {
    result.textContent = `딩동댕! 정답은 ${answer.label}`;
    result.className = "result-correct";

    character.src = "/static/images/character_happy.png";

    correctSound.currentTime = 0;  // 🔥 반복 클릭 대비 초기화
    correctSound.play();           // 🔥 소리 재생

    clickedBtn.classList.add("correct-glow");
    score += 1;
  } else {
    result.textContent = `아쉬워요! 정답은 ${answer.label}`;
    result.className = "result-wrong";

    character.src = "/static/images/character_sad.png";

    wrongSound.currentTime = 0;   // 🔥 추가 (연속 클릭 대비)
    wrongSound.play();            // 🔥 추가

    clickedBtn.classList.add("wrong-shake");
    highlightCorrectButton();
}

  scoreText.textContent = `점수: ${score}`;

  setTimeout(makeQuestion, 1400);
}

startBtn.addEventListener("click", () => {
  speechBubble.classList.add("fade-out");
  startBtn.classList.add("fade-out");

  setTimeout(() => {
    speechBubble.style.display = "none";
    startBtn.style.display = "none";
    makeQuestion();
  }, 400);
});