export const generateToken = (username: string, password: string) => {
  const credentials = username + ':' + password;
  const b = Buffer.from(credentials); // encoding
  const encryptedkey = b.toString('base64');
  return encryptedkey;
};
