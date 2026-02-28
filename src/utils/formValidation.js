/**
 * formValidation.js
 *
 * Hata kodu → { field, message } haritası.
 * `field` değeri: 'email' | 'password' | 'fullname' | 'mobile' | 'verifyCode' | '_generic'
 *
 * Kullanım:
 *   import { resolveApiError, AUTH_ERROR_MAP } from '../../utils/formValidation';
 *   const { field, message } = resolveApiError(errCode, fallbackMessage);
 *   setFieldErrors(prev => ({ ...prev, [field]: message }));
 */

export const AUTH_ERROR_MAP = {
    // ─── Kimlik doğrulama ────────────────────────────────────────────────────
    InvalidCredentials: { field: 'password', message: 'E-posta veya şifre hatalı.' },
    UserNotFound: { field: 'email', message: 'Bu e-posta ile kayıtlı bir hesap bulunamadı.' },
    UserIsBlocked: { field: '_generic', message: 'Hesabınız bloke edilmiştir. Destek ekibimizle iletişime geçin.' },
    UserIsArchived: { field: '_generic', message: 'Hesabınız arşivlenmiştir. Giriş yapılamaz.' },
    WrongPassword: { field: 'password', message: 'Şifre hatalı.' },
    // ─── Kayıt ───────────────────────────────────────────────────────────────
    EmailAlreadyExists: { field: 'email', message: 'Bu e-posta adresi zaten kullanılıyor.' },
    MobileAlreadyExists: { field: 'mobile', message: 'Bu telefon numarası zaten kullanılıyor.' },
    InvalidEmail: { field: 'email', message: 'Geçersiz e-posta adresi.' },
    WeakPassword: { field: 'password', message: 'Şifreniz çok zayıf. En az 6 karakter, bir büyük harf ve rakam içermelidir.' },
    errMsg_PasswordDoesntMatch: { field: 'password', message: 'Şifreler eşleşmiyor.' },
    InvalidMobile: { field: 'mobile', message: 'Geçersiz telefon numarası formatı.' },

    // ─── Doğrulama ───────────────────────────────────────────────────────────
    EmailVerificationNeeded: { field: 'email', message: 'E-posta adresinizi doğrulamanız gerekiyor.' },
    MobileVerificationNeeded: { field: 'mobile', message: 'Telefon numaranızı doğrulamanız gerekiyor.' },
    InvalidVerificationCode: { field: 'verifyCode', message: 'Doğrulama kodu hatalı veya süresi dolmuş.' },
    VerificationCodeExpired: { field: 'verifyCode', message: 'Doğrulama kodunun süresi dolmuş. Yeni kod talep edin.' },

    // ─── Genel ───────────────────────────────────────────────────────────────
    _generic: { field: '_generic', message: 'Beklenmedik bir hata oluştu. Lütfen tekrar deneyin.' },
};

/**
 * API'den gelen errCode'u çözümler.
 * Tanımlı değilse _generic döner.
 *
 * @param {string} errCode - API'den gelen hata kodu
 * @param {string} [fallbackMessage] - Tanımlı kod yoksa kullanılacak mesaj
 * @returns {{ field: string, message: string }}
 */
export function resolveApiError(errCode, fallbackMessage) {
    if (errCode && AUTH_ERROR_MAP[errCode]) {
        return AUTH_ERROR_MAP[errCode];
    }
    return {
        field: '_generic',
        message: fallbackMessage || AUTH_ERROR_MAP._generic.message,
    };
}

/**
 * E-posta adresinin formatını doğrular.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
