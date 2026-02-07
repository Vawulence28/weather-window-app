const API_BASE = "http://localhost:5000/api/weather";

async function fetchCurrentWeather(city, unit) {
  const res = await fetch(
    `${API_BASE}?city=${city}&unit=${unit}`
  );
  if (!res.ok) throw new Error("City not found");
  return res.json();
}

async function fetchForecast(city, unit) {
  const res = await fetch(
    `${API_BASE}/forecast?city=${city}&unit=${unit}`
  );
  if (!res.ok) throw new Error("Forecast unavailable");
  return res.json();
}
