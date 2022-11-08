var map = L.map('map', { zoomControl: false }).setView([1.269358954908872, 103.79544516927918], 15);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  minZoom: 5,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

let filteredArray = [];

const returnWithinDistance = (ship) => {
  let centerOfMap = map.getCenter();
  let to = turf.point([ship.latitudeDegrees, ship.longitudeDegrees]);
  let from = turf.point([centerOfMap.lat, centerOfMap.lng]);
  let options = { units: 'kilometers' };
  if (turf.distance(from, to, options) > 0) {
    return ship;
  }
};

const returnWithinFilter = (ship) => {
  if ($('#countryList').val() == 'ALL') {
    return ship.vesselParticulars.flag;
  } else {
    return ship.vesselParticulars.flag == $('#countryList').val();
  }
};

const getCountryList = (array) => {
  array.map((element) => {
    countries.indexOf(element.vesselParticulars.flag) === -1
      ? countries.push(element.vesselParticulars.flag)
      : null;
  });
  if (countries.indexOf('ALL') === -1) {
    countries.push('ALL');
  }
};

var shipMarkers = [];
var countries = [];
var countriesLength;
var prevCountriesLength = 0;

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

const test = () => {
  $.ajax({
    url: 'shipLoc',
    type: 'GET',
    async: true,
    headers: {
      Accept: 'application/json',
    },
    success: function (result) {
      console.log(result);
      map.removeLayer(shipMarkers);
      shipMarkers = [];
      getCountryList(result);

      filteredArray = result.filter(returnWithinDistance);
      filteredArray = result.filter(returnWithinFilter);
      filteredArray.map((element) => {
        let shipMarker = L.marker([
          element.latitudeDegrees,
          element.longitudeDegrees,
        ]).bindPopup(`<b>Vessel Name: "${element.vesselParticulars.vesselName}"</b><p>IMO: ${element.vesselParticulars.imoNumber}</p>`);
        shipMarkers = [...shipMarkers, shipMarker];
      });

      shipMarkers = L.layerGroup(shipMarkers);
      shipMarkers.addTo(map);
      info.update(filteredArray.length);
      countriesLength = countries.length;
      if (prevCountriesLength != countriesLength) {
        map.removeLayer(shipMarkers);
        updateDropdown();
        prevCountriesLength = countriesLength;
      }
    },
    error: function (error) {
      console.log(error);
    },
  });
};

$('#submitBtn').on('click', test);

var info = L.control();

info.onAdd = function (map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function (props) {
  this._div.innerHTML =
    '<h4>Ship Count</h4>' +
    (props
      ? '<b>' + $('#countryList').val() + ': ' + '</b>' + props
      : 'No results found.');
};

info.addTo(map);

const updateDropdown = () => {
  countries.sort((a, b) => {
    return collator.compare(a, b);
  });

  var $el = $('#countryList');
  $el.empty(); // remove old options
  countries.map((country) => {
    $el.append($('<option></option>').attr('value', country).text(country));
  });
};

test();

$('.sidebar-toggle').click(function () {
  $('.sidebar').toggleClass('active');
});
