/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-escape */
import { useEffect, useState } from "react";
import { getSystemInfo } from "crypto-pro";
import { CryptoproParamsFailure, CryptoproParamsSuccess } from "./types";
import createCertificateApplication from "./createCertificateApplication";
import { Data } from "../App";

export function useCertificateCreation() {
  const [error, setError] = useState<string | null>(null);
  const { cadesplugin } = window as Window &
    typeof globalThis & { cadesplugin: any };

  const [cryptoParams, setCryptoParams] = useState<
    CryptoproParamsSuccess | CryptoproParamsFailure
  >();
  const [isLoadingFunc, setIsLoadingFunc] = useState<boolean>(false);

  const handleSend = (data: Data) => {
    const dnFields = [
      { key: 'CN', value: data.commonName },
      { key: 'G', value: data.organization },
      { key: 'T', value: data.description },
      { key: 'STREET', value: data.surname },
      { key: 'OID.1.2.643.100.3', value: data.snils },
      { key: 'OID.2.5.4.6', value: 'RU' },
      { key: 'OID.2.5.4.8', value: data.st },
      { key: 'O', value: data.o },
      { key: 'OU', value: data.ou },
    ];

    const distinguishedName = dnFields
      .filter(field => field.value.trim() !== '')
      .map(field => `${field.key}=${field.value}`)
      .join(',');

    createCertificateApplication({
      template: data.template,
      extendedKeyUsage: data.extendedKeyUsage,
      cadesplugin,
      distinguishedName,
      setCryptoParams,
      onError: setError,
    });
  };

  useEffect(() => {
    getSystemInfo();
  }, []);

  return {
    handleSend,
    cryptoParams,
    setIsLoadingFunc,
    isLoadingFunc,
    error,
  };
}
