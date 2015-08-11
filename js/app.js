(function () {
    var mapquest_url = 'http://tile.stamen.com/watercolor/{z}/{x}/{y}.png',
        mapquest1 = new L.TileLayer(mapquest_url, {maxZoom: 16, subdomains: '1234'}),
      //  mapquest2 = new L.TileLayer(mapquest_url, {maxZoom: 16, subdomains: '1234'}),
        map1 = new L.Map('map1', {layers: [mapquest1], center: new L.LatLng(9.935472, -84.087836), zoom: 12}),
       // map2 = new L.Map('map2', {layers: [mapquest2], center: new L.LatLng(9.935472, -84.087836), zoom: 12}),
        originalGeoJSON = null,
        /*
        startIcon = new L.Icon({
            iconUrl: 'img/markers/start.png',
            iconAnchor: [0, 28]
        }),
        endIcon = new L.Icon({
            iconUrl: 'img/markers/end.png',
            iconAnchor: [28, 28]
        }),
        */
        displayedEvents = new L.GeoJSON(null, {
            style: {
                color: '#003300',
                opacity: 0.6,
                width: 2
            },
            onEachFeature: function (feature, layer) {
                var popupContent = '<table class="table table-striped"><tbody>';
                for (property in feature.properties) {
                  // make editable, using [ '</strong></td><td contenteditable="true">' ] enables change but does not save >> save button?
                    popupContent += '<tr><td><strong>'+ property + '</strong></td><td>'+ feature.properties[property] + '</td></tr>';
                }
                popupContent += '</tbody></table>';
                layer.bindPopup(popupContent);
            }
        });

    map1.addLayer(displayedEvents);

//    var startEndMarkers = new L.LayerGroup();
//    map1.addLayer(startEndMarkers);

    var drawnItems = new L.FeatureGroup();
    map1.addLayer(drawnItems);

    $.getJSON('eventos.geojson', function (data){
        originalGeoJSON = data;
      displayedEvents.addData(data);
        //timeToFilter();
    });

    var drawControl = new L.Control.Draw({
        draw: {
            position: 'topleft',
            marker: {
                title: 'Nuevo evento',
                shapeOptions: {
                    color: '#46461f',
                    opacity: 0.8,
                    weight: 7
                }
            },
            polygon: false,
            circle: false,
            rectangle: false,
            polyline: false
        },
        edit: {
            featureGroup: drawnItems
        }
    });
    map1.addControl(drawControl);

    map1.on('draw:drawstart', function (e) {

        drawnItems.clearLayers();
        document.getElementById('geojson-output').value = '';
    });

    map1.on('draw:created', function (e) {

      drawnItems.addLayer(e.layer, {
            style: {
                color: '#003300',
                opacity: 0.6,
                width: 2
            },
            onEachFeature: function (feature, layer) {
                var popupContent = '<table class="table table-striped"><tbody>';
                for (property in feature.properties) {
                    popupContent += '<tr><td><strong>' + property + '</strong></td><td>' + feature.properties[property] + '</td></tr>';
                }
                popupContent += '</tbody></table>';
                layer.bindPopup(popupContent);
            }

      });

      // update this to be a table of properties
        document.getElementById('geojson-output').value = JSON.stringify(drawnItems.toGeoJSON().features[0].geometry);
      /*
      var popupContent = '<table class="table table-striped"><tbody>';
      for (property in feature.properties) {
        popupContent += '<tr><td><strong>' + property + '</strong></td><td>' + feature.properties[property] + '</td></tr>';
      }
      popupContent += '</tbody></table>';
      layer.bindPopup(popupContent);
      */
    });


  $("#submit-event").click(function() {
    var eventName = $("#event-name").val();
    var eventDate = $("#event-time").val();
    var eventDesc = $("#event-desc").val();
    var eventLink = $("#event-link").val();
    if (eventName == "" || eventDate =="" || eventDesc == ""){
      alert("Porfa entre un nombre, horario y descripción para su evento");
    }else{
      $("#creatediv").css("display", "none");
    }
  });
/* EDITABLE TABLE ON PAGE EXAMPLE --> but data just saved on webpage...
  var $TABLE = $('#table');
  var $BTN = $('#export-btn');
  var $EXPORT = $('#export');

  $('.table-add').click(function () {
    var $clone = $TABLE.find('tr.hide').clone(true).removeClass('hide table-line');
    $TABLE.find('table').append($clone);
  });

  $('.table-remove').click(function () {
    $(this).parents('tr').detach();
  });

  $('.table-up').click(function () {
    var $row = $(this).parents('tr');
    if ($row.index() === 1) return; // Don't go above the header
    $row.prev().before($row.get(0));
  });

  $('.table-down').click(function () {
    var $row = $(this).parents('tr');
    $row.next().after($row.get(0));
  });

  // A few jQuery helpers for exporting only
  jQuery.fn.pop = [].pop;
  jQuery.fn.shift = [].shift;

  $BTN.click(function () {
    var $rows = $TABLE.find('tr:not(:hidden)');
    var headers = [];
    var data = [];

    // Get the headers (add special header logic here)
    $($rows.shift()).find('th:not(:empty)').each(function () {
      headers.push($(this).text().toLowerCase());
    });

    // Turn all existing rows into a loopable array
    $rows.each(function () {
      var $td = $(this).find('td');
      var h = {};

      // Use the headers from earlier to name our hash keys
      headers.forEach(function (header, i) {
        h[header] = $td.eq(i).text();
      });

      data.push(h);
    });

    // Output the result
    $EXPORT.text(JSON.stringify(data));
  });

    $('#distance-slider').noUiSlider({
        range: [0, 100],
        start: [5, 50],
        handles: 2,
        step: 1,
        serialization: {
            to: [$('#distance-from'), $('#distance-to')]
        },
        slide: timeToFilter
    }).noUiSlider('disabled', true);

    $('#difficulty-slider').noUiSlider({
        range: [0, 10],
        start: [0, 10],
        handles: 2,
        step: 1,
        serialization: {
            to: [$('#difficulty-from'), $('#difficulty-to')]
        },
        slide: timeToFilter
    }).noUiSlider('disabled', true);

    $('.check').on('click', function () {
        var $this = $(this),
            checked = $this.is(':checked') ? true : false,
            toggling = $this.data('toggling');
        if (checked) {
            $('.slider-val.' + toggling).removeAttr('disabled');
        } else {
            $('.slider-val.' + toggling).attr('disabled', 'shonuff');
        }
        $('#' + toggling + '-slider').noUiSlider('disabled', !checked);
        timeToFilter();
    });


    $('.slider-val').on('change', timeToFilter);
*/
    function timeToFilter() {
        displayedRoutes.clearLayers();
        startEndMarkers.clearLayers();
        var filtered = $.extend(true, {}, originalGeoJSON);

        if ($('#distance-check').is(':checked')) {
            var low = parseFloat($('#distance-from').val()),
                high = parseFloat($('#distance-to').val());
            newFiltered = {type: 'FeatureCollection', features: []};
            for (feature in filtered.features) {
                if (!('distance' in filtered.features[feature].properties) || (filtered.features[feature].properties.distance >= low && filtered.features[feature].properties.distance <= high)) {
                    newFiltered.features.push(filtered.features[feature]);
                }
            }
            filtered = newFiltered;
        }

        if ($('#difficulty-check').is(':checked')) {
            var low = parseFloat($('#difficulty-from').val()),
                high = parseFloat($('#difficulty-to').val());
            newFiltered = {type: 'FeatureCollection', features: []};
            for (feature in filtered.features) {
                if (!('difficulty' in filtered.features[feature].properties) || (filtered.features[feature].properties.difficulty >= low && filtered.features[feature].properties.difficulty <= high)) {
                    newFiltered.features.push(filtered.features[feature]);
                }
            }
            filtered = newFiltered;
        }
        for (feature in filtered.features) {
            var geometry = filtered.features[feature].geometry,
                first = geometry.coordinates[0],
                last = geometry.coordinates[geometry.coordinates.length - 1],
                startMarker = new L.Marker([first[1], first[0]], {icon: startIcon}),
                endMarker = new L.Marker([last[1], last[0]], {icon: endIcon});
            startEndMarkers.addLayer(startMarker).addLayer(endMarker);
        }

        displayedRoutes.addData(filtered);
    }
}());
