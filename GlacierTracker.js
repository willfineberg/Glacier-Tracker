// Will Fineberg
// GEO 343 - Final Project

/******************** Global Variables  ********************/

// For GIF and Sentinel-2
var bufferSizeIn = 4000;
var gifStartYear = 2015;
var gifEndYear = 2022;
var gifStartMonth = 6;
var gifEndMonth = 9;
var url = '';
// For Landsat 5
var l5_startYear = 1984;
var l5_endYear = 1990;
var l5_startMonth = 6;
var l5_endMonth = 9;
var l5_cloudCover = 3;
var l5_filter = ee.Filter.and(
                  ee.Filter.calendarRange(1984, 1990, 'year'),
                  ee.Filter.calendarRange(6, 9, 'month'),
                  ee.Filter.lte('CLOUD_COVER', 3)
                );
// For Landsat 8
var l8_startYear = 2020;
var l8_endYear = 2023;
var l8_startMonth = 6;
var l8_endMonth = 9;
var l8_cloudCover = 3
var l8_filter = ee.Filter.and(
                  ee.Filter.calendarRange(2019, 2023, 'year'),
                  ee.Filter.calendarRange(6, 9, 'month'),
                  ee.Filter.lte('CLOUD_COVER', 3)
                );
// For NDGI
var lNdgiMin = -0.03;
var lNdgiMax = 0.13;
var rNdgiMin = -0.03;
var rNdgiMax = 0.13;
var lNdgiOp = 0.5;
var rNdgiOp = 0.5;
var lNdgi = true;
var rNdgi = true;
// Dictionaries used for ui.Select dropdowns
var monthDict = {
  "Jan": 1,
  "Feb": 2,
  "Mar": 3,
  "Apr": 4,
  "May": 5,
  "June": 6,
  "July": 7,
  "Aug": 8,
  "Sept": 9,
  "Oct": 10,
  "Nov": 11,
  "Dec": 12
};
var l5_years = {
  "1984": 1984,
  "1985": 1985,
  "1986": 1986,
  "1987": 1987,
  "1988": 1988,
  "1989": 1989,
  "1990": 1990,
  "1991": 1991,
  "1992": 1992,
  "1993": 1993,
  "1994": 1994,
  "1995": 1995,
  "1996": 1996,
  "1997": 1997,
  "1998": 1998,
  "1999": 1999,
  "2000": 2000,
  "2001": 2001,
  "2002": 2002,
  "2003": 2003,
  "2004": 2004,
  "2005": 2005,
  "2006": 2006,
  "2007": 2007,
  "2008": 2008,
  "2009": 2009,
  "2010": 2010,
  "2011": 2011,
  "2012": 2012,
  "2013": 2013
};
var l8_years = {
  "2013": 2013,
  "2014": 2014,
  "2015": 2015,
  "2016": 2016,
  "2017": 2017,
  "2018": 2018,
  "2019": 2019,
  "2020": 2020,
  "2021": 2021,
  "2022": 2022,
  "2023": 2023
};


/******************** Landsat Setup (filtering and true color) ********************/

// Functions to Filter Landsat Imagery dynamically
function l5_filtered() {
  print("Landsat 5: " + l5_startMonth + ", " + l5_endMonth + " | " + l5_startYear + ", " + l5_endYear + " | " + "cloudCover: " + l5_cloudCover);
  if (l5_startYear <= l5_endYear) {
    l5_filter = ee.Filter.and(
      ee.Filter.calendarRange(l5_startYear, l5_endYear, 'year'),
      ee.Filter.calendarRange(l5_startMonth, l5_endMonth, 'month'),
      ee.Filter.lte('CLOUD_COVER', l5_cloudCover)
    );
  } else {
    // Years were reversed, so do not update the filter
    print("Reversed Years for Landsat 5, provided previous filter...")
  }
  return landsat5.filter(l5_filter);
}
function l8_filtered() {
  print("Landsat 8: " + l8_startMonth + ", " + l8_endMonth + " | " + l8_startYear + ", " + l8_endYear + " | " + "cloudCover: " + l8_cloudCover);
  if (l5_startYear <= l5_endYear) {
    l8_filter = ee.Filter.and(
      ee.Filter.calendarRange(l8_startYear, l8_endYear, 'year'),
      ee.Filter.calendarRange(l8_startMonth, l8_endMonth, 'month'),
      ee.Filter.lte('CLOUD_COVER', l8_cloudCover)
    );
  } else {
    // Years were reversed, so do not update the filter
    print("Reversed Years for Landsat 8, provided previous filter...")
  }
  return landsat8.filter(l8_filter);
}

