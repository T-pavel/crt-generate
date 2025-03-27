export type CryptoproParamsSuccess = {
  uuid: string;
  data: string;
  status: "success";
  reason: "CRYPTO_PLUGIN_SUCCESS";
  countryName?: string;
  stateOrProvinceName?: string;
  organizationName?: string;
  commonName?: string;
  localityName?: string;
  organizationalUnitName?: string;
  snils?: string;
  extendedKeyUsage?: string;
  surname?: string;
  organization?: string;
  description?: string;
};

export type CryptoproParamsFailure = {
  status: "failure";
  reason: "CRYPTO_PLUGIN_FAILURE";
};

export type ResultOfInstallingCertificate = {
  status: string;
  reason: string;
  type: "accept" | "refuse" | "root";
};

type AttributeSet = {
  [K: string]: string;
};

export type Certificate = {
  serialNumber: string;
  Issuer: AttributeSet;
  SubjectName: AttributeSet;
  ValidFromDate: string;
  ValidToDate: string;
  Algorithm: string;
};

export type Container = {
  containerName: string;
  uniqueContainerName: string;
};

export type CreateBufferMethods = {
  clear: () => CreateBufferMethods;
  nBytes: () => number;
  length: () => number;
  toString: () => string;
  toHexString: () => string;
  toArray: () => number[];
  toBase64String: () => string;
  byteCodeAt: (i: number) => number;
  crc: () => number;
  charCodeAt: (i: number) => string;
  addArray: (value: number[]) => CreateBufferMethods;
  addByte: (value: number) => CreateBufferMethods;
  addWord: (value: number) => CreateBufferMethods;
  addInt: (value: number) => CreateBufferMethods;
  addString: (value: string) => CreateBufferMethods;
  pack: (value: string | null) => CreateBufferMethods;
  merge: (buff: CreateBufferMethods) => CreateBufferMethods;
  decodeFromBase64: (value: string) => CreateBufferMethods;
  decodeFromHex: (value: string) => CreateBufferMethods;
  encodeToBase64AndPack: (value: string) => CreateBufferMethods;
  inverse: () => CreateBufferMethods;
  unpack: () => string;
};
