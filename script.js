// ---------- 1. Grab the elements ----------
const dateText = document.getElementById("dateText");
const dayTitle = document.getElementById("dayTitle");
const taskCount = document.getElementById("taskCount");
const newBtn = document.getElementById("newBtn");
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const timeInput = document.getElementById("timeInput");
const addBtn = document.getElementById("addBtn");
const weekEl = document.getElementById("week");
const prevWeek = document.getElementById("prevWeek");
const nextWeek = document.getElementById("nextWeek");
const taskList = document.getElementById("taskList");
const emptyMsg = document.getElementById("emptyMsg");

// ---------- 2. Data (saved in the browser) ----------
// Each task looks like: { id, text, time, date: "2026-11-11", done: false }
let tasks = [];
try {
  tasks = JSON.parse(localStorage.getItem("plannerTasks")) || [];
} catch (e) {
  tasks = [];
}

function saveTasks() {
  localStorage.setItem("plannerTasks", JSON.stringify(tasks));
}

// ---------- 3. Date helpers ----------
let selectedDate = new Date();            // the day we are looking at
let weekStart = getMonday(new Date());    // first day shown in the week strip

// Turns a date into "2026-11-11" (we use it to match tasks to days)
function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getMonday(d) {
  const copy = new Date(d);
  const diff = (copy.getDay() + 6) % 7;   // Monday = 0
  copy.setDate(copy.getDate() - diff);
  return copy;
}

// ---------- 4. Draw the screen ----------
function renderHeader() {
  const isToday = dateKey(selectedDate) === dateKey(new Date());
  dateText.textContent = selectedDate.toLocaleDateString("en-ZA", { day: "numeric", month: "long", year: "numeric" });
  dayTitle.textContent = isToday
    ? "Today"
    : selectedDate.toLocaleDateString("en-ZA", { weekday: "long" });
}

function renderWeek() {
  weekEl.innerHTML = "";
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "day";
    if (dateKey(d) === dateKey(selectedDate)) btn.classList.add("selected");
    if (dateKey(d) === dateKey(new Date())) btn.classList.add("today");

    btn.innerHTML = `<small>${d.toLocaleDateString("en-ZA", { weekday: "short" })}</small><strong>${d.getDate()}</strong>`;
    btn.addEventListener("click", () => {
      selectedDate = d;
      render();
    });
    weekEl.appendChild(btn);
  }
}

function renderTasks() {
  taskList.innerHTML = "";

  // only the tasks for the selected day, earliest time first
  const todays = tasks
    .filter(t => t.date === dateKey(selectedDate))
    .sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));

  taskCount.textContent = `${todays.length} ${todays.length === 1 ? "Task" : "Tasks"}`;
  emptyMsg.hidden = todays.length > 0;

  todays.forEach(task => {
    const li = document.createElement("li");
    li.className = "task" + (task.done ? " done" : "");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.checked = task.done;
    check.addEventListener("change", () => {
      task.done = check.checked;
      saveTasks();
      render();
    });

    const info = document.createElement("div");
    info.className = "task-info";
    const text = document.createElement("div");
    text.className = "task-text";
    text.textContent = task.text;          // textContent keeps user input safe
    info.appendChild(text);
    if (task.time) {
      const time = document.createElement("div");
      time.className = "task-time";
      time.textContent = task.time;
      info.appendChild(time);
    }

    const del = document.createElement("button");
    del.className = "delete";
    del.type = "button";
    del.setAttribute("aria-label", "Delete task");
    del.innerHTML = "&times;";
    del.addEventListener("click", () => {
      tasks = tasks.filter(t => t.id !== task.id);
      saveTasks();
      render();
    });

    li.append(check, info, del);
    taskList.appendChild(li);
  });
}

function render() {
  renderHeader();
  renderWeek();
  renderTasks();
}

// ---------- 5. Add a task ----------
function addTask() {
  const text = taskInput.value.trim();
  if (text === "") return;

  tasks.push({
    id: Date.now(),
    text: text,
    time: timeInput.value,
    date: dateKey(selectedDate),
    done: false
  });
  saveTasks();

  taskInput.value = "";
  timeInput.value = "";
  taskForm.hidden = true;
  render();
}

// ---------- 6. Events ----------
newBtn.addEventListener("click", () => {
  taskForm.hidden = !taskForm.hidden;
  if (!taskForm.hidden) taskInput.focus();
});
addBtn.addEventListener("click", addTask);
taskInput.addEventListener("keydown", e => { if (e.key === "Enter") addTask(); });

prevWeek.addEventListener("click", () => { weekStart.setDate(weekStart.getDate() - 7); renderWeek(); });
nextWeek.addEventListener("click", () => { weekStart.setDate(weekStart.getDate() + 7); renderWeek(); });

render();