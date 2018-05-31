var map;

function createAddressSelectList(data) {
  var $asc = $(ADDR_SELECT_CONTAINER);
  var $ul = $('<ul>');
  data.forEach(result => {
    var formattedAddress = result.formatted_address;
    // console.log(formattedAddress);
    var $li = $('<li>');
    var $a = $('<a>');
    $a.text(formattedAddress);
    $a.attr('href', '#');
    $li.on('click', event => {
      event.preventDefault();
      $asc.text('');
      $(ADDRESS_INPUT).attr('value', formattedAddress);
      getCoordinates(formattedAddress)
    });
    $a.appendTo($li);
    $li.appendTo($ul);
  });
  $ul.appendTo($asc);
}

function getCoordinatesAndDoStuff(address, stuffToDo) {
  $.get(GEO_BASE_URL, {
        address: address,
        key: GEO_API_KEY})
  .then(data => {
    if (data.results[1]) {
      createAddressSelectList(data.results);
    };
    var location = data.results[0].geometry.location
    stuffToDo(location.lat, location.lng);
    })
  .catch(error => {
    console.log(error);
  });
}

function initMap(latValue=33.7676338,lngValue=-84.5606888) {
  var mapDiv = document.querySelector(MAP_CONTAINER);
  map = new google.maps.Map(mapDiv, {
    center: {lat: latValue, lng: lngValue},
    zoom: 8
  });
  // var marker = new google.maps.Marker({position: {lat: latValue, lng: lngValue},
  //   map: map});
}

function setMapMarker(latValue, lngValue) {
  var marker = new google.maps.Marker(
    {
      position: {
        lat: latValue,
        lng: lngValue
      },
      map: map
    });
}

function updateOffenderResults(restaurantArray) {
  var $table = $(OFFENDER_TABLE);
  $table.empty();
  var $tr1 = $('<tr>');
  var $th1 = $('<th>').addClass('col-md-3').text('Restaurant').appendTo($tr1);
  var $th2 = $('<th>').addClass('text-center').text('Address').appendTo($tr1);
  var $th3 = $('<th>').addClass('text-center').text('Score').appendTo($tr1);
  $tr1.appendTo($table);

  restaurantArray.forEach(restaurant => {
    var $tr = $('<tr>');
    var $td1 = $('<td>');
    var $a = $('<a>').text(restaurant.name).attr('href', '#').appendTo($td1);
    $td1.appendTo($tr);
    var $td2 = $('<td>').text(restaurant.address).appendTo($tr);
    var $td3 = $('<td>').text(restaurant.score).appendTo($tr);
    $tr.appendTo($table);

    getCoordinatesAndDoStuff(restaurant.address, setMapMarker);
  });
}

function getOffenders(zipCode, minScore) {
  var results = [];
  counties.forEach(restaurant => {
    if (parseInt(restaurant.score) <= minScore && getZipCode(restaurant.address) === zipCode) {
      results.push(restaurant);
    }
  });
  return results;
}

function getZipCode(addressString) {
  try {
    var regex = /\d{5}$/;
    var result = regex.exec(addressString)[0]
    return result;
  }
  catch(error) {
    // console.error(error);
    console.error('Zip code not found');
    return null;
  }
}

function submitRequest(event) {
  event.preventDefault();
  var zipCode = document.querySelector(ADDRESS_INPUT).value;
  var minScore = document.querySelector(MIN_SCORE).value;
  if (zipCode) {
    getCoordinatesAndDoStuff(zipCode, initMap);
    var results = getOffenders(zipCode, minScore);
    updateOffenderResults(results);
  }
}

function main() {
  document.querySelector(SUBMIT).addEventListener('click', submitRequest);
}

main();