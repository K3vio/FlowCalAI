const START_HOUR = 0;
const END_HOUR = 24;
const HOUR_HEIGHT = 60;

const calendarHeader = document.getElementById("calendarHeader");
const timeLabels = document.getElementById("timeLabels");
const dayColumns = document.getElementById("dayColumns");

const previousWeekBtn = document.getElementById("previousWeekBtn");
const todayBtn = document.getElementById(todayBtn);
const nextWeekBtn = document.getElementById("nextWeekBtn");

const addScheduleBtn = document.getElementById("addScheduleBtn");
const cancelBtn = document.getElementById("cancelBtn");
const scheduleForm = document.getElementById("scheduleForm");

const titleInput = document.getElementById("titleInput");
const dateInput = document.getElementById("dateInput");
const startInput = document.getElementById("startInput");
const endInput = document.getElementById("endInput");
const typeInput = document.getElementById("typeInput");

let currentWeekStart = getStartOfWeek(new Date());

let schedules = [
    {
        title: "test",
        date: formatDate(new Date()),
        start: "10:00",
        end: "12:00",
        type: "fixed",
    },
];

function getStartOfWeek(date) {
    const result = new Date(date);
    const day = result.getDay();

    let difference;
    if (day === 0) {
        difference = -6;
    } else {
        difference = 1 - day;
    }

    result.setDate(result.getDate() + difference);
    result.setHours(0, 0, 0, 0);

    return result;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function formatDisplayDate(date) {
    return date.toLocaleDateString("en-AU", {
        weekday: "short",
        day: "numeric",
        month: "short",
    });
}
