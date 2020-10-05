const axios = require('axios');
const ip = require("ip");
const eurekaService = `http://localhost:8761/eureka`;

module.exports = {
  registerWithEureka: async (appName, port) => {
    console.log(`Registering ${appName} with Eureka`);

    try {
        const res = await axios.post(
            `${eurekaService}/apps/${appName}`,
        {
            instance: {
              hostName: `localhost`,
              instanceId: `${appName}-${port}`,
              vipAddress: `${appName}`,
              app: `${appName.toUpperCase()}`,
              ipAddr: ip.address(),
              status: `UP`,
              port: {
                $: port,
                "@enabled": true,
              },
              dataCenterInfo: {
                "@class": `com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo`,
                name: `MyOwn`,
              },
            },
        },
        {headers: { 'Content-Type': 'application/json' }}
        );

        console.log(`Registered with Eureka!`);

        setInterval(async () => {
            try {
                const res = await axios.put(`${eurekaService}/apps/${appName}/${appName}-${port}`, {});
                console.log("Successfully sent heartbeat to Eureka.");
            } catch (error) {
                console.log("Sending heartbeat to Eureka failed.");
            } }, 30 * 1000); 
    } catch (error) {
        console.log(`Not registered with eureka due to: ${error}`);
    }
  }
};