// Setup Landsat True-Color Visualization Parameters
var trueColorl8Vis = {
  min: 0.0,
  max: 0.4,
};
var trueColorl5Vis = {
  min: 0.0,
  max: 0.4,
  gamma: 1.2,
};


/******************** Sentinel-2 Filter and Bitmask (for GIF creation) ********************/

// Function to dynamically filter Sentinel-2 Imagery
function sentinelFiltered() {
  // Log GIF Creation Params
  print("Create GIF with Params: ", 
        "Year Range: " + gifStartYear + ", " + gifEndYear, 
        "Month Range: " + gifStartMonth + ", " + gifEndMonth);
  // Setup and apply filter
  var s2_filter = ee.Filter.and(
    ee.Filter.calendarRange(gifStartYear, gifEndYear, 'year'),
    ee.Filter.calendarRange(gifStartMonth, gifEndMonth, 'month'),
    ee.Filter.lte('CLOUDY_PIXEL_PERCENTAGE', 3)
  );
  // Return filtered Image Collection of Sentinel-2 Imagery
  return sentinel2.filter(s2_filter);
}  
  
// Function to apply bitmask for clouds to Sentinel-2
function maskS2clouds(image) {
  var qa = image.select('QA60')
  
  // Bits 10 and 11 are clouds and cirrus, respectively.
  var cloudBitMask = 1 << 10;
  var cirrusBitMask = 1 << 11;

  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudBitMask).eq(0).and(
            qa.bitwiseAnd(cirrusBitMask).eq(0))

  // Return the masked and scaled data, without the QA bands.
  return image.updateMask(mask).divide(10000)
      .select("B.*")
      .copyProperties(image, ["system:time_start"])
}


/******************** NDGI Setup (function application and vis param setup) ********************/

// Functions to dynamically map NDGI
var l8_addNDGI = function(image) {
  var ndgi = image.normalizedDifference(['B3','B4']).rename('NDGI');
  return image.addBands(ndgi);
}
var l5_addNDGI = function(image) {
  var ndgi = image.normalizedDifference(['B2','B3']).rename('NDGI');
  return image.addBands(ndgi);
}

function l8_ndgiFinal() {
  return l8_filtered().map(l8_addNDGI);
}
function l5_ndgiFinal() {
  return l5_filtered().map(l5_addNDGI);
}

// Functions to dynamically return Vis Params for NDGI
function rVisUpdate() {
  return {
    bands: 'NDGI',
    min: rNdgiMin,  // modify these?
    max: rNdgiMax,
    //stretch: 'linear',
    opacity: rNdgiOp,
    palette: ['#00ff00', '#ffff00', '#ff0000']
  }
}
function lVisUpdate() {
  return {
    bands: 'NDGI',
    min: lNdgiMin,  // modify these?
    max: lNdgiMax,
    //stretch: 'linear',
    opacity: lNdgiOp,
    palette: ['#00ff00', '#ffff00', '#ff0000']// palette: ['#ffffff',/*'#c6ddff','#00aaff',*/'#0000ff']
  }
}


/******************** UI Split Panel Implementation ********************/

// Left Side - 1980s
var leftMap = ui.Map();

// Right Side - 2020s
var rightMap = ui.Map();

// Define the Split Panel Object
var splitPanel = ui.SplitPanel({
  firstPanel: leftMap,
  secondPanel: rightMap,
  wipe: true,
});


/******************** UI Dropdown Implementation (top-center; for Glacier selection) ********************/

// Define Styling for Subheadings
var subStyle = { fontSize:'14px', fontWeight:'bold' };

