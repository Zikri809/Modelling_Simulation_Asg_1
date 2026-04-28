const STORAGE_KEY = "programmeChoiceModelSession";

const factorInfo = [
  { key: "interest", label: "Interest", help: "How much the field feels appealing." },
  { key: "exam", label: "Exam fit", help: "How well results match entry needs." },
  { key: "career", label: "Career outlook", help: "Jobs, salary, and future options." },
  { key: "location", label: "Location fit", help: "Distance, city, and comfort." },
  { key: "fees", label: "Fee comfort", help: "How affordable the programme feels." },
  { key: "explore", label: "Trying new areas", help: "Openness to a less familiar path." }
];

//Programme data from Aiman's input table
const aimanProgrammes = [
  { name: "Pure Sciences", ratings: [5, 5, 3, 3, 4, 2] },
  { name: "Applied Sciences", ratings: [4, 5, 4, 3, 3, 3] },
  { name: "Engineering", ratings: [4, 5, 5, 2, 5, 2] },
  { name: "Accounting", ratings: [3, 4, 4, 4, 4, 2] },
  { name: "Management", ratings: [3, 3, 3, 5, 3, 3] },
  { name: "Arts", ratings: [2, 3, 2, 4, 2, 4] }
];

//Weights given in the assignment
const assignmentWeights = [0.30, 0.20, 0.25, 0.10, 0.10, 0.05];

//Stores the current user input and latest result
const state = {
  selectedProgramme: 0,
  programmes: [],
  priorities: assignmentWeights.map((weight) => Math.round(weight * 100)),
  draftPriorities: assignmentWeights.map((weight) => Math.round(weight * 100)),
  results: null
};

const elements = {
  setupOverlay: document.getElementById("setupOverlay"),
  useAimanButton: document.getElementById("useAimanButton"),
  useCustomButton: document.getElementById("useCustomButton"),
  newSessionButton: document.getElementById("newSessionButton"),
  resetWeightsButton: document.getElementById("resetWeightsButton"),
  confirmWeightsButton: document.getElementById("confirmWeightsButton"),
  weightTotalStatus: document.getElementById("weightTotalStatus"),
  saveStatus: document.getElementById("saveStatus"),
  bestProgramme: document.getElementById("bestProgramme"),
  bestChance: document.getElementById("bestChance"),
  programmeSelect: document.getElementById("programmeSelect"),
  programmeName: document.getElementById("programmeName"),
  ratingControls: document.getElementById("ratingControls"),
  weightControls: document.getElementById("weightControls"),
  probabilityChart: document.getElementById("probabilityChart"),
  resultRows: document.getElementById("resultRows")
};

function cloneProgrammes(programmes) {
  //Clones the programme data so the original data is not changed
  return programmes.map((programme) => ({
    name: programme.name,
    ratings: [...programme.ratings]
  }));
}

function createCustomProgrammes() {
  return aimanProgrammes.map((programme) => ({
    name: programme.name,
    ratings: [3, 3, 3, 3, 3, 3]
  }));
}

function normalizePriorities(priorities) {
  //Cleans the priority values from user input
  const cleaned = priorities.map((value) => Math.max(0, Number(value) || 0));
  //Calculates the total priority value
  const total = cleaned.reduce((sum, value) => sum + value, 0);
  //Returns balanced priorities or the assignment weights if all values are zero
  return total > 0 ? cleaned.map((value) => value / total) : [...assignmentWeights];
}

function scalePrioritiesTo100(priorities) {
  const weights = normalizePriorities(priorities);
  const scaled = weights.map((weight) => Math.round(weight * 100));
  const difference = 100 - scaled.reduce((sum, value) => sum + value, 0);
  scaled[scaled.length - 1] += difference;
  return scaled;
}

