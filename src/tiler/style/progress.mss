// If you change these colors, also change:
// src/nyc_trees/sass/partials/_legend.scss
@mapped: #8BC34A;
@not-mapped: #85664B;

#survey_blockface {
  [zoom<12] {
    line-width: 0;
    marker-width: 2;
    marker-line-width: 0;
    marker-placement: point;
    marker-type: ellipse;
    marker-allow-overlap: true;
  }
  [zoom>=12] {
    // Note: this must be kept in sync with:
    // src/nyc_trees/js/src/BlockfaceLayer.js
    line-width: 1;
    marker-width: 0;
    line-join: round;
    line-cap: round;
  }

  [zoom = 16]{ line-width: 2; }
  [zoom = 17]{ line-width: 4; }
  [zoom = 18]{ line-width: 8; }
  [zoom = 19]{ line-width: 16; }

  [is_mapped = 'T'] {
    line-color: @mapped;
    marker-fill: @mapped;
    [zoom <= 17]{ line-width: 6; }
  }
  [is_mapped = 'F'] {
    line-color: @not-mapped;
    marker-fill: @not-mapped;
  }
}
