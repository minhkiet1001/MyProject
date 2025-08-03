/**
 * Tiện ích cho Agora Video Call
 */
import { RtcTokenBuilder, RtcRole } from 'agora-access-token';

// App ID dự phòng nếu không có App ID được cung cấp từ backend
// Thử với một App ID khác - App ID mới
export const FALLBACK_APP_ID = "2b5c9ab95c154e20b6d32ed11dd83137";
export const FALLBACK_CERTIFICATE = "1b48fb6cc9844832bdbe98a9c1bf2c0a";

/**
 * Kiểm tra tính hợp lệ của App ID
 * @param {string} appId - App ID cần kiểm tra
 * @returns {boolean} - true nếu App ID hợp lệ
 */
export const isValidAppId = (appId) => {
  // App ID Agora thường có độ dài cụ thể và không chứa khoảng trắng
  return typeof appId === 'string' && 
         appId.trim().length > 10 && 
         !appId.includes(' ');
};

/**
 * Lấy App ID hợp lệ từ các nguồn khác nhau
 * @param {string} backendAppId - App ID từ backend
 * @returns {string} - App ID hợp lệ
 */
export const getEffectiveAppId = (backendAppId) => {
  // Kiểm tra nếu App ID từ backend hợp lệ thì sử dụng nó
  if (isValidAppId(backendAppId)) {
    console.log("Using App ID from backend:", backendAppId);
    return backendAppId;
  }
  
  // Nếu không hợp lệ, sử dụng App ID dự phòng
  console.log("Backend App ID invalid, using fallback App ID:", FALLBACK_APP_ID);
  return FALLBACK_APP_ID;
};

/**
 * Kiểm tra tính hợp lệ của token
 * @param {string} token - Token cần kiểm tra
 * @returns {boolean} - true nếu token hợp lệ
 */
export const isValidToken = (token) => {
  return typeof token === 'string' && 
         token.trim().length > 0;
};

/**
 * Tạo token đơn giản cho Agora (chỉ để thử nghiệm)
 * @param {string} channelName - Tên kênh
 * @param {number} uid - ID người dùng
 * @returns {string} - Token đơn giản
 */
export const generateSimpleToken = (channelName, uid) => {
  const timestamp = Math.floor(Date.now() / 1000);
  const expiration = timestamp + 3600; // 1 giờ
  
  // Tạo token đơn giản với định dạng: SIMPLE_{random}_{appId}:{channelName}:{uid}:{role}:{expiration}
  const random = Math.random().toString(36).substring(2, 15);
  return `SIMPLE_${random}_${FALLBACK_APP_ID}:${channelName}:${uid}:PUBLISHER:${expiration}`;
};

/**
 * Tạo token Agora thực tế sử dụng thư viện agora-access-token
 * @param {string} appId - App ID
 * @param {string} appCertificate - App Certificate
 * @param {string} channelName - Tên kênh
 * @param {string|number} uid - ID người dùng
 * @param {number} role - Vai trò (mặc định là publisher)
 * @param {number} expirationTimeInSeconds - Thời gian hết hạn tính bằng giây (mặc định 3600 giây = 1 giờ)
 * @returns {string} - Token Agora
 */
export const generateRtcToken = (
  appId,
  appCertificate,
  channelName,
  uid,
  role = RtcRole.PUBLISHER,
  expirationTimeInSeconds = 3600
) => {
  if (!isValidAppId(appId) || !appCertificate) {
    console.error("Invalid App ID or Certificate");
    // Sử dụng fallback nếu không hợp lệ
    appId = FALLBACK_APP_ID;
    appCertificate = FALLBACK_CERTIFICATE;
  }

  // Thời gian hiện tại tính bằng giây
  const currentTimestamp = Math.floor(Date.now() / 1000);
  // Thời gian hết hạn
  const expirationTimestamp = currentTimestamp + expirationTimeInSeconds;

  // Tạo token
  let token;
  if (typeof uid === 'string') {
    // Sử dụng account để tạo token nếu uid là string
    token = RtcTokenBuilder.buildTokenWithAccount(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      expirationTimestamp
    );
  } else {
    // Sử dụng uid để tạo token nếu uid là number
    token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      expirationTimestamp
    );
  }

  return token;
};

export default {
  isValidAppId,
  getEffectiveAppId,
  isValidToken,
  FALLBACK_APP_ID,
  FALLBACK_CERTIFICATE,
  generateSimpleToken,
  generateRtcToken
};
 