import * as fluid_data from './coolprop-fluids.js'

export default {
    install: (app, CPM) => {
      // Plugin code goes here
      var service = {};
      service.CPM = CPM
      // @see http://www.coolprop.org/coolprop/HighLevelAPI.html#parameter-table
      service.availableProperties = ['H', 'S', 'T', 'P', 'U', 'Q', 'D', /*'A',*/ 'SMOLAR', 'HMOLAR', 'DMOLAR', 'UMOLAR'];
      service.availableUnits = {
        'H': ['j/kg', 'kj/kg', 'mj/kg'],
        'S': ['j/(kg*k)', 'kj/(kg*k)', 'mj/(kg*k)'],
        'Q': ['kg/kg'],
        'T': ['k', 'c'],
        'P': ['pa', 'bar', 'mpa', 'hpa'],
        'U': ['j/kg'],
        'D': ['kg/m^3'],
        'A': ['m/s', 'km/h'],
        'SMOLAR': ['j/mol*k'],
        'HMOLAR': ['j/mol', 'kj/mol'],
        'DMOLAR': ['mol/m^3', 'mol/L'],
        'UMOLAR': ['j/mol', 'kj/mol'],
      }
      service.PropertySIUnits = {
        'H': 'j/kg',
        'S': 'j/(kg*k)',
        'Q': 'kg/kg',
        'T': 'k',
        'P': 'pa',
        'U': 'j/kg',
        'D': 'kg/m^3',
        'A': 'm/s',
        'SMOLAR': 'j/mol*k',
        'HMOLAR': 'j/mol',
        'DMOLAR': 'mol/m^3',
        'UMOLAR': 'j/mol',
      }
      service.propertyLabels = {
        'DELTA': 'Reduced density (rho/rhoc)',
        'DMOLAR': 'Molar density',
        'D': 'Mass density',
        'HMOLAR': 'Molar specific enthalpy',
        'H': 'Mass specific enthalpy',
        'P': 'Pressure',
        'Q': 'Mass vapor quality',
        'SMOLAR': 'Molar specific entropy',
        'S': 'Mass specific entropy',
        'TAU': 'Reciprocal reduced temperature (Tc/T)',
        'T': 'Temperature',
        'UMOLAR': 'Molar specific internal energy',
        'U': 'Mass specific internal energy',
        'phase': 'Phase',
      }
      service.phases = {
        0: 'liquid',
        5: 'gas',
        6: 'twophase',
        3: 'supercritical liquid',
        2: 'supercritical gas',
        1:'supercritical',
        8: 'not_imposed',

      }
      service.fluids = fluid_data.fluids;
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
        var phase = service.getProperty(fluid, knownProperties, 'Phase')

        return this.phases[phase];
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

      service.mapStateToUnits = function(state, precision) {
        var mapped = {};
        for (var property in state) {
          mapped[property] = {};
          for (var unit in service.availableUnits[property]) {
            unit = service.availableUnits[property][unit];
            mapped[property][unit] = service.convertFromSI(state[property], unit);
            mapped[property][unit] = +Number.parseFloat(mapped[property][unit]).toPrecision(precision)
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
        var e6 = function(val) {return val*(1e6)};
        var e3 = function(val) {return val*(1e3)};
        var conversions = {
          'c': function(val) {return val+273.15},
          'bar': function(val) {return val*(1e5)},
          'hpa': function(val) {return val*(100)},
          'mpa': e6,
          'km/h': function(val) {return val/(3.6)},
          'kj/(kg*k)': e3,
          'kj/kg': e6,
          'mj/(kg*k)': e6,
          'mj/kg': function(val) {return val*1e6},
          'kj/mol': e3,
          'mol/L': e3,
        };

        return service.convert(value, unit, conversions)
      }

      service.convertFromSI = function(value, unit) {
        var e6 = function(val) {return val/(1e6)};
        var e3 = function(val) {return val/(1e3)};
        var conversions =  {
          'c': function(val) {return val-273.15},
          'bar': function(val) {return val/(1e5)},
          'hpa': function(val) {return val/(100)},
          'mpa': e6,
          'km/h': function(val) {return val*(3.6)},
          'kj/(kg*k)': e3,
          'kj/kg': e3,
          'mj/(kg*k)': e6,
          'mj/kg': e6,
          'kj/mol': e3,
          'mol/L': e3,
        }

        return service.convert(value, unit, conversions)
      }

      app.coolProp = function() {
        return service;
      }
  }
}
