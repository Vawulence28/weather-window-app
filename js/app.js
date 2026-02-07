let currentUnit = "metric";

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const currentWeatherEl = document.getElementById("currentWeather");
const forecastEl = document.getElementById("forecast");
const errorEl = document.getElementById("error");

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  loadWeather(cityInput.value);
});

document.querySelectorAll(".unit-toggle button").forEach(btn => {
  btn.addEventListener("click", () => {
    currentUnit = btn.dataset.unit;
    if (cityInput.value) loadWeather(cityInput.value);
  });
});

async function loadWeather(city) {
  try {
    errorEl.textContent = "";
    currentWeatherEl.classList.add("hidden");

    const current = await fetchCurrentWeather(city, currentUnit);
    const forecast = await fetchForecast(city, currentUnit);

    renderCurrent(current);
    renderForecast(forecast.list);
  } catch (err) {
    errorEl.textContent = err.message;
  }
}

function renderCurrent(data) {
  currentWeatherEl.innerHTML = `
    <h2>${data.name}</h2>
    <p>${Math.round(data.main.temp)}°</p>
    <p>${data.weather[0].description}</p>
    <p>💧 ${data.main.humidity}% | 💨 ${data.wind.speed}</p>
  `;
  currentWeatherEl.classList.remove("hidden");
}

function renderForecast(list) {
  forecastEl.innerHTML = "";

  const dailyMap = {};

  list.forEach(item => {
    const date = item.dt_txt.split(" ")[0];

    if (!dailyMap[date]) {
      dailyMap[date] = {
        temps: [],
        icon: item.weather[0].icon,
        date: item.dt_txt
      };
    }

    dailyMap[date].temps.push(item.main.temp);
  });

  Object.keys(dailyMap).slice(0, 5).forEach(date => {
    const day = dailyMap[date];
    const min = Math.min(...day.temps);
    const max = Math.max(...day.temps);

    forecastEl.innerHTML += `
      <div class="card">
        <p>${formatDate(date)}</p>
        <img src="https://openweathermap.org/img/wn/${day.icon}.png" />
        <p>${Math.round(min)}° / ${Math.round(max)}°</p>
      </div>
    `;
  });
}

