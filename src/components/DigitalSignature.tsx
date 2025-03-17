import { useRef } from "react";
import { SignatureComponent } from "@syncfusion/ej2-react-inputs";
import { ButtonComponent } from "@syncfusion/ej2-react-buttons";
import styles from "./DigitalSignature.module.css"; // Import CSS Module

const DigitalSignature = () => {
  const signatureRef = useRef<SignatureComponent>(null);

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const saveSignature = () => {
    const dataUrl = signatureRef.current?.getSignature();
    console.log("Tanda tangan disimpan:", dataUrl);
  };

  return (
    <div className={styles.container}>
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
