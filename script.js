
"use strict";

// SPATIA - REC Campus Space Discovery
// Sample data for frontend demonstration only.

const rooms = [
  { room: "A101", block: "A", capacity: 60 },
  { room: "A201", block: "A", capacity: 60 },
  { room: "A402", block: "A", capacity: 60 },

  { room: "B213", block: "B", capacity: 60 },
  { room: "B317", block: "B", capacity: 60 },
  { room: "B401", block: "B", capacity: 60 },
  { room: "B405", block: "B", capacity: 60 },
  { room: "B415", block: "B", capacity: 60 },
  { room: "B419", block: "B", capacity: 60 },

  { room: "C101", block: "C", capacity: 60 },
  { room: "C202", block: "C", capacity: 60 },

  { room: "D101", block: "D", capacity: 60 },
  { room: "D204", block: "D", capacity: 60 },

  { room: "J101", block: "J", capacity: 60 },
  { room: "J202", block: "J", capacity: 60 },

  { room: "ANEW101", block: "ANEW", capacity: 350 },
  { room: "ANEW102", block: "ANEW", capacity: 350 },
  { room: "ANEW103", block: "ANEW", capacity: 350 },
  { room: "ANEW104", block: "ANEW", capacity: 350 },
  { room: "ANEW201", block: "ANEW", capacity: 350 },
  { room: "ANEW202", block: "ANEW", capacity: 350 },
  { room: "ANEW203", block: "ANEW", capacity: 350 },
  { room: "ANEW204", block: "ANEW", capacity: 350 }
];

// Sample timetable provided for the demo.
// Times are minutes after midnight.

const timetable = {
  Tuesday: [
    ["A101", 480, 590],
    ["B401", 720, 745],
    ["B401", 745, 770],
    ["A101", 900, 1010]
  ],

  Wednesday: [
    ["ANEW101", 480, 590],
    ["B419", 720, 745],
    ["B419", 745, 770],
    ["A101", 780, 890],
    ["A201", 900, 1010]
  ],

  Thursday: [
    ["A402", 480, 530],
    ["ANEW101", 600, 710],
    ["B415", 720, 770],
    ["B213", 840, 865],
    ["B213", 865, 890]
  ],

  Friday: [
    ["TLFL104", 480, 580],
    ["B405", 600, 650],
    ["B213", 720, 770],
    ["B213", 780, 830],
    ["B213", 840, 890],
    ["ANEW101", 900, 1010]
  ],

  Saturday: [
    ["A101", 480, 590],
    ["ANEW101", 600, 710],
    ["B317", 720, 770],
    ["B317", 840, 890]
  ]
};

const form = document.getElementById("searchForm");
const dateInput = document.getElementById("searchDate");
const startInput = document.getElementById("startTime");
const endInput = document.getElementById("endTime");
const blockInput = document.getElementById("blockFilter");

const grid = document.getElementById("roomsGrid");
const count = document.getElementById("roomCount");
const title = document.getElementById("resultsTitle");
const subtitle = document.getElementById("resultsSubtitle");

const weekdays = [
  "Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"
];

