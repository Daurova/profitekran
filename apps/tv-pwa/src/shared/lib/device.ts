export const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = Math.random().toString(36).substring(2, 8).toUpperCase();
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
};