// Define the glaciers dictionary with names as keys and locations as values
var glaciers = {
  'Columbia Glacier, Alaska': ee.Geometry.Point(-147.0674, 61.0964),
  'Jakobshavin Glacier, Greenland': ee.Geometry.Point(-50.60650300226569, 69.16339905319616),
  'Helheim Glacier, Greenland': ee.Geometry.Point(-37.439588827910555, 66.36795148191656),
  'Muir Glacier, Alaska': ee.Geometry.Point(-134.81993320312503, 59.28002887415335),
  'Athabasca Glacier, Alberta': ee.Geometry.Point(-117.2266, 52.2205),
  'Mont Blanc, French Alps': ee.Geometry.Point(6.8647, 45.8325),
  'Rhone Glacier, Switzerland': ee.Geometry.Point(8.4062, 46.5589),
  'Mendenhall Glacier, Alaska': ee.Geometry.Point(-134.5486, 58.4358),
  'Pasterze Glacier, Austria': ee.Geometry.Point(12.6908, 47.0797),
};

// Create a dropdown Select element
var selectGlacier = ui.Select({
  items: Object.keys(glaciers),
  placeholder: 'Pick a Glacier...',
  onChange: function(value) {
    var selectedGlacier = glaciers[value];
    leftMap.centerObject(selectedGlacier, 10);
  },
  style: { width: '150px'}
});

// Create a panel to hold the dropdown Select element and its Label
var selectGlacierPanel = ui.Panel({
  widgets: [
    ui.Label('Zoom to Glacier:', { fontSize:'14px', fontWeight:'bold', margin: '14px 4px 0px 6px' }),
    selectGlacier
  ],
  style: { position: 'top-center' },
  layout: ui.Panel.Layout.Flow('horizontal'),
});


/******************** UI for Dynamic Visualization (bottom-left & bottom-right UI) ********************/

// Function to update visualization
// First remove existing layers, then add them back using new Image Collections and Vis Params
function updateVisualization(map) {
  var visParams;
  if (map === leftMap) { // map is left, so Landsat 5
    map.remove(map.layers().get(1));
    map.remove(map.layers().get(0));
    map.addLayer(l5_filtered().select(['B3', 'B2', 'B1']), trueColorl5Vis, 'True Color (L5)',true);
    map.addLayer(l5_ndgiFinal(), lVisUpdate(), 'l5 final NDGI', lNdgi);
  } else if (map === rightMap) { // map is right, so Landsat 8
    map.remove(map.layers().get(1));
    map.remove(map.layers().get(0));
    map.addLayer(l8_filtered().select(['B4', 'B3', 'B2']), trueColorl8Vis, 'True Color (L8)',true);
    map.addLayer(l8_ndgiFinal(), rVisUpdate(), 'l8 final NDGI', rNdgi);
  }
}


///// Landsat 5 Dropdowns - Left-Side /////

var lVisLabel = ui.Label('Landsat 5 Filtering: ', subStyle);

// UI Slider for Cloud Cover - Left-Side Landsat 5
var lSliderCloudCover = ui.Slider({
  min: 0,
  max: 25,
  value: l5_cloudCover,
  step: 1,
  onChange: function(value) {
    l5_cloudCover = value;
    updateVisualization(leftMap);
  },
  style: { width: '130px', margin: '4px 0px 6px 12px' }
});

// UI for Year Selection - Left-Side Landsat 5
var lSelectStartYear = ui.Select({
  items: Object.keys(l5_years),
  placeholder: l5_startYear.toString(),
  onChange: function(value) {
    l5_startYear = l5_years[value];
    updateVisualization(leftMap);
  },
});
var lSelectEndYear = ui.Select({
  items: Object.keys(l5_years),
  placeholder: l5_endYear.toString(),
  onChange: function(value) {
    l5_endYear = l5_years[value];
    updateVisualization(leftMap);
  },
});
var lVisYearsPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Year Range: ', style: {margin: '14px 18px 0px 16px'} }), lSelectStartYear, ui.Label('to',{'margin':'15px 5px 0px 5px'}), lSelectEndYear],
  layout: ui.Panel.Layout.Flow('horizontal'),
});

