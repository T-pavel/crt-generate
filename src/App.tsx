/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

import "./App.css";
import { getSystemInfo } from "crypto-pro";
import { useCertificateCreation } from "./utils/useCertificateCreation";

// Enum для типов СКП
export enum SkpType {
  KK = "KK",
  KO = "KO",
  CLIENT_FL = "CLIENT_FL",
  CLIENT_UL = "CLIENT_UL",
  CLIENT_UL_DIRECT = "CLIENT_UL_DIRECT",
  TLS = "TLS",
}

// Маппинг для отображения человекочитаемых значений
const skpTypeLabels: Record<SkpType, string> = {
  [SkpType.KK]: "КК",
  [SkpType.KO]: "КО",
  [SkpType.CLIENT_FL]: "Клиент ФЛ/ФЛ-СЗ",
  [SkpType.CLIENT_UL]: "Клиент ЮЛ",
  [SkpType.CLIENT_UL_DIRECT]: "Клиент ЮЛ с прямым доступом",
  [SkpType.TLS]: "TLS",
};

// Подсказки для полей ввода
const fieldHints = {
  snils: "Заполняется для TLS",
  extendedKeyUsage: "OID расширенного использования ключа",
  description: "Только для КО/КК: Серия ‹серия ключа›",
  template: "Указывается OID шаблона УЦ для данного СКП",
  st: "Код региона из справочника БИК",
  o: "Идентификатор Субъекта ПлЦР",
  skpType: "Тип СКП",
};

// Подсказки для поля surname в зависимости от типа СКП
const surnameHints: Record<SkpType | "", string> = {
  [SkpType.KK]: "Наименование и место нахождения юридического лица - ФП",
  [SkpType.KO]: "Наименование и место нахождения юридического лица - ФП",
  [SkpType.CLIENT_FL]: "Фамилия, имя и отчество (если имеется)",
  [SkpType.CLIENT_UL]: "Наименование и место нахождения юридического лица",
  [SkpType.CLIENT_UL_DIRECT]: "Наименование и место нахождения юридического лица",
  [SkpType.TLS]: "Не заполняется",
  "": "Выберите тип СКП",
};

// Подсказки для поля commonName в зависимости от типа СКП
const commonNameHints: Record<SkpType | "", string> = {
  [SkpType.KO]: "PROCESSING<NNN>, где NNN - условный номер ключа, начиная с 001",
  [SkpType.KK]: "CONTROL<NNN>, где NNN - условный номер ключа, начиная с 001",
  [SkpType.CLIENT_FL]: "ID ФП - соответствующий идентификатор ФП, Участника ПлЦР",
  [SkpType.CLIENT_UL]: "ID ФП - соответствующий идентификатор ФП, Участника ПлЦР",
  [SkpType.CLIENT_UL_DIRECT]: "ID ФП - соответствующий идентификатор ФП, Участника ПлЦР",
  [SkpType.TLS]: "ID ФП - соответствующий идентификатор ФП, Участника ПлЦР",
  "": "Выберите тип СКП",
};

// Подсказки для поля organization в зависимости от типа СКП
const organizationHints: Record<SkpType | "", string> = {
  [SkpType.KO]: "КО ФП <XXX>, где XXX - название кредитной организации",
  [SkpType.KK]: "КК ФП <XXX>, где XXX - название кредитной организации",
  [SkpType.CLIENT_FL]: "Пользователь ПлЦР, обслуживающийся у ФП <ID ФП>, где ID ФП - соответствующий идентификатор ФП",
  [SkpType.CLIENT_UL]: "Пользователь ПлЦР, обслуживающийся у ФП <ID ФП>, где ID ФП - соответствующий идентификатор ФП",
  [SkpType.CLIENT_UL_DIRECT]: "Пользователь ПлЦР, обслуживающийся у ФП <ID ФП>, где ID ФП - соответствующий идентификатор ФП",
  [SkpType.TLS]: "Не заполняется",
  "": "Выберите тип СКП",
};

const signExtendedKeyUsage = {
  [SkpType.KO]: '.2.2',
  [SkpType.KK]: '.2.1',
  [SkpType.CLIENT_FL]: '.3.1',
  [SkpType.CLIENT_UL]: ".3.2",
  [SkpType.CLIENT_UL_DIRECT]: ".3.3",
  [SkpType.TLS]: "",
  "": "",
}

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
  skpType: SkpType | "";
  o: string;
}

