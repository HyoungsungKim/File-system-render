import * as React from 'react';
import { ethers } from 'ethers';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import Link from 'next/link';

declare global {
    interface Window {
        ethereum: any;
    }
}

interface ListItemLinkProps {
    icon?: React.ReactElement;
    primary: string;
    to: string;
}

interface Attribution {
    copyright: string;
}

interface NFTMetaData {
    name: string;
    image: string; // It denotes URI
    unlockableContent: boolean;
    attribution: Attribution | undefined;
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


function ListItemLink(props: ListItemLinkProps) {
    const { icon, primary, to } = props;

    return (
        <li>
            <Link href={to} >
                <ListItem button >
                    {icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
                    <ListItemText primary={primary} />
                </ListItem>
            </Link>
        </li>
    );
}

export { Connect, ListItemLink, encryptAddress }
export type { Attribution, NFTMetaData }