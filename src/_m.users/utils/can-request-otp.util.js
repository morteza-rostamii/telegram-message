const otpRequestsByIp = new Map();
const otpRequestsByEmail = new Map();

function canRequestOtp(ip, email) {
  const now = Date.now();

  const ipLastRequest = otpRequestsByIp.get(ip) || 0;
  const emailLastRequest = otpRequestsByEmail.get(email) || 0;

  // check if the user has made more than one request in the last minute
  if (now - ipLastRequest < 60 * 1000 || now - emailLastRequest < 60 * 1000) {
    return false;
  }

  otpRequestsByIp.set(ip, now);
  otpRequestsByEmail.set(email, now);
  return true;
}

export default canRequestOtp;
