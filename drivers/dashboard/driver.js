'use strict';

const { Driver } = require('homey');
const Axios = require("axios");

class DashboardDriver extends Driver {

  /**
   * onInit is called when the driver is initialized.
   */
  async onInit() {
    this.log('Dashboard has been initialized');
  }

  async onPair(session) {
    let url = "";
    let authtoken = "";
    let driver = this;
    let device = {};

    session.setHandler("login", async (data) => {
      url = data.username;
      authtoken = data.password;

      let axiosInstance = Axios.create({
        baseURL: url
      });

      this.log("Trying to connect with auth token: " + authtoken);
      let authOk = false;
      await Axios({
        method: 'POST',
        url: url + "/dashboards/io.olae.smashing",
        data: {
          "auth_token": authtoken
        }
      })
      .then(function (response) {
        driver.log("Successfully communicated with dashboard server");
        authOk = true;
      })
      .catch(function (error) {
        driver.log("Communication with dashboard server failed");
        authOk = false;
      });

      return authOk;
    });

    session.setHandler("readyToCreate", async () => {
      driver.log("Device pairing view is shown");

      device.name = "Smashing";
      device.data = {};
      device.data.id = Date.now();
      device.settings = {};
      device.settings.url = url;
      device.settings.token = authtoken;
      session.emit("createDevice", device);
    });
  }
}

module.exports = DashboardDriver;
