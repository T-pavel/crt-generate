/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

import "./App.css";
import { getSystemInfo } from "crypto-pro";
import { useCertificateCreation } from "./utils/useCertificateCreation";

// Интерфейс для типизации формы
export interface Data {
  commonName: string;
  snils: string;
  extendedKeyUsage: string;
  surname: string;
  organization: string;
  description: string;
  template: string; 
  st: string;
}

function App() {
  const { handleSend, cryptoParams } = useCertificateCreation();

  // Локальный state для хранения данных формы
  const [formData, setFormData] = useState<Data>({
    commonName: "",
    snils: "",
    extendedKeyUsage: "",
    surname: "",
    organization: "",
    description: "",
    template: "",
    st: "",
  });

  useEffect(() => {
    getSystemInfo();
  }, []);

  // Метод для обновления полей формы
  const handleChange = (field: keyof Data, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    // Передаем собранные данные в handleSend или другую функцию обработки
    console.log("Отправка данных:", formData);
    handleSend(formData);
  };

  const handleDownload = () => {
    if (cryptoParams?.status === "success" && cryptoParams.data) {
      const blob = new Blob([`-----BEGIN CERTIFICATE REQUEST-----\n${cryptoParams.data}-----END CERTIFICATE REQUEST-----`], { type: 'application/pkcs10' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'certificate_request.csr';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  };

  return (
    <>
      <div className="certificate-form">
        <h2>Форма сертификата</h2>
        <div className="form-group">
          <label>Имя (CN)</label>
          <input
            type="text"
            value={formData.commonName}
            onChange={(e) => handleChange("commonName", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>СНИЛС (SNILS)</label>
          <input
            type="text"
            value={formData.snils}
            onChange={(e) => handleChange("snils", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>X509v3 Расширенная область применения</label>
          <input
            type="text"
            value={formData.extendedKeyUsage}
            onChange={(e) => handleChange("extendedKeyUsage", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>OID шаблона УЦ</label>
          <input
            type="text"
            value={formData.template}
            onChange={(e) => handleChange("template", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Фамилия</label>
          <input
            type="text"
            value={formData.surname}
            onChange={(e) => handleChange("surname", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Регион</label>
          <input
            type="text"
            value={formData.st}
            onChange={(e) => handleChange("st", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Организация(G)</label>
          <input
            type="text"
            value={formData.organization}
            onChange={(e) => handleChange("organization", e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Описание(T)</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
          />
        </div>
      </div>
      <button onClick={handleSubmit}>Создать заявку на сертификат</button>
      {cryptoParams?.status === "success" && (
        <button onClick={handleDownload} style={{ marginTop: '10px' }}>
          Скачать заявку на сертификат
        </button>
      )}
      <span>{cryptoParams?.status === "success" && cryptoParams.data}</span>
      <span>{cryptoParams?.status === "failure" && cryptoParams.reason}</span>
    </>
  );
}

export default App;
