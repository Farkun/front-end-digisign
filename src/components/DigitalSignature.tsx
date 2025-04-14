import { useRef, useState } from "react";
import { SignatureComponent } from "@syncfusion/ej2-react-inputs";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import styles from "./DigitalSignature.module.css"; // Import CSS Module
import axios from "axios";
import Cookies from "universal-cookie";

const DigitalSignature = ({isSignatureExist}: any) => {
  const signatureRef = useRef<SignatureComponent>(null);
  const [drawed, setDrawed] = useState<any>(null)

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const storeSignature = async (bytes: string) => {
    try {
      const cookies: Cookies = new Cookies()
      const token: string = cookies.get('accessToken')
      const {data} = await axios.post(import.meta.env.VITE_API_HOST + '/api/signature/store-sign-base64', {
        bytes: bytes
      }, {
        headers: {
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${token}`
        }
      })
      setDrawed(data);
      
      if (data && data.payload) alert('Tanda tangan berhasil disimpan')
    } catch (err: any) {
      console.error(err.message)
    }
  }

  const saveSignature = () => {
    const dataUrl = signatureRef.current?.getSignature();
    if (dataUrl) {
      if (isSignatureExist) {
        if (confirm('Apakah Anda ingin mengganti gambar tanda tangan saat ini?')) storeSignature(dataUrl)
      }
      else storeSignature(dataUrl)
    }
  }
  

  return (
    <div className={styles.container}>
      {/* {drawed && drawed} */}
      <SignatureComponent ref={signatureRef} className={styles.signatureBox} />
      <div className={styles.buttonGroup}>
        <ButtonComponent cssClass={`${styles.deleteButton} e-danger`} onClick={clearSignature}>
          Hapus
        </ButtonComponent>
        <ButtonComponent cssClass={`${styles.saveButton} e-success`} onClick={saveSignature}>
          Simpan
        </ButtonComponent>
      </div>
    </div>
  );
};

export default DigitalSignature;
