(() => {
  "use strict";
  const KAABA = { lat: 21.422487, lon: 39.826206 };
  const $ = (id) => document.getElementById(id);
  const needle = $("qiblaNeedle");
  let selected = null;
  let deviceHeading = null;
  let orientationListening = false;

  $("year").textContent = new Date().getFullYear();
  const menuToggle = $("menuToggle");
  const nav = $("mainNav");
  menuToggle.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    nav.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
  }));

  function setStatus(message, type = "") {
    $("statusMessage").textContent = message;
    $("statusMessage").className = "status-message" + (type ? " " + type : "");
  }
  function normalize(deg) { return (deg % 360 + 360) % 360; }
  function bearingBetween(lat1, lon1, lat2, lon2) {
    const toRad = d => d * Math.PI / 180;
    const φ1 = toRad(lat1), φ2 = toRad(lat2), Δλ = toRad(lon2 - lon1);
    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    return normalize(Math.atan2(y, x) * 180 / Math.PI);
  }
  function compassPoint(deg) {
    const names = ["North", "North-northeast", "Northeast", "East-northeast", "East", "East-southeast", "Southeast", "South-southeast", "South", "South-southwest", "Southwest", "West-southwest", "West", "West-northwest", "Northwest", "North-northwest"];
    return names[Math.round(normalize(deg) / 22.5) % 16];
  }
  function updateLocation(lat, lon, label) {
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      setStatus("That location did not return valid coordinates.", "error"); return;
    }
    selected = {lat, lon, label};
    const bearing = bearingBetween(lat, lon, KAABA.lat, KAABA.lon);
    $("bearingValue").textContent = `${Math.round(bearing)}°`;
    $("bearingLabel").textContent = compassPoint(bearing);
    $("locationName").textContent = label || "Selected coordinates";
    $("coordinates").textContent = `${lat.toFixed(5)}°, ${lon.toFixed(5)}°`;
    $("compassStatus").textContent = "Bearing calculated";
    $("qiblaNeedle").style.transform = `rotate(${bearing}deg)`;
    if (deviceHeading !== null) rotateForDevice(bearing);
    setStatus(`Qibla bearing calculated: ${bearing.toFixed(1)}° from true north. ${label ? "Location: " + label + "." : ""}`);
  }
  function rotateForDevice(bearing) {
    // CSS needle points north at 0°. Subtract the phone's heading so the needle can represent
    // Qibla relative to the top edge of the device. Sensor conventions vary by browser.
    needle.style.transform = `rotate(${normalize(bearing - deviceHeading)}deg)`;
    $("compassStatus").textContent = "Compass active";
  }
  function getPosition() {
    if (!("geolocation" in navigator)) {
      setStatus("This browser does not support location. Search for a city instead.", "error"); return;
    }
    if (!window.isSecureContext && location.hostname !== "localhost") {
      setStatus("Location access requires HTTPS. Upload the site to an HTTPS host or use localhost for testing.", "error"); return;
    }
    setStatus("Requesting your location…");
    $("useLocation").disabled = true;
    navigator.geolocation.getCurrentPosition(pos => {
      $("useLocation").disabled = false;
      updateLocation(pos.coords.latitude, pos.coords.longitude, "Current location");
    }, err => {
      $("useLocation").disabled = false;
      const messages = {1:"Location permission was denied. Allow it in browser settings or search manually.",2:"Your location could not be determined. Try again or search manually.",3:"Location request timed out. Please try again."};
      setStatus(messages[err.code] || "Unable to get your location. Please search manually.", "error");
    }, {enableHighAccuracy:true, timeout:15000, maximumAge:60000});
  }
  $("useLocation").addEventListener("click", getPosition);

  $("searchForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const query = $("cityInput").value.trim();
    if (!query) return;
    const btn = $("searchButton");
    btn.disabled = true; btn.textContent = "Searching…";
    setStatus("Searching for the location…");
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`;
      const response = await fetch(url, {headers: {"Accept":"application/json"}});
      if (!response.ok) throw new Error("Search service returned an error.");
      const results = await response.json();
      if (!results.length) { setStatus("No matching location found. Try a nearby city or add the country name.", "error"); return; }
      const place = results[0];
      updateLocation(Number(place.lat), Number(place.lon), place.display_name.split(",").slice(0,3).join(","));
    } catch (error) {
      setStatus("Could not search right now. Check your internet connection or try GPS.", "error");
    } finally {
      btn.disabled = false; btn.textContent = "Search";
    }
  });

  function handleOrientation(event) {
    let heading = null;
    if (typeof event.webkitCompassHeading === "number") {
      heading = event.webkitCompassHeading; // iOS: degrees clockwise from magnetic north
    } else if (typeof event.alpha === "number") {
      heading = 360 - event.alpha; // common DeviceOrientation convention; browser support varies
      if (screen.orientation && typeof screen.orientation.angle === "number") heading += screen.orientation.angle;
    }
    if (heading !== null && Number.isFinite(heading)) {
      deviceHeading = normalize(heading);
      if (selected) rotateForDevice(bearingBetween(selected.lat, selected.lon, KAABA.lat, KAABA.lon));
      $("compassNote").textContent = "Compass sensor is reporting a heading. Keep the phone flat and away from magnets; readings vary by device and browser.";
    }
  }
  async function enableCompass() {
    if (!("DeviceOrientationEvent" in window)) {
      setStatus("This device or browser does not provide a compass sensor. The numeric Qibla bearing still works.", "error"); return;
    }
    try {
      if (typeof DeviceOrientationEvent.requestPermission === "function") {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission !== "granted") { setStatus("Compass permission was not granted. You can still use the numeric bearing.", "error"); return; }
      }
      if (!orientationListening) {
        window.addEventListener("deviceorientationabsolute", handleOrientation, true);
        window.addEventListener("deviceorientation", handleOrientation, true);
        orientationListening = true;
      }
      setStatus("Compass enabled if your device provides orientation data. Move the phone gently and keep it level.");
      $("compassStatus").textContent = "Waiting for sensor";
    } catch (error) {
      setStatus("Could not enable the compass. Check HTTPS and your browser's sensor permissions.", "error");
    }
  }
  $("enableCompass").addEventListener("click", enableCompass);
})();