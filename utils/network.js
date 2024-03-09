import os from 'os';

// Returns an array of objs containing information about each network interface
const networkInterfaces = os.networkInterfaces();

function getIPAddr(protocol = 'IPv4', internal = false) {
 return Object.keys(networkInterfaces).flatMap((interFace) => {
   return networkInterfaces[interFace].map((iface) => {
      // IPv4 (afamily === 'IPv4') non internal (like 127.0.0.1) addresses
      if (protocol === iface.family && !iface.internal && !internal) {
       return iface.address;
      }

      if (protocol === iface.family && iface.internal && internal) {
        // Return local / internal address if requested
        return iface.address;
       }


    });
  }).filter((ip)=> ip && ip !== '').join('')
}

export default getIPAddr;
