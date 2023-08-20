const urlSafeBase64Encode = (data: string) => {
  const b64Str = base64Encode(data);
  return b64Str.replace(`+`, `-`).replace(`/`, `_`).replace(`=`, ``);
};

const urlSafeBase64Decode = (data: string) => {
  let str = data
    .replace(`-`, `+`)
    .replace(`_`, `/`)
    /* eslint-disable-next-line no-control-regex */
    .replace(/\t-\x0d/, ``);

  const mod4 = str.length % 4;
  if (mod4) {
    const padding = `====`.substr(0, mod4);
    str = `${str}${padding}`;
  }

  return Buffer.from(str, `base64`).toString(`binary`);
};

const base64Encode = (data: string) => {
  return Buffer.from(data, `utf8`).toString(`base64`);
};

const base64Decode = (data: string) => {
  return Buffer.from(data, `base64`).toString(`utf8`);
};

export { urlSafeBase64Encode, urlSafeBase64Decode, base64Encode, base64Decode };
