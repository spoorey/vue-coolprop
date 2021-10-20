export default {
    install: (app, CPM) => {
      // Plugin code goes here
      var service = {};
      service.CPM = CPM
      service.availableProperties = ['H', 'S', 'T', 'P', 'Q'];
      service.availableUnits = {
        'H': ['j/kg'],
        'S': ['j/(kg*k)'],
        'Q': ['kg/kg'],
        'T': ['k', 'c'],
        'P': ['pa', 'bar'],
      }
      service.PropertySIUnits = {
        'H': 'j/kg',
        'S': 'j/(kg*k)',
        'Q': 'kg/kg',
        'T': 'k',
        'P': 'pa',
      }
      service.SIUnits = Object.values(service.PropertySIUnits);
      service.mapProperties = function(knownProperties) {
        var known = []
        for (var property in knownProperties) {
          known.push(property)
          known.push(knownProperties[property])
        }

        return known;
      }

      service.getProperty = function(fluid, knownProperties, property) {
        var known = service.mapProperties(knownProperties)
        if (typeof window.cm.PropsSI == 'function') {
          return window.cm.PropsSI(property, known[0], known[1], known[2], known[3], fluid);
        }

        return undefined;
      }

      service.getPhase = function(fluid, knownProperties) {
        var q = service.getProperty(fluid, knownProperties, 'Q')
        if (q > 1) {
          return 'gas';
        } else if (q < 0) {
          return 'liquid';
        } else {
          return 'twophase';
        }
      }

      service.completeState = function(fluid, knownProperties) {
        var state = {}
        for (var property in service.availableProperties) {
          property = service.availableProperties[property];
          state[property] = service.getProperty(fluid, knownProperties, property);
        }
        state['phase'] = service.getPhase(fluid, knownProperties);

        return state;
      }
      service.getEmptyMappedState = function() {
        var mapped = {};
        for (var property in service.availableProperties) {
          property = service.availableProperties[property];
          mapped[property] = {};
          for (var unit in service.availableUnits[property]) {
            unit = service.availableUnits[property][unit];
            mapped[property][unit] = '';
          }
        }
        mapped['phase'] = '';

      return mapped;
      }

      service.mapStateToUnits = function(state) {
        var mapped = {};
        for (var property in state) {
          mapped[property] = {};
          for (var unit in service.availableUnits[property]) {
            unit = service.availableUnits[property][unit];
            mapped[property][unit] = service.convertFromSI(state[property], unit);
          }
        }
        mapped['phase'] = state['phase'];

        return mapped;
      }

      service.convert = function (value, unit, conversions) {
        if (service.SIUnits.includes(unit)) {
          return value;
        }

        if (!(unit in conversions)) {
          throw 'Unit "' + unit + '" can not be converted to/from SI';
        }

        return conversions[unit](value);
      }
 
      service.convertToSI = function(value, unit) {
        var conversions = {
          'c': function(val) {return val+273.15},
          'bar': function(val) {return val*(1e5)}
        };

        return service.convert(value, unit, conversions)
      }

      service.convertFromSI = function(value, unit) {
        var conversions =  {
          'c': function(val) {return val-273.15},
          'bar': function(val) {return val/(1e5)},
        }

        return service.convert(value, unit, conversions)
      }



      app.coolProp = function() {
        return service;
      }
  }
}
