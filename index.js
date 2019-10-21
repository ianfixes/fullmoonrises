var SunCalc = require('suncalc');

// year latitiude longitude
var year = parseInt(process.argv[2]);
var lat = parseFloat(process.argv[3]);
var lon = parseFloat(process.argv[4]);

console.log("Calculating full moonrise dates in " + year + " at " + lat + " " + lon);
//console.log("Right now it's " + dateStr(new Date()));

// Pad a numeric string to 2 digits (leading zero)
function pad2d(s) {
  return ("0" + s).slice(-2);
}

// Format the time portion of a date into "HH:MM" format
function timeStr(d) {
  return [
    pad2d(d.getHours()),
    ":",
    pad2d(d.getMinutes())
  ].join('');
}

// format a date into "YYYY-MM-DD HH:MM"
function dateStr(d) {
  return [
    d.getFullYear(),
    "-",
    pad2d(d.getMonth() + 1),
    "-",
    pad2d(d.getDate()),
    " ",
    timeStr(d),
  ].join('');
}

// get the name for a day given a Date objet
function dayName(d) {
  switch(d.getDay()) {
    case 0: return "Sunday";
    case 1: return "Monday";
    case 2: return "Tuesday";
    case 3: return "Wednesday";
    case 4: return "Thursday";
    case 5: return "Friday";
    case 6: return "Saturday";
  }
}

// get the moment of the day (e.g. "sunset", "night", etc) for a given time
// d is the date DAY in question
// t is the actual date TIME in question
function sunMoment(d, t, lat, lon) {
  var sunTimes = SunCalc.getTimes(d, lat, lon);
  // getTimes returns an object -- Date objects keyed by a friendly name.
  // we want the friendly name
  var whens = Object.keys(sunTimes).sort(function (aa, bb) {
    var a = sunTimes[aa];
    var b = sunTimes[bb];
    return (a > b) - (a < b);
  });

  // find the latest period that describes this time
  return whens.reverse().find(function (k) {
    return sunTimes[k] < t;
  });
}

// Iterate all the days between this year and next year.  if we are within the threshold for
// a full moon, print the data about that
var nextYear = new Date(year + 1, 0, 1);
for (var d = new Date(year, 0, 1); d < nextYear; d.setDate(d.getDate() + 1)) {
  var moonPhase = SunCalc.getMoonIllumination(d).phase;
  if (Math.abs(moonPhase - 0.5) > 0.03) continue;

  var riseTime = SunCalc.getMoonTimes(d, lat, lon).rise
  var moonrisePos = SunCalc.getMoonPosition(riseTime, lat, lon);
  var moonAzimuth = Math.round((180 + (moonrisePos.azimuth * 180 / Math.PI)) % 360);

  console.log([
    dateStr(riseTime),
    "(" + dayName(d) + " " + sunMoment(d, riseTime, lat, lon) + ")",
    "at",
    moonAzimuth + " deg"
  ].join(' '));
}
