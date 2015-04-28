"use strict";

var $ = require('jquery'),
    L = require('leaflet');

var _ZOOM = {
    NEIGHBORHOOD: 16,
    MIN: 8,
    MAX: 19
};

function parseGeoJSON(geojson) {
    try {
        return JSON.parse(geojson);
    } catch (ex) {
        return false;
    }
}

function getLatLngs(geom) {
    // Reference: https://github.com/treekit/treekit/blob/master/app/scripts/main.js#L59
    if (geom.type.indexOf('Multi') === 0) {
        return L.GeoJSON.coordsToLatLngs(geom.coordinates, 1)[0];
    } else {
        return L.GeoJSON.coordsToLatLngs(geom.coordinates, 0);
    }
}

function fetchBlockface(blockfaceId, options) {
    var defer = $.Deferred();

    options = $.extend({}, {
        // Default URL is current page + "/blockedge/<id>/".
        //
        // Keep in sync with apps/survey/urls/survey.py
        //
        // On survey page this should be:
        //     /survey/blockedge/<id>
        // On event survey page this should be:
        //     /survey/<group>/event/<event>/blockedge/<id>/
        url: window.location.pathname + 'blockedge/' + blockfaceId + '/'
    });

    if (!blockfaceId) {
        defer.reject();
    } else {
        // NOTE: This has a hard coded url that must be kept in sync with
        // apps/survey/urls/blockface.py
        $.getJSON(options.url).done(function(blockface) {
            if (!blockface.success) {
                defer.reject();
                return;
            }
            var e = blockface.extent,
                sw = L.latLng(e[1], e[0]),
                ne = L.latLng(e[3], e[2]),
                bounds = L.latLngBounds(sw, ne);
            defer.resolve({
                id: blockface.id,
                bounds: bounds,
                geojson: blockface.geojson
            });
        }).fail(function() {
            defer.reject();
        });
    }
    return defer.promise();
}

function zoomToBlockface(map, blockfaceId) {
    fetchBlockface(blockfaceId).done(function(blockface) {
        map.fitBounds(blockface.bounds);
    });
}

function styledCircleMarker(latLng) {
    return L.circleMarker(latLng, {
        stroke: false,
        fillColor: '#7ac143',
        radius: 5,
        fillOpacity: 1
    });
}

function styledStreetConfirmation() {
    return {
        weight: 3,
        color: '#36b5db'
    };
}

module.exports = {
    ZOOM: Object.freeze ? Object.freeze(_ZOOM) : _ZOOM,

    setCenterAndZoomLL: function(map, zoom, mapLocation) {
        // Never zoom out, or try to zoom farther than allowed.
        var zoomToApply = Math.max(
            map.getZoom(),
            Math.min(zoom, map.getMaxZoom()));

        map.setView(mapLocation, zoomToApply);
    },

    getBlockfaceIdFromUrl: function() {
        // Assumes that the hash contains only a blockface ID
        return parseInt(window.location.hash.substring(1), 10);
    },

    parseGeoJSON: parseGeoJSON,
    getLatLngs: getLatLngs,
    styledCircleMarker: styledCircleMarker,
    styledStreetConfirmation: styledStreetConfirmation,
    fetchBlockface: fetchBlockface,
    zoomToBlockface: zoomToBlockface
};
