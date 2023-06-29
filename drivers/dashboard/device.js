'use strict';

const { Device } = require('homey');
const Util = require("util");
const Axios = require("axios");

class SmashingDevice extends Device {

  /**
   * onInit is called when the device is initialized.
   */
  async onInit() {
    this.log('SmashingDevice has been initialized');

    this._updateWidget = this.homey.flow.getActionCard("update-widget");
    this._updateWidget.registerRunListener(( args, state ) => {
      this.log("Updating widget " + args.widget + ": Set var " + args.variable + " to " + args.value);
      let data = {};
      data[args.variable] = args.value;
      this.updateWidget(args.widget, data);
    });

    this._updateMeterWidget = this.homey.flow.getActionCard("update-meter-widget");
    this._updateMeterWidget.registerRunListener(( args, state ) => {
      this.log("Updating meter widget " + args.widget + ": Set value to " + args.value);
      let data = {};
      data['value'] = args.value;
      this.updateWidget(args.widget, data);
    })

    this._updateNumberWidgetLasts = { };
    this._updateNumberWidget = this.homey.flow.getActionCard("update-number-widget");
    this._updateNumberWidget.registerRunListener((args, state ) => {
      this.log("Updating number widget " + args.widget + ": Set value to " + args.value + ", including last: " + args.includelast);
      let data = {};
      data['current'] = args.value;
      if( args.includelast && (args.widget in this._updateNumberWidgetLasts)) {
        data['last'] = this._updateNumberWidgetLasts[args.widget];
      }
      this.updateWidget(args.widget, data);
      this._updateNumberWidgetLasts[args.widget] = args.value;
    })

    this._updateGraphWidgetLasts = { };
    this._updateGraphWidget = this.homey.flow.getActionCard("update-graph-widget");
    this._updateGraphWidget.registerRunListener((args, state ) => {
      this.log("Updating graph widget " + args.widget + ": Adding value " + args.value + ", keeping  " + args.keeppoints + " points");

      if( !(args.widget in this._updateGraphWidgetLasts)) {
        this._updateGraphWidgetLasts[args.widget] = [];
      }

      let currentTs = new Date();
      let p = { "timestamp": Math.floor(currentTs.getTime()/1000), "value": parseFloat(args.value) };
      this._updateGraphWidgetLasts[args.widget].push(p);
      while(this._updateGraphWidgetLasts[args.widget].length > args.keeppoints) {
        this._updateGraphWidgetLasts[args.widget].shift();
      }

      let data = {};
      data['points'] = [];
      let t = this._updateGraphWidgetLasts[args.widget][0]["timestamp"];
      this._updateGraphWidgetLasts[args.widget].forEach(function(i) {
        let p = {
          "x": i['timestamp'] - t,
          "y": i['value']
        }
        data['points'].push(p);
      })

      this.updateWidget(args.widget, data);
    })
  }

  updateWidget(id, data) {
    this.log("Inbound data object to updateWidget: " + Util.inspect(data));

    let url = this.getSetting("url");
    data.auth_token = this.getSetting("token");
    Axios({
      method: 'POST',
      url: url + "/widgets/" + id,
      data: data
    })
    .then(function (response) {
      // All OK
    })
    .catch(function (error) {
      // Failed
    });
  }

  /**
   * onAdded is called when the user adds the device, called just after pairing.
   */
  async onAdded() {
    this.log('SmashingDevice has been added');
  }

  /**
   * onSettings is called when the user updates the device's settings.
   * @param {object} event the onSettings event data
   * @param {object} event.oldSettings The old settings object
   * @param {object} event.newSettings The new settings object
   * @param {string[]} event.changedKeys An array of keys changed since the previous version
   * @returns {Promise<string|void>} return a custom message that will be displayed
   */
  async onSettings({ oldSettings, newSettings, changedKeys }) {
    this.log('SmashingDevice settings where changed');
  }

  /**
   * onRenamed is called when the user updates the device's name.
   * This method can be used this to synchronise the name to the device.
   * @param {string} name The new name
   */
  async onRenamed(name) {
    this.log('SmashingDevice was renamed');
  }

  /**
   * onDeleted is called when the user deleted the device.
   */
  async onDeleted() {
    this.log('SmashingDevice has been deleted');
  }

}

module.exports = SmashingDevice;
