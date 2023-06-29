'use strict';

const Homey = require('homey');

class SmashingApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('SmashingApp has been initialized');
  }

}

module.exports = SmashingApp;
