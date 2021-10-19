export default {
    install: (app, CPM) => {
      // Plugin code goes here
      var service = {};
      service.CPM = CPM
      service.defaultProperties = ['H', 'S', 'T', 'P', 'Q'];
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
        for (var property in service.defaultProperties) {
          property = service.defaultProperties[property];
          state[property] = service.getProperty(fluid, knownProperties, property);
        }
        state['phase'] = service.getPhase(fluid, knownProperties);

        return state;
      }

      app.coolProp = function() {
        return service;
      }
  }
}
