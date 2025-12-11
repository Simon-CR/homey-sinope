'use strict';

const Homey = require('homey');

class SinopeApp extends Homey.App {
  
  onInit() {
    this.log('SinopeApp is running...');
  }
  
}

module.exports = SinopeApp;
