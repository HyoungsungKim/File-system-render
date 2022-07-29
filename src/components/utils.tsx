import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum: any;
    }
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    display: string;
}

interface SpanProps extends React.HTMLAttributes<HTMLSpanElement> {
    display: string;   
}

class Connect {
    private provider: ethers.providers.Web3Provider;
    private signer: ethers.providers.JsonRpcSigner;

    constructor(externalProvider: ethers.providers.ExternalProvider) {
        this.provider = new ethers.providers.Web3Provider(externalProvider)
        this.signer = this.provider.getSigner();
    }

    getProvider(): ethers.providers.Web3Provider {
        return this.provider;
    }

    getSigner(): ethers.providers.JsonRpcSigner | undefined {
        return this.signer;
    }
}

// eth_getEncryptionPublicKey will be deprecated 
function encryptAddress(address: string): Promise<string> {
    return window.ethereum.request({
        method: 'eth_getEncryptionPublicKey',
        params: [address]
    })

    /*
    .then((encryptionPublicKey: string) => {
        return encryptionPublicKey
    })
    .catch((error: any) => {
        if (error.code === 4001) {
            console.log("we cannot encrypt anything without the key")
            return "4001";
        } else {
            console.log(error)
            return error
        }
    })
    */
}

export {Connect, encryptAddress}
export type {ButtonProps, SpanProps}