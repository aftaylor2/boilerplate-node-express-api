import os from 'os';

// Returns an array of objs containing information about each network interface
const networkInterfaces = os.networkInterfaces();

// Returns the first address matching the protocol. Non internal (like
// 192.168.0.1) by default, pass internal = true for the local address.
function getIPAddr(protocol = 'IPv4', internal = false) {
  const match = Object.values(networkInterfaces)
    .flat()
    .find((iface) => protocol === iface.family && iface.internal === internal);

  return match ? match.address : '';
}

export default getIPAddr;
