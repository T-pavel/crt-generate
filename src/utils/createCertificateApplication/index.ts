/* eslint-disable @typescript-eslint/no-explicit-any */
import { X509ENROLLMENT_CX509ENROLLMENT } from "../constants";
import type { CryptoproParamsFailure, CryptoproParamsSuccess } from "../types";

type TParams = {
  template: string;
  extendedKeyUsage: string;
  cadesplugin: any;
  distinguishedName: string;
  setCryptoParams: (
    cryptoproParams: CryptoproParamsSuccess | CryptoproParamsFailure
  ) => void;
  onError?: (error: string) => void;
};

export default function createCertificateApplication({
  cadesplugin,
  distinguishedName,
  template,
  extendedKeyUsage,
  setCryptoParams,
  onError,
}: TParams): void {
  cadesplugin?.async_spawn(function* createCert() {
    let cryptoproParams = {};

    try {
      const XCN_AT_KEYEXCHANGE = 1;
      const encodingTypeNum = 0x1;
      const PKey = yield cadesplugin?.CreateObjectAsync(
        "X509Enrollment.CX509PrivateKey"
      );

      yield PKey.propset_ProviderName(
        "Crypto-Pro GOST R 34.10-2012 Cryptographic Service Provider"
      );
      yield PKey.propset_ProviderType(80);
      yield PKey.propset_KeySpec(XCN_AT_KEYEXCHANGE);

      const CertificateRequestPkcs10 = yield cadesplugin?.CreateObjectAsync(
        "X509Enrollment.CX509CertificateRequestPkcs10"
      );

      yield CertificateRequestPkcs10.InitializeFromPrivateKey(0x1, PKey, "");

      const DistinguishedName = yield cadesplugin?.CreateObjectAsync(
        "X509Enrollment.CX500DistinguishedName"
      );

      yield DistinguishedName.Encode(distinguishedName);
      CertificateRequestPkcs10.propset_Subject(DistinguishedName);

      const KeyUsageExtension = yield cadesplugin?.CreateObjectAsync(
        "X509Enrollment.CX509ExtensionKeyUsage"
      );

      const CERT_DATA_ENCIPHERMENT_KEY_USAGE = 0x10;
      const CERT_KEY_ENCIPHERMENT_KEY_USAGE = 0x20;
      const CERT_DIGITAL_SIGNATURE_KEY_USAGE = 0x80;
      // const CERT_NON_REPUDIATION_KEY_USAGE = 0x40;

      yield KeyUsageExtension.InitializeEncode(
        // eslint-disable-next-line no-bitwise
        CERT_KEY_ENCIPHERMENT_KEY_USAGE |
          CERT_DATA_ENCIPHERMENT_KEY_USAGE |
          CERT_DIGITAL_SIGNATURE_KEY_USAGE
      );

      // Создаем расширение Extended Key Usage
      const ExtendedKeyUsageExtension = yield cadesplugin?.CreateObjectAsync(
        "X509Enrollment.CX509ExtensionEnhancedKeyUsage"
      );

      // Инициализируем OID для Extended Key Usage
      if (extendedKeyUsage) {
        const OIDs = yield cadesplugin?.CreateObjectAsync(
          "X509Enrollment.CObjectIds"
        );
        const OID = yield cadesplugin?.CreateObjectAsync(
          "X509Enrollment.CObjectId"
        );
        yield OID.InitializeFromValue(extendedKeyUsage);
        yield OIDs.Add(OID);
        yield ExtendedKeyUsageExtension.InitializeEncode(OIDs);
      }

      const extensions = yield CertificateRequestPkcs10.X509Extensions;

      const TemplateExtension = yield cadesplugin?.CreateObjectAsync(
        "X509Enrollment.CX509ExtensionTemplate"
      );
      const OIDTemplate = yield cadesplugin?.CreateObjectAsync(
        "X509Enrollment.CObjectId"
      );
      yield OIDTemplate.InitializeFromValue(template);

      yield TemplateExtension.InitializeEncode(
        OIDTemplate, // OID шаблона
        1, // Основная версия
        0 // Дополнительная версия
      );

      yield extensions.Add(TemplateExtension);
      yield extensions.Add(KeyUsageExtension);
      yield extensions.Add(ExtendedKeyUsageExtension);

      const Enroll = yield cadesplugin?.CreateObjectAsync(
        X509ENROLLMENT_CX509ENROLLMENT
      );

      yield Enroll.InitializeFromRequest(CertificateRequestPkcs10);

      // Создает запрос на сертификат в формате PKCS#10 с помощью объекта Enroll
      // encodingTypeNum=0x1 указывает на кодировку в формате Base64
      const certificateRequest = yield Enroll.CreateRequest(encodingTypeNum);
      const ContainerName = yield PKey.ContainerName;

      const data = certificateRequest
        .replace("-----BEGIN CERTIFICATE-----", "")
        .replace("-----END CERTIFICATE-----", "")
        .replaceAll("\r\n", "");

      cryptoproParams = {
        uuid: ContainerName,
        data,
        status: "success",
        reason: "CRYPTO_PLUGIN_SUCCESS",
      };
      yield setCryptoParams(cryptoproParams as CryptoproParamsSuccess);
    } catch (error) {
      cryptoproParams = {
        status: "failure",
        reason: "CRYPTO_PLUGIN_FAILURE",
      };
      console.log("error", error);
      yield setCryptoParams(cryptoproParams as CryptoproParamsFailure);
      yield onError?.(error as string);
    }
  });
}
