import CryptoJS from 'crypto-js'

export default class Crypt {
    
    private static SECRET_KEY: string = import.meta.env.VITE_SECRET_KEY

    public static encryptString(text: string): string {
        const encrypted = CryptoJS.AES.encrypt(text, CryptoJS.enc.Utf8.parse(this.SECRET_KEY), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
        })
        return encodeURIComponent(encrypted.toString()) // base64 hasilnya
    }

    public static decryptString(encrypted: string): string {
        const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(encrypted), CryptoJS.enc.Utf8.parse(this.SECRET_KEY), {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7,
        })
        return decrypted.toString(CryptoJS.enc.Utf8)
    }
}
