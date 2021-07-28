////////////////Please contact jeffjeff20072@gmail.com for access to the boundary files.////////////////

var dataset = ee.ImageCollection("JAXA/GCOM-C/L3/OCEAN/CHLA/V2")
                .filterDate('2021-01-01', '2021-12-31')
                .filterBounds(geometry);

// // Multiply with slope coefficient
// var image = dataset.mean().multiply(0.0016).log10();

// ///////////////////////////////16 day composite
var temporalCollection = function(collection, start, count, interval, units) {
  // Create a sequence of numbers, one for each time interval.
  var sequence = ee.List.sequence(0, ee.Number(count).subtract(1));

  var originalStartDate = ee.Date(start);

  return ee.ImageCollection(sequence.map(function(i) {
    // Get the start date of the current sequence.
    var startDate = originalStartDate.advance(ee.Number(interval).multiply(i), units);

    // Get the end date of the current sequence.
    var endDate = originalStartDate.advance(
      ee.Number(interval).multiply(ee.Number(i).add(1)), units);

    return collection.filterDate(startDate, endDate).reduce(ee.Reducer.median())
        .set('system:time_start', ee.Date(startDate.millis()))
        .set('system:time_end', ee.Date(endDate.millis()));
  }));
};

var lst16days = temporalCollection(dataset.select(['CHLA_AVE']), '2021-01-01', 7, 30, 'day');
///16 day, 800 periods


var vis = {
  bands: ['CHLA_AVE_median'],
  min: 0,
  max: 4000,
  palette: [
    '3500a8','0800ba','003fd6',
    '00aca9','77f800','ff8800',
    'b30000','920000','880000'
  ]
};

var i12 = lst16days.map(function(img){
  var i1 = img.clip(table);
  var i2 = i1.visualize(vis);
  return i2
  
});

//Map.addLayer(i12,vis);

//Map.setCenter(-81.6937,41.7321, 8);

//print(dataset);

/////////////////////////////////////////////////
// Add a color gradient bar with a label.
var style = require('users/gena/packages:style');
var utils = require('users/gena/packages:utils');
var text = require('users/gena/packages:text');

var geometryGradientBar = geometry2;
var min = 0;
var max = 1;
var textProperties = {
  fontSize: 32,
  textColor: 'ffffff',
  outlineColor: '000000',
  outlineWidth: 0,
  outlineOpacity: 0.6
};
var labels = ee.List.sequence(min, max);
var gradientBar = style.GradientBar.draw(geometryGradientBar, {
  min: min, max: max, palette: vis.palette, labels: labels,
  format: '%.0f', text: textProperties
});

// var label = 'NDVI';
// var scale = 19567;
// var geometryLabel = ee.Geometry.Point([-6.052039657699084, -20.837091553700866]);
// var text = text.draw(label, geometryLabel, scale, {fontSize: 32});

// Create RGB visualization images for use as animation frames.
// Blend the gradient bar and label images to the NDVI images.
var rgbVis = lst16days.map(function(img) {
  return img.visualize(vis).clip(table).blend(gradientBar);
});

// Define GIF visualization arguments.
var gifParams = {
  'region': geometry,
  'dimensions': 1000,
  'crs': 'EPSG:3857',
  'framesPerSecond': 1,
  'format': 'gif'
};

// Print the GIF URL to the console.
print(rgbVis.getVideoThumbURL(gifParams));

///////////////////////

////////////////use instractions from https://gist.github.com/jdbcode/2af647876e03c76de5424e15b30b74ec
////////////////to add lables to GIF