function calculateResults() {
  //Gets the balanced priority weights
  const weights = normalizePriorities(state.priorities);
  //Calculates the weighted score for each programme
  const scores = state.programmes.map((programme) => {
    return programme.ratings.reduce((sum, rating, index) => sum + rating * weights[index], 0);
  });
  const maxScore = Math.max(...scores);
  //Converts each score into an exponent value
  const expScores = scores.map((score) => Math.exp(score - maxScore));
  //Calculates the total of all exponent values
  const total = expScores.reduce((sum, value) => sum + value, 0);
  //Uses the logit formula to calculate each programme chance
  const chances = expScores.map((value) => value / total);
  //Finds the programme with the highest chance
  const bestIndex = chances.indexOf(Math.max(...chances));

  return { scores, chances, bestIndex };
}

function saveSession() {
  state.results = calculateResults();
  //Stores the current session in local storage
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    selectedProgramme: state.selectedProgramme,
    programmes: state.programmes,
    priorities: state.priorities,
    draftPriorities: state.draftPriorities,
    results: state.results,
    savedAt: new Date().toISOString()
  }));
  elements.saveStatus.textContent = "Saved on this device";
}

function loadSession() {
  //Retrieves saved data and reads it back into the app
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    const saved = JSON.parse(raw);
    state.selectedProgramme = saved.selectedProgramme || 0;
    //Uses saved data or Aiman's data if saved data is missing
    state.programmes = cloneProgrammes(saved.programmes || aimanProgrammes);
    state.priorities = (saved.priorities || (saved.weights || assignmentWeights).map((weight) => Math.round(weight * 100)));
    state.draftPriorities = saved.draftPriorities || [...state.priorities];
    state.results = saved.results || null;
    return true;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return false;
  }
}

function startWithAiman() {
  //Starts the app with Aiman's original input data
  state.selectedProgramme = 0;
  state.programmes = cloneProgrammes(aimanProgrammes);
  state.priorities = assignmentWeights.map((weight) => Math.round(weight * 100));
  state.draftPriorities = [...state.priorities];
  elements.setupOverlay.classList.remove("visible");
  renderAll();
}

function startWithCustom() {
  //Starts the app with neutral custom values
  state.selectedProgramme = 0;
  state.programmes = createCustomProgrammes();
  state.priorities = assignmentWeights.map((weight) => Math.round(weight * 100));
  state.draftPriorities = [...state.priorities];
  elements.setupOverlay.classList.remove("visible");
  renderAll();
}

function showSetup() {
  clearScreenForSetup();
  elements.setupOverlay.classList.add("visible");
}

function startNewSession() {
  localStorage.removeItem(STORAGE_KEY);
  state.selectedProgramme = 0;
  state.programmes = [];
  state.priorities = assignmentWeights.map((weight) => Math.round(weight * 100));
  state.draftPriorities = [...state.priorities];
  state.results = null;
  showSetup();
}