function minutes(value) {
  if (!value) return NaN;

  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function clock(value) {
  const hour = Math.floor(value / 60);
  const minute = value % 60;
  const suffix = hour >= 12 ? "PM" : "AM";

  return `${hour % 12 || 12}:${String(minute).padStart(2, "0")} ${suffix}`;
}

function selectedDay(value) {
  if (!value) return "";

  const [year, month, day] = value.split("-").map(Number);
  return weekdays[new Date(year, month - 1, day).getDay()];
}

function roomStatus(room, day, start, end) {
  const schedule = timetable[day];

  if (!schedule) return "unknown";

  const slots = schedule.filter(item => item[0] === room.room);

  if (slots.length === 0) return "unknown";

  const overlaps = slots.some(item =>
    start < item[2] && end > item[1]
  );

  return overlaps ? "busy" : "free";
}

function showEmpty(message) {
  grid.replaceChildren();

  const empty = document.createElement("div");
  empty.className = "empty-state";

  const icon = document.createElement("span");
  icon.textContent = "⌕";

  const heading = document.createElement("h3");
  heading.textContent = "No rooms found";

  const description = document.createElement("p");
  description.textContent = message;

  empty.append(icon, heading, description);
  grid.appendChild(empty);

  count.textContent = "0 rooms";
}

function showRooms(list, day, start, end) {
  grid.replaceChildren();

  if (list.length === 0) {
    showEmpty("Try selecting All blocks.");
    return;
  }

  const labels = {
    free: "No conflict",
    busy: "Occupied",
    unknown: "Schedule unknown"
  };

  const descriptions = {
    free: "No overlapping class appears in the sample timetable. Confirm before using this room.",
    busy: "A class is listed during this time in the sample timetable.",
    unknown: "Timetable details are unavailable. Actual availability is unconfirmed."
  };

  list.forEach((room, index) => {
    const status = roomStatus(room, day, start, end);

    const card = document.createElement("article");
    card.className = "room-card";
    card.style.animationDelay = `${index * 25}ms`;

    const top = document.createElement("div");
    top.className = "room-card-top";

    const icon = document.createElement("span");
    icon.className = "room-icon";
    icon.textContent = "⌂";

    const badge = document.createElement("span");
    badge.className = `status-pill ${status}`;
    badge.textContent = labels[status];

    top.append(icon, badge);

    const roomName = document.createElement("h3");
    roomName.className = "room-code";
    roomName.textContent = room.room;

    const blockName = document.createElement("p");
    blockName.className = "room-block";
    blockName.textContent = `${room.block} Block · Demo classroom`;

    const divider = document.createElement("div");
    divider.className = "room-divider";

    const capacity = document.createElement("div");
    capacity.className = "room-meta";

    const capacityLabel = document.createElement("span");
    capacityLabel.textContent = "Sample capacity";

    const capacityValue = document.createElement("strong");
    capacityValue.textContent = `${room.capacity} seats*`;

    capacity.append(capacityLabel, capacityValue);

    const timing = document.createElement("div");
    timing.className = "room-meta";
    timing.style.marginTop = "10px";

    const timeLabel = document.createElement("span");
    timeLabel.textContent = "Selected time";

    const timeValue = document.createElement("strong");
    timeValue.textContent = `${clock(start)} – ${clock(end)}`;

    timing.append(timeLabel, timeValue);

    const note = document.createElement("p");
    note.className = "room-note";
    note.textContent = descriptions[status];

    card.append(top, roomName, blockName, divider, capacity, timing, note);
    grid.appendChild(card);
  });

  count.textContent = `${list.length} room${list.length === 1 ? "" : "s"}`;
}

function searchRooms() {
  const date = dateInput.value;
  const start = minutes(startInput.value);
  const end = minutes(endInput.value);
  const block = blockInput.value;

  if (!date) {
    alert("Please select a date.");
    dateInput.focus();
    return;
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) {
    alert("Please select a valid start and end time.");
    return;
  }

  if (start < 480 || end > 1020) {
    alert("Choose a time between 8:00 AM and 5:00 PM.");
    return;
  }

  const day = selectedDay(date);

  const filteredRooms = rooms.filter(room =>
    block === "Any" || room.block === block
  );

  title.textContent = `Rooms for ${day}`;
  subtitle.textContent =
    `${date} · ${clock(start)} – ${clock(end)} · ${block === "Any" ? "All blocks" : block + " Block"}`;

  showRooms(filteredRooms, day, start, end);

  document.getElementById("results").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function setInitialDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  dateInput.value = `${year}-${month}-${day}`;
}

form.addEventListener("submit", function(event) {
  event.preventDefault();
  searchRooms();
});

setInitialDate();
searchRooms();