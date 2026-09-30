// PROPVALUATE ML - REAL ESTATE PREDICTION ENGINE
// Binary Froster Enterprise PropTech Pipeline
// Connected to Live Serverless Backend (/api/predict, /api/comps, /api/analytics)

(function () {
  'use strict';

  // Base values per borough (Price per sq ft baseline in GBP)
  const boroughBaselines = {
    kensington: 1350,
    westminster: 980,
    camden: 820,
    islington: 780,
    hackney: 650,
    greenwich: 540,
    richmond: 720
  };

  const typeMultipliers = {
    flat: 0.95,
    terraced: 1.0,
    semi: 1.08,
    detached: 1.25
  };

  const eraMultipliers = {
    victorian: 1.05,
    edwardian: 1.02,
    postwar: 0.92,
    contemporary: 1.10
  };

  // State
  let state = {
    borough: 'westminster',
    type: 'terraced',
    era: 'victorian',
    sqft: 1450,
    beds: 3,
    baths: 2,
    hasGarden: true,
    hasParking: true,
    nearStation: true
  };

  // DOM Elements
  const boroughSelect = document.getElementById('boroughSelect');
  const typeSelect = document.getElementById('typeSelect');
  const eraSelect = document.getElementById('eraSelect');
  const sqftSlider = document.getElementById('sqftSlider');
  const sqftLabel = document.getElementById('sqftLabel');
  const bedCount = document.getElementById('bedCount');
  const bedMinus = document.getElementById('bedMinus');
  const bedPlus = document.getElementById('bedPlus');
  const bathCount = document.getElementById('bathCount');
  const bathMinus = document.getElementById('bathMinus');
  const bathPlus = document.getElementById('bathPlus');
  const gardenCheck = document.getElementById('gardenCheck');
  const parkingCheck = document.getElementById('parkingCheck');
  const stationCheck = document.getElementById('stationCheck');

  const estimatedPriceEl = document.getElementById('estimatedPrice');
  const lowerBoundEl = document.getElementById('lowerBound');
  const upperBoundEl = document.getElementById('upperBound');
  const monthlyRentEl = document.getElementById('monthlyRent');

  let debounceTimer = null;

  async function syncBackendPrediction() {
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          borough: state.borough.charAt(0).toUpperCase() + state.borough.slice(1),
          propertyType: state.type,
          period: state.era,
          sqft: state.sqft,
          bedrooms: state.beds,
          bathrooms: state.baths,
          hasGarden: state.hasGarden
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.valuation) {
          estimatedPriceEl.textContent = data.valuation.formatted;
          lowerBoundEl.textContent = '£' + data.valuation.confidenceInterval.lowGbp.toLocaleString();
          upperBoundEl.textContent = '£' + data.valuation.confidenceInterval.highGbp.toLocaleString();
          monthlyRentEl.textContent = `${data.valuation.rentalEstimate.formattedMonthlyRent}`;
        }
      }
    } catch (e) {
      console.warn('Backend prediction sync fallback:', e.message);
    }
  }

  function calculateValuation() {
    const basePpsf = boroughBaselines[state.borough] || 800;
    const typeMult = typeMultipliers[state.type] || 1.0;
    const eraMult = eraMultipliers[state.era] || 1.0;

    // Base area value
    let val = state.sqft * basePpsf * typeMult * eraMult;

    // Bedroom / Bathroom adjustment
    val += (state.beds - 2) * 45000;
    val += (state.baths - 1) * 25000;

    // Amenity adjustments
    if (state.hasGarden) val += 45000;
    if (state.hasParking) val += 50000;
    if (state.nearStation) val += 35000;

    // Round to nearest 5,000
    val = Math.round(val / 5000) * 5000;

    const lowerBound = Math.round((val * 0.95) / 5000) * 5000;
    const upperBound = Math.round((val * 1.05) / 5000) * 5000;
    const monthlyRent = Math.round((val * 0.044) / 12 / 50) * 50;

    // Update DOM immediately
    estimatedPriceEl.textContent = `£${val.toLocaleString()}`;
    lowerBoundEl.textContent = `£${lowerBound.toLocaleString()}`;
    upperBoundEl.textContent = `£${upperBound.toLocaleString()}`;
    monthlyRentEl.textContent = `£${monthlyRent.toLocaleString()} / mo`;

    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(syncBackendPrediction, 250);
  }

  function bindEvents() {
    boroughSelect.addEventListener('change', (e) => {
      state.borough = e.target.value;
      calculateValuation();
    });

    typeSelect.addEventListener('change', (e) => {
      state.type = e.target.value;
      calculateValuation();
    });

    eraSelect.addEventListener('change', (e) => {
      state.era = e.target.value;
      calculateValuation();
    });

    sqftSlider.addEventListener('input', (e) => {
      state.sqft = parseInt(e.target.value, 10);
      const sqm = (state.sqft * 0.092903).toFixed(1);
      sqftLabel.textContent = `${state.sqft.toLocaleString()} sq ft (${sqm} m²)`;
      calculateValuation();
    });

    bedMinus.addEventListener('click', () => {
      if (state.beds > 1) {
        state.beds--;
        bedCount.textContent = state.beds;
        calculateValuation();
      }
    });

    bedPlus.addEventListener('click', () => {
      if (state.beds < 6) {
        state.beds++;
        bedCount.textContent = state.beds;
        calculateValuation();
      }
    });

    bathMinus.addEventListener('click', () => {
      if (state.baths > 1) {
        state.baths--;
        bathCount.textContent = state.baths;
        calculateValuation();
      }
    });

    bathPlus.addEventListener('click', () => {
      if (state.baths < 4) {
        state.baths++;
        bathCount.textContent = state.baths;
        calculateValuation();
      }
    });

    gardenCheck.addEventListener('change', (e) => {
      state.hasGarden = e.target.checked;
      calculateValuation();
    });

    parkingCheck.addEventListener('change', (e) => {
      state.hasParking = e.target.checked;
      calculateValuation();
    });

    stationCheck.addEventListener('change', (e) => {
      state.nearStation = e.target.checked;
      calculateValuation();
    });
  }

  bindEvents();
  calculateValuation();
})();
