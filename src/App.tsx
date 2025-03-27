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
  console.log("cryptoParams", cryptoParams);
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
          <label>Фамилия</label>
          <input
            type="text"
            value={formData.surname}
            onChange={(e) => handleChange("surname", e.target.value)}
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
      <button onClick={handleSubmit}>Создать сертификат</button>
    </>
  );
}

export default App;