function App() {
  const { handleSend, cryptoParams } = useCertificateCreation();

  const [formData, setFormData] = useState<Data>({
    commonName: "",
    snils: "",
    extendedKeyUsage: "1.3.6.1.4.1.10244.7.50.3.1",
    surname: "",
    organization: "",
    description: "",
    template: "1.3.6.1.4.1.311.21.7",
    st: "",
    skpType: SkpType.CLIENT_FL,
    o: "",
  });

  useEffect(() => {
    getSystemInfo();
  }, []);

  // Метод для обновления полей формы
  const handleChange = (field: keyof Data, value: string) => {
    if (field === "skpType") {
      if (value === SkpType.TLS) {
        setFormData((prev) => ({
          ...prev,
          extendedKeyUsage: `1.3.6.1.5.5.7.3.2`,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          extendedKeyUsage: `1.3.6.1.4.1.10244.7.50${signExtendedKeyUsage[value]}`,
        }));
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    handleSend(formData);
  };

  const handleDownload = () => {
    if (cryptoParams?.status === "success" && cryptoParams.data) {
      const blob = new Blob(
        [
          `-----BEGIN CERTIFICATE REQUEST-----\n${cryptoParams.data}-----END CERTIFICATE REQUEST-----`,
        ],
        { type: "application/pkcs10" }
      );
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "certificate_request.csr";
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
        <div className="form-fields">
          <div className="form-group required">
            <div className="field-hint">{fieldHints.skpType}</div>
            <div className="input-section">
              <label>Тип СКП</label>
              <select
                value={formData.skpType}
                onChange={(e) => handleChange("skpType", e.target.value as SkpType)}
              >
                <option value="">Выберите тип СКП</option>
                {Object.entries(skpTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group required">
            <div className="field-hint">{commonNameHints[formData.skpType]}</div>
            <div className="input-section">
              <label>Имя (CN)</label>
              <input
                type="text"
                value={formData.commonName}
                onChange={(e) => handleChange("commonName", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="field-hint">{fieldHints.snils}</div>
            <div className="input-section">
              <label>СНИЛС (SNILS)</label>
              <input
                type="text"
                value={formData.snils}
                onChange={(e) => handleChange("snils", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group required">
            <div className="field-hint">{fieldHints.extendedKeyUsage}</div>
            <div className="input-section">
              <label>X509v3 Расширенная область применения</label>
              <input
                type="text"
                value={formData.extendedKeyUsage}
                onChange={(e) => handleChange("extendedKeyUsage", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group required">
            <div className="field-hint">{fieldHints.template}</div>
            <div className="input-section">
              <label>OID шаблона УЦ</label>
              <input
                type="text"
                value={formData.template}
                onChange={(e) => handleChange("template", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="field-hint">{surnameHints[formData.skpType]}</div>
            <div className="input-section">
              <label>Фамилия</label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => handleChange("surname", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="field-hint">{fieldHints.st}</div>
            <div className="input-section">
              <label>Регион</label>
              <input
                type="text"
                value={formData.st}
                onChange={(e) => handleChange("st", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="field-hint">{organizationHints[formData.skpType]}</div>
            <div className="input-section">
              <label>Организация</label>
              <input
                type="text"
                value={formData.organization}
                onChange={(e) => handleChange("organization", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="field-hint">{fieldHints.o}</div>
            <div className="input-section">
              <label>Организация(O)</label>
              <input
                type="text"
                value={formData.o}
                onChange={(e) => handleChange("o", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <div className="field-hint">{fieldHints.description}</div>
            <div className="input-section">
              <label>Описание(T)</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="primary" onClick={handleSubmit}>
              Создать заявку на сертификат
            </button>
            {cryptoParams?.status === "success" && (
              <button onClick={handleDownload} className="download-button">
                Скачать заявку на сертификат
              </button>
            )}
          </div>
        </div>
      </div>
      {cryptoParams?.status === "success" && (
        <div className="success-message">{cryptoParams.data}</div>
      )}
      {cryptoParams?.status === "failure" && (
        <div className="error-message">{cryptoParams.reason}</div>
      )}
    </>
  );
}

export default App;