function clearScreenForSetup() {
  elements.bestProgramme.textContent = "-";
  elements.bestChance.textContent = "Choose a starting point to begin.";
  elements.programmeSelect.innerHTML = "";
  elements.programmeName.value = "";
  elements.ratingControls.innerHTML = "";
  elements.weightControls.innerHTML = "";
  elements.weightTotalStatus.textContent = "Total: 0";
  elements.resultRows.innerHTML = "";
  elements.saveStatus.textContent = "No saved session";

  const canvas = elements.probabilityChart;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function renderProgrammeOptions() {
  elements.programmeSelect.innerHTML = "";
  state.programmes.forEach((programme, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = programme.name || `Programme ${index + 1}`;
    elements.programmeSelect.append(option);
  });
  elements.programmeSelect.value = String(state.selectedProgramme);
}

function renderRatingControls() {
  const programme = state.programmes[state.selectedProgramme];
  elements.programmeName.value = programme.name;
  elements.ratingControls.innerHTML = "";

  factorInfo.forEach((factor, index) => {
    const row = document.createElement("label");
    row.className = "control-row";
    row.innerHTML = `
      <span class="control-title">
        <strong>${factor.label}</strong>
        <span>${factor.help}</span>
      </span>
      <input type="range" min="1" max="5" step="1" value="${programme.ratings[index]}" data-rating-index="${index}" aria-label="${factor.label}">
      <span class="value-pill">${programme.ratings[index]}</span>
    `;
    elements.ratingControls.append(row);
  });
}

function renderWeightControls() {
  elements.weightControls.innerHTML = "";
  state.draftPriorities.forEach((priority, index) => {
    const row = document.createElement("label");
    row.className = "control-row";
    row.innerHTML = `
      <span class="control-title">
        <strong>${factorInfo[index].label}</strong>
        <span>Current confirmed weight: ${state.priorities[index]}%</span>
      </span>
      <input type="range" min="0" max="100" step="1" value="${priority}" data-weight-index="${index}" aria-label="${factorInfo[index].label} priority">
      <span class="value-pill">${priority}</span>
    `;
    elements.weightControls.append(row);
  });
  updateWeightDraftDisplays();
}

function renderSummary(results) {
  const bestProgramme = state.programmes[results.bestIndex];
  const chance = results.chances[results.bestIndex] * 100;
  elements.bestProgramme.textContent = bestProgramme.name;
  elements.bestChance.textContent = `${chance.toFixed(2)}% predicted chance based on the current ratings.`;
}

function renderRows(results) {
  elements.resultRows.innerHTML = "";
  state.programmes.forEach((programme, index) => {
    const row = document.createElement("div");
    row.className = `result-row${index === results.bestIndex ? " best" : ""}`;
    row.innerHTML = `
      <strong>${programme.name}</strong>
      <span class="result-number">Score ${results.scores[index].toFixed(2)}</span>
      <span class="result-number">${(results.chances[index] * 100).toFixed(2)}%</span>
    `;
    elements.resultRows.append(row);
  });
}

function renderChart(results) {
  const canvas = elements.probabilityChart;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  const padding = { left: 58, right: 24, top: 34, bottom: 78 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxChance = Math.max(10, Math.ceil(Math.max(...results.chances) * 100 / 10) * 10);
  const colours = ["#1f6feb", "#198754", "#b95c00", "#6f42c1", "#d63384", "#0f7b8a"];

  context.clearRect(0, 0, width, height);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "#d9e0ea";
  context.fillStyle = "#657083";
  context.font = "14px Arial";
  context.textAlign = "right";

  for (let tick = 0; tick <= maxChance; tick += 10) {
    const y = padding.top + chartHeight - (tick / maxChance) * chartHeight;
    context.beginPath();
    context.moveTo(padding.left, y);
    context.lineTo(width - padding.right, y);
    context.stroke();
    context.fillText(`${tick}%`, padding.left - 10, y + 5);
  }

  const slot = chartWidth / state.programmes.length;
  const barWidth = Math.min(70, slot * 0.55);

  state.programmes.forEach((programme, index) => {
    const chance = results.chances[index] * 100;
    const barHeight = (chance / maxChance) * chartHeight;
    const x = padding.left + slot * index + (slot - barWidth) / 2;
    const y = padding.top + chartHeight - barHeight;

    context.fillStyle = colours[index % colours.length];
    context.fillRect(x, y, barWidth, barHeight);

    context.fillStyle = "#18202f";
    context.textAlign = "center";
    context.font = "bold 14px Arial";
    context.fillText(`${chance.toFixed(1)}%`, x + barWidth / 2, y - 8);

    context.font = "13px Arial";
    const words = programme.name.split(" ");
    words.forEach((word, wordIndex) => {
      context.fillText(word, x + barWidth / 2, padding.top + chartHeight + 25 + wordIndex * 16);
    });
  });
}

function renderAll() {
  state.results = calculateResults();
  renderProgrammeOptions();
  renderRatingControls();
  renderWeightControls();
  renderSummary(state.results);
  renderRows(state.results);
  renderChart(state.results);
  saveSession();
}

function renderResultsOnly() {
  state.results = calculateResults();
  renderSummary(state.results);
  renderRows(state.results);
  renderChart(state.results);
  saveSession();
}

function updateRatingDisplay(index, value) {
  const input = elements.ratingControls.querySelector(`input[data-rating-index="${index}"]`);
  if (!input) return;
  input.value = value;
  input.nextElementSibling.textContent = value;
}

function updateWeightDraftDisplays() {
  const total = state.draftPriorities.reduce((sum, value) => sum + value, 0);

  state.draftPriorities.forEach((priority, index) => {
    const input = elements.weightControls.querySelector(`input[data-weight-index="${index}"]`);
    if (!input) return;

    const row = input.closest(".control-row");
    const helper = row.querySelector(".control-title span");
    const valuePill = input.nextElementSibling;

    input.value = priority;
    helper.textContent = `Current confirmed weight: ${state.priorities[index]}%`;
    valuePill.textContent = priority;
  });

  elements.weightTotalStatus.classList.toggle("ready", total === 100);
  elements.weightTotalStatus.classList.toggle("warning", total !== 100);
  elements.weightTotalStatus.textContent = total === 100
    ? "Total: 100. Ready to confirm."
    : `Total: ${total}. It will need scaling before use.`;
}

function confirmWeights() {
  const total = state.draftPriorities.reduce((sum, value) => sum + value, 0);

  if (total === 100) {
    state.priorities = [...state.draftPriorities];
    renderWeightControls();
    elements.weightTotalStatus.textContent = "Total: 100. These weights are now used in the result.";
  } else {
    const shouldScale = window.confirm(
      `Your weight total is ${total}, not 100.\n\nChoose OK to scale them to 100 and calculate, or Cancel to keep editing.`
    );

    if (!shouldScale) {
      elements.weightTotalStatus.textContent = `Total: ${total}. Edit the weights until you are ready.`;
      return;
    }

    state.draftPriorities = scalePrioritiesTo100(state.draftPriorities);
    state.priorities = [...state.draftPriorities];
    renderWeightControls();
    elements.weightTotalStatus.textContent = "Scaled to 100. These weights are now used in the result.";
  }

  renderResultsOnly();
}

elements.programmeSelect.addEventListener("change", (event) => {
  state.selectedProgramme = Number(event.target.value);
  renderAll();
});

elements.programmeName.addEventListener("input", (event) => {
  state.programmes[state.selectedProgramme].name = event.target.value.trim() || `Programme ${state.selectedProgramme + 1}`;
  const selectedOption = elements.programmeSelect.options[state.selectedProgramme];
  if (selectedOption) {
    selectedOption.textContent = state.programmes[state.selectedProgramme].name;
  }
  renderResultsOnly();
});

elements.ratingControls.addEventListener("input", (event) => {
  const input = event.target.closest("input[data-rating-index]");
  if (!input) return;
  const index = Number(input.dataset.ratingIndex);
  state.programmes[state.selectedProgramme].ratings[index] = Number(input.value);
  updateRatingDisplay(index, input.value);
  renderResultsOnly();
});

elements.weightControls.addEventListener("input", (event) => {
  const input = event.target.closest("input[data-weight-index]");
  if (!input) return;
  const index = Number(input.dataset.weightIndex);
  state.draftPriorities[index] = Number(input.value);
  updateWeightDraftDisplays();
  saveSession();
});

elements.resetWeightsButton.addEventListener("click", () => {
  state.priorities = assignmentWeights.map((weight) => Math.round(weight * 100));
  state.draftPriorities = [...state.priorities];
  renderAll();
});

elements.confirmWeightsButton.addEventListener("click", confirmWeights);
elements.useAimanButton.addEventListener("click", startWithAiman);
elements.useCustomButton.addEventListener("click", startWithCustom);
elements.newSessionButton.addEventListener("click", startNewSession);

if (loadSession()) {
  renderAll();
} else {
  showSetup();
}
