(async () => {
    let forge = require("node-forge")
    let os = require("os")
    let devc = require("./.dev.json")
    let dhparam = require("dhparam")
    let fs = require("fs")
    let path = require("path")
    let edited = false
    let test = {validity: {notAfter: new Date(new Date().getTime() - 30000)}}
    let cert, keys
    try {
        // test = forge.pki.certificateFromPem(devc.cert_string)
    } catch {}
    if (test.validity.notAfter.getTime() < new Date().getTime()) {
        console.log("Creating Cert")
        keys = forge.pki.rsa.generateKeyPair({ bits: 4096 })
        devc.privkey_string = forge.pki.privateKeyToPem(keys.privateKey)
        edited = true
        // console.log("privkey", forge.pki.privateKeyToPem(keys.privateKey))
        // console.log("pubkey", forge.pki.publicKeyToPem(keys.publicKey))
        // console.log("Done generating keys, now creating cert")
        cert = forge.pki.createCertificate()
        cert.publicKey = keys.publicKey
        let attrs = [
            {
                name: "commonName",
                value: "localhost"
            }, {
                name: "organizationName",
                value: "localhost"
            }
        ]
        cert.validity.notBefore = new Date()
        cert.validity.notAfter = new Date()
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1)
        cert.setSubject(attrs)
        cert.setIssuer(attrs)
        // cert.setExtensions([
        //     {
        //         name: "subjectAltName",
        //         altNames: [
        //             // {
        //             //     type: 2,
        //             //     value: "localhost"
        //             // },
        //             {
        //                 type: 2,
        //                 value: os.hostname()
        //             },
        //             {
        //                 type: 7,
        //                 value: "127.0.0.1"
        //             },
        //             {
        //                 type: 7,
        //                 value: "::1"
        //             }
        //         ]
        //     },
        // //     // {
        // //     //     name: "keyUsage",
        // //     //     keyCertSign: true,
        // //     //     nonRepudiation: true,
        // //     //     digitalSignature: true,
        // //     //     keyEncipherment: true,
        // //     //     dataEncipherment: true
        // //     // },
        // //     // {
        // //     //     name: "extKeyUsage",
        // //     //     serverAuth: true,
        // //     //     clientAuth: true,
        // //     //     timeStamping: true
        // //     // }
        // ])
        cert.sign(keys.privateKey, forge.md.sha512.create())
        cert.privateKey = keys.privateKey
        // forge
        devc.cert_string = forge.pki.certificateToPem(cert)
    }
    if (!devc.dhparam_string || devc.dhparam_string.length < 15) {
        edited = true
        devc.dhparam_string = dhparam(4096)
    }
    if (edited) {
        fs.writeFileSync(path.resolve(".dev.json"), JSON.stringify(devc, null, 4), { encoding: 'utf-8' })
    }
    console.log(cert?.verify(cert), cert?.publicKey == keys?.publicKey, cert?.privateKey == keys?.privateKey, cert?.siginfo, cert?.signature)
})()