// UI for Month Selection - Left-Side Landsat 5
var lSelectStartMonth = ui.Select({
  items: Object.keys(monthDict),
  placeholder: 'June',
  onChange: function(value) {
    l5_startMonth = monthDict[value];
    updateVisualization(leftMap);
  },
});
var lSelectEndMonth = ui.Select({
  items: Object.keys(monthDict),
  placeholder: 'Sept',
  onChange: function(value) {
    l5_endMonth = monthDict[value];
    updateVisualization(leftMap);
  },
});
var lVisMonthsPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Month Range: ', style: {margin: '14px 6px 0px 16px'} }), lSelectStartMonth, ui.Label('to',{'margin':'15px 5px 0px 5px'}), lSelectEndMonth],
  layout: ui.Panel.Layout.Flow('horizontal'),
});


///// Landsat 8 Dropdowns - Right-Side /////

var rVisLabel = ui.Label('Landsat 8 Filtering: ', subStyle);

// UI Slider for Cloud Cover- Left-Side Landsat 5
var rSliderCloudCover = ui.Slider({
  min: 0,
  max: 25,
  value: l8_cloudCover,
  step: 1,
  onChange: function(value) {
    l8_cloudCover = value;
    updateVisualization(rightMap);
  },
  style: { width: '130px', margin: '4px 0px 6px 12px' }
});

// UI for Year Selection - Right-Side Landsat 8
var rSelectStartYear = ui.Select({
  items: Object.keys(l8_years),
  placeholder: l8_startYear.toString(),
  onChange: function(value) {
    l8_startYear = l8_years[value];
    updateVisualization(rightMap);
  },
});
var rSelectEndYear = ui.Select({
  items: Object.keys(l8_years),
  placeholder: l8_endYear.toString(),
  onChange: function(value) {
    l8_endYear = l8_years[value];
    updateVisualization(rightMap);
  },
});
// Put above Selects in a Panel
var rVisYearsPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Year Range: ', style: {margin: '14px 18px 0px 16px'} }), rSelectStartYear, ui.Label('to',{'margin':'15px 5px 0px 5px'}), rSelectEndYear],
  layout: ui.Panel.Layout.Flow('horizontal'),
});

// UI for Month Selection - Right-Side Landsat 8
var rSelectStartMonth = ui.Select({
  items: Object.keys(monthDict),
  placeholder: 'June',
  onChange: function(value) {
    l8_startMonth = monthDict[value];
    updateVisualization(rightMap);
  },
});
var rSelectEndMonth = ui.Select({
  items: Object.keys(monthDict),
  placeholder: 'Sept',
  onChange: function(value) {
    l8_endMonth = monthDict[value];
    updateVisualization(rightMap);
  },
});
// Put above Selects in a Panel
var rVisMonthsPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Month Range: ', style: {margin: '14px 6px 0px 16px'} }), rSelectStartMonth, ui.Label('to',{'margin':'15px 5px 0px 5px'}), rSelectEndMonth],
  layout: ui.Panel.Layout.Flow('horizontal'),
});


///// NDGI Toggle and Sliders /////

// UI for NDGI Left-Side Toggle
var lNdgiToggleLabel = ui.Label('NDGI Visualization: ', subStyle);
var lNdgiToggle = ui.Checkbox({
  label: 'NDGI',
  value: true,
  onChange: function (value) {
    lNdgi = value;
    leftMap.layers().get(1).setShown(lNdgi); 
  },
});

// UI for NDGI Right-Side Toggle
var rNdgiToggleLabel = ui.Label('NDGI Visualization: ', subStyle);
var rNdgiToggle = ui.Checkbox({
  label: 'NDGI',
  value: true,
  onChange: function (value) {
    rNdgi = value;
    rightMap.layers().get(1).setShown(rNdgi); 
  },
});

// Create UI Sliders to adjust NDGI Visualization Left-Side
var lNdgiMinSlider = ui.Slider({
  min: -0.1,
  max: 0.25,
  value: lNdgiMin,
  step: 0.01,
  onChange: function(value) {
    lNdgiMin = value;
    updateVisualization(leftMap);
  },
  style: { width: '170px', margin: '2px 0px 2px 26px' }
});
var lNdgiMaxSlider = ui.Slider({
  min: -0.1,
  max: 0.25,
  value: lNdgiMax,
  step: 0.01,
  onChange: function(value) {
    lNdgiMax = value;
    updateVisualization(leftMap);
  },
  style: { width: '170px', margin: '2px 0px 2px 24px' }
});
var lNdgiOpSlider = ui.Slider({
  min: 0.1,
  max: 1,
  value: lNdgiOp,
  step: 0.1,
  onChange: function(value) {
    lNdgiOp = value;
    print(lNdgiOp);
    updateVisualization(leftMap);
  },
  style: { width: '170px', margin: '2px 0px 2px 4px' }
});

