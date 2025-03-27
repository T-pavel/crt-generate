/* eslint-disable @typescript-eslint/no-explicit-any */
import { X509ENROLLMENT_CX509ENROLLMENT } from "../constants";
import { CryptoproParamsSuccess, CryptoproParamsFailure } from "../types";

type TParams = {
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
  setCryptoParams,
  onError,
}: TParams): void {
  cadesplugin?.async_spawn(function* createCert(): Generator<any, void, any> {
    let cryptoproParams: CryptoproParamsSuccess | CryptoproParamsFailure =
      {} as any;

    try {
      const XCN_AT_KEYEXCHANGE = 1;
      const encodingTypeNum = 0x1;
      const PKey = yield cadesplugin.CreateObjectAsync(
        "X509Enrollment.CX509PrivateKey"
      );

      yield PKey.propset_ProviderName(
        "Crypto-Pro GOST R 34.10-2012 Cryptographic Service Provider"
      );
      yield PKey.propset_ProviderType(80);
      yield PKey.propset_KeySpec(XCN_AT_KEYEXCHANGE);

      const CertificateRequestPkcs10 = yield cadesplugin.CreateObjectAsync(
        "X509Enrollment.CX509CertificateRequestPkcs10"
      );

      yield CertificateRequestPkcs10.InitializeFromPrivateKey(0x1, PKey, "");

      const DistinguishedName = yield cadesplugin.CreateObjectAsync(
        "X509Enrollment.CX500DistinguishedName"
      );

      yield DistinguishedName.Encode(distinguishedName);
      CertificateRequestPkcs10.propset_Subject(DistinguishedName);

      const KeyUsageExtension = yield cadesplugin.CreateObjectAsync(
        "X509Enrollment.CX509ExtensionKeyUsage"
      );

      const STREET_EXTENSION = 0x10;

      const CERT_DATA_ENCIPHERMENT_KEY_USAGE = 0x10;
      const CERT_KEY_ENCIPHERMENT_KEY_USAGE = 0x20;
      const CERT_DIGITAL_SIGNATURE_KEY_USAGE = 0x80;
      // Константа для использования сертификата в целях неотказуемости (подтверждения авторства)
      // Значение 0x40 (64 в десятичной системе) указывает на возможность использования
      // сертификата для создания электронных подписей, которые нельзя впоследствии отрицать
      const CERT_NON_REPUDIATION_KEY_USAGE = 0x40;

      yield KeyUsageExtension.InitializeEncode(
        // eslint-disable-next-line no-bitwise
        CERT_KEY_ENCIPHERMENT_KEY_USAGE |
          CERT_DATA_ENCIPHERMENT_KEY_USAGE |
          CERT_DIGITAL_SIGNATURE_KEY_USAGE |
          CERT_NON_REPUDIATION_KEY_USAGE |
          STREET_EXTENSION
      );

      const extensions = yield CertificateRequestPkcs10.X509Extensions;

      yield extensions.Add(KeyUsageExtension);

      const Enroll = yield cadesplugin.CreateObjectAsync(
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
      yield setCryptoParams(cryptoproParams);
    } catch (error) {
      cryptoproParams = {
        status: "failure",
        reason: "CRYPTO_PLUGIN_FAILURE",
      };
      console.log("error", error);
      yield setCryptoParams(cryptoproParams);
      if (error instanceof Error) {
        yield onError?.(error.message);
      } else if (typeof error === "string") {
        yield onError?.(error);
      } else {
        yield onError?.("Неизвестная ошибка");
      }
    }
  });
}
