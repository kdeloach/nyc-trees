"use strict";

var $ = require('jquery'),
    L = require('leaflet'),
    toastr = require('toastr'),
    mapModule = require('./map'),
    zoom = require('./mapUtil').zoom,
    SelectableBlockfaceLayer = require('./lib/SelectableBlockfaceLayer'),
    Storage = require('./lib/Storage'),

    dom = {
        currentReservations: "#current-reservations",
        totalReservations: "#total-reservations"
    };

// Extends the leaflet object
require('leaflet-utfgrid');
require('leaflet-draw');

var reservationMap = mapModule.create({
    geolocation: true,
    legend: true,
    search: true
});

reservationMap.on('draw:created', function (e) {
    var type = e.layerType,
        layer = e.layer;
    reservationMap.addLayer(layer);
    console.log(toWKT(layer));
});

function toWKT(layer) {
    var lng, lat, coords = [];
    if (layer instanceof L.Polygon || layer instanceof L.Polyline) {
        var latlngs = layer.getLatLngs();
        for (var i = 0; i < latlngs.length; i++) {
            coords.push(latlngs[i].lng + " " + latlngs[i].lat);
            if (i === 0) {
                lng = latlngs[i].lng;
                lat = latlngs[i].lat;
            }
    };
        if (layer instanceof L.Polygon) {
            return "POLYGON((" + coords.join(",") + "," + lng + " " + lat + "))";
        } else if (layer instanceof L.Polyline) {
            return "LINESTRING(" + coords.join(",") + ")";
        }
    } else if (layer instanceof L.Marker) {
        return "POINT(" + layer.getLatLng().lng + " " + layer.getLatLng().lat + ")";
    }
}

L.tileLayer(config.urls.layers.reservable.tiles, {
    maxZoom: zoom.MAX
}).addTo(reservationMap);

var $current = $(dom.currentReservations),
    selectedBlockfacesCount = +($current.text()),
    blockfaceLimit = +($(dom.totalReservations).text()),
    selectedBlockfaces = {},

    grid = L.utfGrid(config.urls.layers.reservable.grids, {
        maxZoom: zoom.MAX,
        useJsonP: false
    });

var progress = new Storage({
    key: 'reserve-blockfaces',
    getState: function() {
        return {
            selections: selectedBlockfaces
        };
    },
    validate: function(state) {
        if (!$.isPlainObject(state.selections)) {
            throw new Error('Expected `state.selections` to contain blockfaces');
        }
    }
});

var selectedLayer = new SelectableBlockfaceLayer(reservationMap, grid, {
    onAdd: function(gridData) {
        if (selectedBlockfacesCount < blockfaceLimit &&
                gridData.restriction === 'none') {
            selectedBlockfaces[gridData.id] = gridData;
            selectedBlockfacesCount++;
            $current.text(selectedBlockfacesCount);

            progress.save();
            return true;
        }
        return false;
    },

    onRemove: function(feature) {
        if (selectedBlockfacesCount > 0) {
            selectedBlockfacesCount--;
            $current.text(selectedBlockfacesCount);
        }
        delete selectedBlockfaces[feature.properties.id];

        progress.save();
        return true;
    }
});

grid.on('click', function(e) {
    if (!e.data) {
        return;
    }
    if (selectedBlockfacesCount >= blockfaceLimit) {
        toastr.error('You have reached your reservation limit');
    } else if (e.data.restriction !== 'none') {
        toastr.error('The blockface you selected is not available');
    }
});

reservationMap.addLayer(grid);
reservationMap.addLayer(selectedLayer);

// Load any existing data.
var state = progress.load();
if (state) {
    $.each(state.selections, function(id, data) {
        selectedLayer.addBlockface(data);
    });
    try {
        // Zoom to extent of selected blockface reservations.
        reservationMap.fitBounds(selectedLayer.getBounds());
    } catch (ex) {
        // Ignore Leaflet fitBounds error when there are no selections.
    }
}
