'use strict';

const { ZigBeeDevice } = require('homey-zigbeedriver');
const { CLUSTER, Cluster } = require('zigbee-clusters');

// Define Sinope Manufacturer Code
const MANUFACTURER_CODE = 0x119C;

/**
 * Custom Cluster for Sinope specific attributes.
 * ID: 0xFF01
 */
class SinopeCluster extends Cluster {
  static get ID() {
    return 0xFF01;
  }
  static get NAME() {
    return 'manuSpecificSinope';
  }
  static get ATTRIBUTES() {
    return {
      outdoorTempToDisplay: { id: 0x0010, type: Cluster.DataType.INT16 },
      outdoorTempToDisplayTimeout: { id: 0x0011, type: Cluster.DataType.UINT16 },
      timeFormatToDisplay: { id: 0x0114, type: Cluster.DataType.ENUM8 },
      backlightAutoDim: { id: 0x0402, type: Cluster.DataType.ENUM8 },
    };
  }
}

class SinopeThermostat extends ZigBeeDevice {

  /**
   * Lifecycle method called when the device is initialized.
   */
  async onNodeInit({ zclNode }) {
    // Register the custom cluster
    this.registerCluster(SinopeCluster);

    // 1. Measure Temperature (Standard)
    this.registerCapability('measure_temperature', CLUSTER.TEMPERATURE_MEASUREMENT, {
      getOpts: { getOnStart: true },
    });

    // 2. Target Temperature (Standard)
    this.registerCapability('target_temperature', CLUSTER.THERMOSTAT, {
      getOpts: { getOnStart: true },
      get: 'occupiedHeatingSetpoint',
      set: 'occupiedHeatingSetpoint',
      setParser: value => ({ occupiedHeatingSetpoint: value * 100 }),
      reportParser: value => value / 100,
    });

    // 3. Thermostat Mode (Standard)
    this.registerCapability('thermostat_mode', CLUSTER.THERMOSTAT, {
      getOpts: { getOnStart: true },
      get: 'systemMode',
      set: 'systemMode',
      setParser: value => {
        // Map Homey modes to Zigbee modes
        // 0: Off, 4: Heat, 1: Auto (if supported)
        if (value === 'off') return { systemMode: 0 };
        if (value === 'heat') return { systemMode: 4 };
        if (value === 'auto') return { systemMode: 1 };
        return { systemMode: 4 }; // Default to heat
      },
      reportParser: value => {
        if (value === 0) return 'off';
        if (value === 4) return 'heat';
        if (value === 1) return 'auto';
        return 'heat';
      },
    });

    // 4. Power Measurement (Standard)
    if (this.hasCapability('measure_power')) {
      this.registerCapability('measure_power', CLUSTER.ELECTRICAL_MEASUREMENT, {
        get: 'activePower',
        reportParser: value => value / 10, // Sinope often reports in 0.1W or similar, need to verify divisor
      });
    }
    
    // 5. Meter Power (Standard)
    if (this.hasCapability('meter_power')) {
        this.registerCapability('meter_power', CLUSTER.METERING, {
            get: 'currentSummationDelivered',
            reportParser: value => value / 1000, // Usually kWh
        });
    }

    // Configure reporting
    await this.configureAttributeReporting([
      {
        endpointId: 1,
        cluster: CLUSTER.THERMOSTAT,
        attributeName: 'localTemp',
        minInterval: 60,
        maxInterval: 3600,
        minChange: 50, // 0.5 C
      },
      {
        endpointId: 1,
        cluster: CLUSTER.THERMOSTAT,
        attributeName: 'occupiedHeatingSetpoint',
        minInterval: 60,
        maxInterval: 3600,
        minChange: 50, // 0.5 C
      },
      {
          endpointId: 1,
          cluster: CLUSTER.ELECTRICAL_MEASUREMENT,
          attributeName: 'activePower',
          minInterval: 60,
          maxInterval: 3600,
          minChange: 10, // 1W change (assuming 0.1W unit)
      }
    ]).catch(err => {
        this.error('Error configuring attribute reporting', err);
    });
  }

  // Example method to set outdoor temperature on display
  // This could be called from a Flow card action
  async setOutdoorTemperature(temp) {
    try {
      await this.zclNode.endpoints[1].clusters.manuSpecificSinope.writeAttributes(
        { outdoorTempToDisplay: temp * 100 },
        { manufacturerCode: MANUFACTURER_CODE }
      );
    } catch (err) {
      this.error('Failed to set outdoor temperature', err);
    }
  }
}

module.exports = SinopeThermostat;
