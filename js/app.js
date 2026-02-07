let currentUnit = "metric";

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const currentWeatherEl = document.getElementById("currentWeather");
const forecastEl = document.getElementById("forecast");
const errorEl = document.getElementById("error");
const loadingEl = document.getElementById("loading");

/* --------------------
   Event Listeners
-------------------- */

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const city = cityInput.value.trim();

  // 🚫 Prevent empty search
  if (!city) {
    showError("Please enter a city name.");
    return;
  }

  loadWeather(city);
});

document.querySelectorAll(".unit-toggle button").forEach((btn) => {
  btn.addEventListener("click", () => {
    currentUnit = btn.dataset.unit;

    if (cityInput.value.trim()) {
      loadWeather(cityInput.value.trim());
    }
  });
});

/* --------------------
   Core Logic
-------------------- */

async function loadWeather(city) {
  try {
    clearError();
    showLoading();

    const [current, forecast] = await Promise.all([
      fetchCurrentWeather(city, currentUnit),
      fetchForecast(city, currentUnit)
    ]);

    renderCurrent(current);
    renderForecast(forecast.list);
  } catch (err) {
    showError(err.message || "Unable to fetch weather data.");
  } finally {
    hideLoading();
  }
}

/* --------------------
   Render Functions
-------------------- */

function renderCurrent(data) {
  currentWeatherEl.innerHTML = `
    <h2>${data.name}</h2>
    <p class="temp">${Math.round(data.main.temp)}°</p>
    <p class="condition">${data.weather[0].description}</p>
    <p class="meta">💧 ${data.main.humidity}% | 💨 ${data.wind.speed}</p>
  `;

  currentWeatherEl.classList.remove("hidden");
}

function renderForecast(list) {
  forecastEl.innerHTML = "";

  const dailyMap = {};

  list.forEach((item) => {
    const date = item.dt_txt.split(" ")[0];

    if (!dailyMap[date]) {
      dailyMap[date] = {
        temps: [],
        icon: item.weather[0].icon
      };
    }

    dailyMap[date].temps.push(item.main.temp);
  });

  Object.keys(dailyMap)
    .slice(0, 5)
    .forEach((date) => {
      const temps = dailyMap[date].temps;
      const min = Math.min(...temps);
      const max = Math.max(...temps);

      forecastEl.innerHTML += `
        <div class="card">
          <p>${formatDate(date)}</p>
          <img 
            src="https://openweathermap.org/img/wn/${dailyMap[date].icon}.png" 
            alt="weather icon"
          />
          <p>${Math.round(min)}° / ${Math.round(max)}°</p>
        </div>
      `;
    });
}

/* --------------------
   UI Helpers
-------------------- */

function showLoading() {
  loadingEl.classList.remove("hidden");
  currentWeatherEl.classList.add("hidden");
  forecastEl.innerHTML = "";
}

function hideLoading() {
  loadingEl.classList.add("hidden");
}

function showError(message) {
  errorEl.textContent = message;
}

function clearError() {
  errorEl.textContent = "";
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then(() => console.log("Service Worker registered"))
      .catch((err) => console.error("SW registration failed", err));
  });
}

let deferredPrompt;
const installBtn = document.getElementById("installBtn");

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  installBtn.classList.remove("hidden");
});

installBtn.addEventListener("click", async () => {
  if (!deferredPrompt) return;

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;

  if (outcome === "accepted") {
    console.log("App installed");
  }

  deferredPrompt = null;
  installBtn.classList.add("hidden");
});
