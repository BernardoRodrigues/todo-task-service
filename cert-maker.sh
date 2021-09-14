
INPUT=$1

openssl req -x509 -out "${INPUT}.crt" -keyout "${INPUT}.key" \
  -newkey rsa:2048 -nodes -sha256 \
  -subj '/CN=localhost' -extensions EXT -config <( \
   printf "[dn]\nCN=localhost\n[req]\ndistinguished_name = dn\n[EXT]\nsubjectAltName=DNS:localhost\nkeyUsage=digitalSignature\nextendedKeyUsage=serverAuth")
mv "${INPUT}.crt" src/cert
mv "${INPUT}.key" src/cert
