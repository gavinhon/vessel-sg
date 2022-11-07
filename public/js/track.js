let trackedPath = [];
let trackedShip = [];
let iteration = 0;

$('#startTrackBtn').click(function () {

  if ($('#trackIMO').val()) {
    $('.loader').addClass('active'); 
    console.log('started tracking...');
    $('#trackIMO').attr('disabled', 'disabled');
    $('#startTrackBtn').attr('disabled', 'disabled');
    newPoint = setInterval(function () {
      iteration++;
      console.log('recorded');
      if (iteration > 2 && trackedPath.length == 0){
        $("#stopTrackBtn").trigger("click");
        $('#startTrackBtn').removeAttr('disabled');
        alert(`Unable to track ship with IMO: ${$('#trackIMO').val()}. Please try with a different IMO.`);
        console.log(trackedPath);
      } else {
        trackShip(); 
      }

    }, 180000);
  } else {
    alert('Valid IMO required. Please try again.');
  }
});

$('#stopTrackBtn').click(function () {
  console.log('stopped');
  clearInterval(newPoint);
  $('#trackIMO').removeAttr('disabled');
  $('#startTrackBtn').removeAttr('disabled');
  $('.loader').removeClass('active'); 
  iteration = 0;
  trackedPath = [];
});

const returnWithinIMO = (ship) => {
  return ship.vesselParticulars.imoNumber == $('#trackIMO').val();
};
var polyline = L.polyline(trackedPath, { color: 'red' });
const trackShip = () => {
  $.ajax({
    url: 'shipLoc',
    type: 'GET',
    async: true,
    headers: {
      Accept: 'application/json',
    },
    success: function (result) {
      //console.log(result);
      map.removeLayer(shipMarkers);
      map.removeLayer(polyline);
      shipMarkers = [];

      trackedShip = result.filter(returnWithinDistance);
      trackedShip = result.filter(returnWithinIMO);
      console.log(trackedShip);
      trackedShip.map((element) => {
        let shipMarker = L.marker([
          element.latitudeDegrees,
          element.longitudeDegrees,
        ]).bindPopup(`${element.vesselParticulars.vesselName}`);
        shipMarkers = [...shipMarkers, shipMarker];
        trackedPath.push([element.latitudeDegrees, element.longitudeDegrees]);
      });

      shipMarkers = L.layerGroup(shipMarkers);
      shipMarkers.addTo(map);
      polyline = L.polyline(trackedPath, { color: 'red' });
      polyline.addTo(map);
    },
    error: function (error) {
      console.log(error);
    },
  });
};
