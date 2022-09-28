import * as React from 'react';
import { ethers } from 'ethers';
import { Button, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import Link from 'next/link';

import LockIcon from '@mui/icons-material/Lock';
import CC_BY from './img/by.svg';
import CC_BY_NC from './img/by-nc.svg';
import CC_BY_ND from './img/by-nd.svg';
import CC_BY_SA from './img/by-sa.svg';
import CC_BY_NC_ND from './img/by-nc-nd.svg';
import CC_BY_NC_SA from './img/by-nc-sa.svg';

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
    title: string;
    image: string; // It denotes URI
    NFTId: string | undefined;
    unlockableContent: boolean;
    attribution: Attribution | undefined;
}

interface CCLLogo {
    [key: string]: any;
}

let cclLogo: CCLLogo = {
    "CC BY": () => { return <CC_BY /> },
    "CC BY-NC": () => { return <CC_BY_NC /> },
    "CC BY-ND": () => { return <CC_BY_ND /> },
    "CC BY-SA": () => { return <CC_BY_SA />} ,
    "CC BY-NC-ND": () => { return <CC_BY_NC_ND />},
    "CC BY-NC-SA": () => { return <CC_BY_NC_SA />},
    "unlockable content": () => {
        return <Button startIcon={<LockIcon />} size="small" sx={{width:120, height: 42 }} />
    }
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

// All variables should be milliseconds
async function testExpirationTime(since:number, expired:number, monitorTime:number) {
    const delay = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }


    console.log("Retnal start in ", new Date(since))
    console.log("Rental expired in ", new Date(expired))
    while(true) {
        let currentTime = new Date().getTime()
        console.log("Current time: ", new Date(currentTime));

        if (currentTime >= expired) {
            console.log("Since: ", new Date(since), "Current time: ", new Date(currentTime), " Expired time: ", new Date(expired))
            break;
        }
        console.log(`sleep ${monitorTime/1000} sec`)
        await delay(monitorTime)
    }
}

export { cclLogo, Connect, ListItemLink, encryptAddress, testExpirationTime }
export type { CCLLogo, Attribution, NFTMetaData }