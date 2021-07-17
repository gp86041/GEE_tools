///////////////change point location to your own location of interest before running
var point = ee.Geometry.Point([-81.7653, 41.5502]);


var dataset = ee.ImageCollection('NOAA/CDR/SST_PATHFINDER/V53')
                  .filter(ee.Filter.date('2020-05-01', '2020-06-30'));
var seaSurfaceTemperature = dataset.select('sea_surface_temperature'); 
var visParams = {
  min: 0.0,
  max: 2500.0,
  palette: [
    '030d81', '0519ff', '05e8ff', '11ff01', 'fbff01', 'ff9901', 'ff0000',
    'ad0000'
  ],
};
Map.setCenter(-81.6937,41.7321, 8);
Map.addLayer(seaSurfaceTemperature, visParams, 'Sea Surface Temperature');

print(dataset);

Map.addLayer(point);

var point2 = ee.Geometry.Point([-81.7653, 41.5502]);

Map.addLayer(point2);

////////////////////////visulize data
 /* Create a time series chart showing surface temperature change for the three defined locations based on three years of Landsat 8 images. */
 var tempTimeSeries = ui.Chart.image.seriesByRegion(
     seaSurfaceTemperature, point, ee.Reducer.mean(), 'sea_surface_temperature') 
         .setChartType('ScatterChart') // Set the chart to be a scatter plot
         .setOptions({ //Set options of the plot
           title: 'SST', //Set title 
           vAxis: {title: ''}, //Set x axis label
           lineWidth: 1, // Set the width of the line
           pointSize: 4, // Set the point size for each data point
           series: {
             0: {color: 'FF0000'}
 }});

print(tempTimeSeries);


/////////////////////////////download data
//////////////data is downloaded into your google drive and named as sat_wt.csv
var r22 = function(image) {
  var r2r2 = image.select(['sea_surface_temperature']);
  var r2r5 = r2r2.reduceRegion({
    reducer:ee.Reducer.mean(),
    geometry:point
  });
  return image.set('sampledv', ee.Number(r2r5.get('sea_surface_temperature')))
};

var reduced1 = seaSurfaceTemperature.map(r22);

var y1 = reduced1.aggregate_array('sampledv');

var x1 = reduced1.aggregate_array('system:time_start');

var res1 = (x1.zip(y1));

/////////////export
var featureCollection1 = ee.FeatureCollection(res1
                        .map(function(element){
                        return ee.Feature(null,{prop:element})}))


//print(featureCollection)

//Export.table.toDrive(ee.Element(chartArray));
Export.table.toDrive({
  collection: featureCollection1,
  description:'sat_wt',
  fileFormat: 'CSV'
});