// Create UI Sliders to adjust NDGI Visualization Right-Side
var rNdgiMinSlider = ui.Slider({
  min: -0.1,
  max: 0.25,
  value: rNdgiMin,
  step: 0.01,
  onChange: function(value) {
    rNdgiMin = value;
    updateVisualization(rightMap);
  },
  style: { width: '170px', margin: '2px 0px 2px 26px' }
});
var rNdgiMaxSlider = ui.Slider({
  min: -0.1,
  max: 0.25,
  value: rNdgiMax,
  step: 0.01,
  onChange: function(value) {
    rNdgiMax = value;
    updateVisualization(rightMap);
  },
  style: { width: '170px', margin: '2px 0px 2px 24px' }
});
var rNdgiOpSlider = ui.Slider({
  min: 0.1,
  max: 1,
  value: rNdgiOp,
  step: 0.1,
  onChange: function(value) {
    rNdgiOp = value;
    updateVisualization(rightMap);
  },
  style: { width: '170px', margin: '2px 0px 2px 4px' }
});


///// Assemble Sliders into Labeled Panels /////

// Left-Side Panels
var lSliderCloudCoverPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Cloud Cover (%): ', style: {margin: '4px 0px 6px 16px'} }), lSliderCloudCover],
  layout: ui.Panel.Layout.Flow('horizontal'),
});
var lNdgiMinPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Min: ', style: {margin: '0px 0px 0px 16px'} }), lNdgiMinSlider],
  layout: ui.Panel.Layout.Flow('horizontal'),
});
var lNdgiMaxPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Max: ', style: {margin: '0px 0px 0px 16px'} }), lNdgiMaxSlider],
  layout: ui.Panel.Layout.Flow('horizontal'),
});
var lNdgiOpPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Opacity: ', style: {margin: '0px 0px 0px 16px'} }), lNdgiOpSlider],
  layout: ui.Panel.Layout.Flow('horizontal'),
});

// Right-Side Panels
var rSliderCloudCoverPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Cloud Cover (%): ', style: {margin: '4px 0px 6px 16px'} }), rSliderCloudCover],
  layout: ui.Panel.Layout.Flow('horizontal'),
});
var rNdgiMinPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Min: ', style: {margin: '0px 0px 0px 16px'} }), rNdgiMinSlider],
  layout: ui.Panel.Layout.Flow('horizontal'),
});
var rNdgiMaxPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Max: ', style: {margin: '0px 0px 0px 16px'} }), rNdgiMaxSlider],
  layout: ui.Panel.Layout.Flow('horizontal'),
});
var rNdgiOpPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Opacity: ', style: {margin: '0px 0px 0px 16px'} }), rNdgiOpSlider],
  layout: ui.Panel.Layout.Flow('horizontal'),
});

///// Bottom Panels to combine NDGI and Landsat UI Visualization elements /////

// Create Panels to store all Vis Param UI Elements
var lVisPanel = ui.Panel({
  widgets: [ui.Panel([lVisLabel, lSliderCloudCoverPanel, lVisYearsPanel, lVisMonthsPanel]), // Landsat 5 Dropdowns
            ui.Panel([lNdgiToggleLabel, lNdgiToggle],ui.Panel.Layout.Flow('horizontal')),   // NDGI Heading and Checkbox
            ui.Panel([lNdgiMinPanel, lNdgiMaxPanel, lNdgiOpPanel])],                        // NDGI Sliders
            
  style: { position: 'bottom-left' }
});
var rVisPanel = ui.Panel({
  widgets: [ui.Panel([rVisLabel, rSliderCloudCoverPanel, rVisYearsPanel, rVisMonthsPanel]), // Landsat 8 Dropdowns
            ui.Panel([rNdgiToggleLabel, rNdgiToggle],ui.Panel.Layout.Flow('horizontal')),   // NDGI Heading and Checkbox
            ui.Panel([rNdgiMinPanel, rNdgiMaxPanel, rNdgiOpPanel])],                        // NDGI Sliders
  style: { position: 'bottom-right' }
});


