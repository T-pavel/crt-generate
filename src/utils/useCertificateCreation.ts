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
    const distinguishedName = `CN=${data.commonName},G=${data.organization},T=${data.description},STREET=${data.surname},OID.1.2.643.100.3=${data.snils},OID.2.5.4.6=RU,OID.2.5.4.8=${data.st}`;
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
