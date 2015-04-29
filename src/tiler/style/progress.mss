/* If you change these colors, also change src/nyc_trees/sass/partials/_legend.scss */
@mapped: #8BC34A;
@not-mapped: #85664B;
@not-mapped-zoomed-out: #85664B;

#survey_blockface {
  marker-width: 5;
  marker-opacity: 1;
  marker-placement: point;
  marker-line-width: 0;
  marker-allow-overlap: true;

  // Note: this must be kept in sync with src/nyc_trees/js/src/BlockfaceLayer.js
  [zoom = 16]{ marker-width: 4; }
  [zoom = 17]{ marker-width: 8; }
  [zoom = 18]{ marker-width: 16; }
  [zoom = 19]{ marker-width: 32; }

  [is_mapped = 'T'] {
    marker-fill: @mapped;
    [zoom <= 17]{ marker-width: 12; }
  }
  [is_mapped = 'F'] {
    marker-fill: @not-mapped;
    [zoom <= 15]{
    }
  }
}