/******************** GIF Creation using Crosshair Selector (onClick handler) ********************/

// Set Crosshair Cursors
leftMap.style().set('cursor', 'crosshair');
rightMap.style().set('cursor', 'crosshair');

// Define the bottom-left panel for the thumbnail
var thumbPanel = ui.Panel({ style: { position: 'top-right' } });

// Make a function to handle GIF creation
function makeGifHandler(coords) {
  // Log Coords
  print(coords.lat + ", " + coords.lon);
  // Get location from user-input click
  var buffer = ee.Geometry.Point(coords.lon, coords.lat).buffer(bufferSizeIn).bounds();
  // Filter date with func, then filter bounds, and then map bitmask function
  var s2_collection = sentinelFiltered().filterBounds(buffer).map(maskS2clouds);
  // Setup gif visualization params
  var gifParams = {
    bands: ['B4', 'B3', 'B2'],
    min: 0,
    max: 0.35,
    region: buffer,
    framesPerSecond: 5,
    format: 'gif'
  };
  // Try-Catch Block handles failed GIF creation
  try {
    // Try to make thumbnail
    var thumb = ui.Thumbnail({
      image: s2_collection, 
      params: gifParams
    });
    thumbPanel.clear();
    thumbPanel.add(thumb);
    // Create an thumbnail onClick event handler
    thumb.onClick(function() {
      // Turn off the thumbnail when it's clicked
      thumb.style().set('shown', false);
    });
    // Then try to make VideoThumbURL
    url = s2_collection.getVideoThumbURL(gifParams);
    urlLabel.style().set('color', 'black');
    titleLabel.style().set({'color': 'blue', border: '2px solid blue'});
    urlLabel.setValue(url).setUrl(url).setImageUrl(url);
  } catch (error) {
    // Set UI accordingly when error has occured
    print("An error occured: ", error.message);
    urlLabel.setValue("ERROR: Modify inputs above to prevent Internal Error: " + error.message).setUrl('').setImageUrl('');
    urlLabel.style().set('color', 'red');
    titleLabel.style().set({'color': 'red', border: '3px solid red'});
    thumbPanel.clear();
  }
}

// Handle onClick event with makeGifHandler() function, defined above
leftMap.onClick(makeGifHandler);
rightMap.onClick(makeGifHandler);


/******************** UI Elements for GIF Creation (top-left UI panel) ********************/

// Create a Slider for Buffer Size
var bufferSizeSlider = ui.Slider({
  min: 2000,
  max: 9000,
  value: 4000,
  step: 100,
  onChange: function(value) {
    bufferSizeIn = value;
  },
  style: { width: '180px', margin: '2px 0px 2px 10px' }
});

// Title Label
var titleLabel = ui.Label('Make a Glacier GIF!');
titleLabel.style().set({
  fontSize: '18px',
  fontWeight: 'bold',
  border: '2px solid blue',
  padding: '2px',
  color: 'blue'
});

// Buffer Label
var bufferSizeLabel = ui.Label('Set Buffer Size (m):', subStyle);
// Year Range Label
var gifYearRangeLabel = ui.Label('Set Year Ranges:', subStyle);
// Date Range Label
var gifMonthRangeLabel = ui.Label('Set Month Ranges:', subStyle);

// Instruction and URL Labels
var finallyLabel = ui.Label('Click map and see output:',subStyle);
var urlLabel = ui.Label('');
var urlPanel = ui.Panel();
urlPanel.add(urlLabel);

// Create Sliders for Sentinel-2 Dates
var gifStartYearSlider = ui.Slider({
  min: 2015,
  max: 2023,
  value: gifStartYear,
  step: 1,
  onChange: function(value) {
    gifStartYear = value;
  },
  style: { width: '133px', margin: '2px 0px 2px 8px' }
});
var gifEndYearSlider = ui.Slider({
  min: 2015,
  max: 2023,
  value: gifEndYear,
  step: 1,
  onChange: function(value) {
    gifEndYear = value;
  },
  style: { width: '133px', margin: '2px 0px 2px 15px' }
});

