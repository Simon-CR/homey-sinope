# Sinope Zigbee for Homey

This app adds support for Sinope Zigbee devices to Homey.

## Supported Devices

*   **Thermostats:**
    *   TH1123ZB (3000W / 4000W)
    *   TH1124ZB (3000W / 4000W)
    *   TH1123ZB-G2
    *   TH1124ZB-G2

## Features

*   **Thermostat Control:** Set target temperature, view current temperature.
*   **Modes:** Off, Heat.
*   **Power Monitoring:** Real-time power usage (W) and cumulative energy consumption (kWh).
*   **Outdoor Temperature:** Support for displaying outdoor temperature on the thermostat screen (requires Flow configuration).
*   **Display Settings:** Control backlight and time format (via device settings).

## Installation

1.  Install the app on your Homey.
2.  Go to **Devices** -> **+** -> **Sinope**.
3.  Select **Sinope Thermostat**.
4.  Follow the pairing instructions (usually holding the two buttons on the thermostat).

## Development

### Prerequisites

*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [Homey CLI](https://apps.developer.homey.app/the-basics/getting-started/installing-homey-cli)

### Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/Simon-CR/homey-sinope.git
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running Locally

To run the app in development mode on your Homey:

```bash
homey app run
```

### Publishing

To publish to the Homey App Store:

1.  Ensure you have updated the version in `app.json` and `package.json`.
2.  Ensure you have valid images in `drivers/th112xzb/assets/images/`.
3.  Run validation:
    ```bash
    homey app validate
    ```
4.  Publish:
    ```bash
    homey app publish
    ```

## License

MIT
