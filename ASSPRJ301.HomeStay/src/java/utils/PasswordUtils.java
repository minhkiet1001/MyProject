package utils;

import org.mindrot.jbcrypt.BCrypt;

public class PasswordUtils {

    // Mã hóa mật khẩu
    public static String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.isEmpty()) {
            return null;
        }
        return BCrypt.hashpw(plainPassword, BCrypt.gensalt(12)); 
    }

    // Kiểm tra mật khẩu
    public static boolean checkPassword(String plainPassword, String hashedPassword) {
        if (plainPassword == null || hashedPassword == null) {
            return false;
        }
        try {
            return BCrypt.checkpw(plainPassword, hashedPassword);
        } catch (Exception e) {
            return false; // Nếu có lỗi (hashedPassword không đúng định dạng), trả về false
        }
    }
}