// Create a Panel to hold Sentinel-2 Year Sliders
var gifStartYearPanel = ui.Panel({
  widgets: [ui.Label({ value: 'Start: ', style: {margin: '2px 0px 2px 10px'} }), gifStartYearSlider],
  layout: ui.Panel.Layout.Flow('horizontal'),
});
var gifEndYearPanel = ui.Panel({
  widgets: [ui.Label({ value: 'End: ', style: {margin: '2px 0px 2px 10px'} }), gifEndYearSlider],
  layout: ui.Panel.Layout.Flow('horizontal'),
});

// Create ui.Select elements for monthDict for Sentinel-2
var gifSelectStartMonth = ui.Select({
  items: Object.keys(monthDict),
  placeholder: 'June',
  onChange: function(value) {
    gifStartMonth = monthDict[value];
  },
});
var gifSelectEndMonth = ui.Select({
  items: Object.keys(monthDict),
  placeholder: 'Sept',
  onChange: function(value) {
    gifEndMonth = monthDict[value];
  },
});

// Create a Panel to hold Month Selects above for Sentinel-2
var gifMonthDropdownPanel = ui.Panel({
  widgets: [gifSelectStartMonth, ui.Label('to',{'margin':'15px 5px 0px 5px'}), gifSelectEndMonth],
  layout: ui.Panel.Layout.Flow('horizontal'),
  style: {margin: '0px 0px 0px 14px'}
});

// Create a Panel to hold the all the Sentinel-2 and GIF Creation UI components (top-left panel)
var bufferSizePanel = ui.Panel({
  widgets: [
              titleLabel, 
              bufferSizeLabel, 
              bufferSizeSlider, 
              gifYearRangeLabel, 
              gifStartYearPanel, 
              gifEndYearPanel,
              gifMonthRangeLabel,
              gifMonthDropdownPanel,
              finallyLabel, 
              urlPanel
            ],
  style: { width: '200px', position: 'top-left' }
});


/******************** Build UI on the root ********************/

// Clear the Root UI and add the new SplitPanel
ui.root.clear();
ui.root.add(splitPanel);

// Modify Layout so that new Panels are added as overlay to main canvas
ui.root.setLayout(ui.Panel.Layout.absolute());

// Add other UI elements here (currently just selectGlacierPanel, but stay tuned!)
//selectGlacierPanel.add(bufferSizePanel);
ui.root.add(selectGlacierPanel);

// Add the bufferSizePanel to the user interface
ui.root.add(bufferSizePanel);

// Add UI Toggle and Sliders for NDGI Visualization
ui.root.add(lVisPanel);
ui.root.add(rVisPanel);

// Add Thumbnail Panel to bottom-left
ui.root.add(thumbPanel);

// Ensure maps stay linked as user pans around
ui.Map.Linker([leftMap, rightMap], 'change-bounds');


/******************** Add layers and set default position ********************/

// Default Left Side - Landsat 5
leftMap.addLayer(l5_filtered().select(['B3', 'B2', 'B1']), trueColorl5Vis, 'True Color (L5)',true);
leftMap.addLayer(l5_ndgiFinal(),lVisUpdate(),'l5 final NDGI',true);

// Default Right Side - Landsat 8
rightMap.addLayer(l8_filtered().select(['B4', 'B3', 'B2']), trueColorl8Vis, 'True Color (L8)',true);
rightMap.addLayer(l8_ndgiFinal(),rVisUpdate(),'l8 final NDGI',true);

// Remove everything from Web App except for the Scale Bar
var controlVis = {
  all: false,
  layerList: false, 
  zoomControl: false,
  scaleControl: true,
  mapTypeControl: false,
  fullscreenControl: false,
  drawingToolsControl: false
}
leftMap.setControlVisibility(controlVis);
rightMap.setControlVisibility(controlVis);

// Try to set Default Location
leftMap.setCenter(-147.01, 61.05, 10); // Columbia Glacier