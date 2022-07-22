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

export {Connect}
export type {ButtonProps, SpanProps}