# SSL Reflector

# IPNS Reflector

The reflectors address is an IPNS path without the `/ipns/` prefix

Resolved object must contain **either** `./reflector.json` or `./reflector/metadata.json`.
If both exist an error is thrown.

## Metadata contents

This contains information about how the SSL Reflector endpoint has to be used

### Example

```json
{
  "certificate": {
    "type": "PEM/DER",
    "location": "./certificate.pem"
  },
  "privateKey": {
    "type": "PEM/DER",
    "location": "./privkey.pem"
  },
  "dns": {
    "replace": {
      ".": "-",
      ":": "-"
    },
    "pattern": {
      "ip4": "v4${ADDRESS}.ip.libp2p-nodetrust.tk",
      "ip6": "v6{ADDRESS}.ip.libp2p-nodetrust.tk"
    }
  },
  "discovery": {
    "id": "Qm...",
    "addr": [
      "/ip4/127.0.0.1/tcp/0"
    ]
  }
}
```

### Docs

 - `certificate`: Type & location of the certificate. NOTE: Certificate must be wildcard AND must match both patterns
   - `type`: Type. Can be `PEM` or `DER`
   - `location`: Location. Can be a relative or non-relative IPLD path. Relative paths get resolved against location of metadata.
 - `privateKey`: Type & location of the private key
   - `type`: Type. Can be `PEM` or `DER`
   - `location`: Location. Can be a relative or non-relative IPLD path. Relative paths get resolved against location of metadata.
 - `dns`: DNS Domain generation settings
   - `replace`: Key-value list of characters to replace
   - `pattern`: IPv4 & IPv6 pattern of the address. `${ADDRESS}` is going to be replaced by the ip address
 - `discovery`: Libp2p Discovery endpoint. Can be disabled by setting this value to false
   - `id`: Libp2p node id
   - `addr`: Multiaddr array

# Discovery

Discovery works by connecting to a libp2p node and running `/reflector/announce/1.0.0` and `/reflector/discovery/1.0.0`
