// Battery status
// * Not charging might mean a power outage, or someone took the phone away
var powerSource = (function(global) {

  var id = 'source-power',
      title = 'Power',
      lastVal = null;

  function start() {
    navigator.getBattery().then(function(battery) {
      lastVal = battery.charging;
      battery.addEventListener('chargingchange', function(e) {
        if (lastVal != battery.charging) {
          var details = {
            id: 'batteryCharging',
            label: 'Battery is charging',
            type: 'scalar',
            value: battery.charging,
            data: {
              charging: battery.charging,
              level: battery.level,
              chargingTime: battery.chargingTime,
              dischargingTime: battery.dischargingTime
            }
          };

          publish(id, details);
        }

        lastVal = battery.charging;
      });
    });
  }

  // public
  return {
    id: id,
    title: title,
    start: start
  };

})(this);
