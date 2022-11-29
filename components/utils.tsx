import React, {useState, useEffect} from 'react';
import { Contract, ethers } from 'ethers';
import {Alert, AlertColor, Box, Button, Card, CardMedia, TextField} from '@mui/material';
import { ListItem, ListItemIcon, ListItemText } from '@mui/material';
import {LinearProgress } from '@mui/material';

import {Grid, Paper, Stack} from '@mui/material';

import Link from 'next/link';

import LockIcon from '@mui/icons-material/Lock';
import CC_BY from './img/by.svg';
import CC_BY_NC from './img/by-nc.svg';
import CC_BY_ND from './img/by-nd.svg';
import CC_BY_SA from './img/by-sa.svg';
import CC_BY_NC_ND from './img/by-nc-nd.svg';
import CC_BY_NC_SA from './img/by-nc-sa.svg';

import ERC4907ContractInfo from './contract/ERC4907/ERC4907.json';

// Deployed in Goerli
const CONTRACT_ADDRESS = "0xA05D10F3A145c38928BB298b49502886ab8f601f"


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


interface NFTInfoCustomProps {
    jsonResponse: any;
    NFTOwner: string;
    NFTUser: string;
    requestorId?: string;
}

let cclLogo: CCLLogo = {
    "CC BY": () => { return <CC_BY /> },
    "CC BY-NC": () => { return <CC_BY_NC /> },
    "CC BY-ND": () => { return <CC_BY_ND /> },
    "CC BY-SA": () => { return <CC_BY_SA />} ,
    "CC BY-NC-ND": () => { return <CC_BY_NC_ND />},
    "CC BY-NC-SA": () => { return <CC_BY_NC_SA />},
    "unlockable content": () => {
        return <Button startIcon={<LockIcon />} size="small" sx={{width:120, height: 42 }} disabled />
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

function splitTimestamp(timestamps: string[], latestTimestamp: string): [string[], string[]] {
    let past: string[] = []
    let future: string[] = []

    timestamps.forEach((timestamp) => {
        timestamp < latestTimestamp ? past.push(timestamp) : future.push(timestamp)
    })
    console.log("latestTimestamp: ", latestTimestamp)
    console.log("past:", past)
    console.log("future:", future)

    return [past, future]
}

// All variables should be milliseconds
async function testExpirationTime(since:number, expired:number, monitorTime:number) {
    const delay = (ms: number) => {
        return new Promise(resolve => setTimeout(resolve, ms))
    }


    console.log("Rental start in ", new Date(since))
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

async function uploadHandler(
    selectedFile:File,
    ownerAddress: string,
    title: string,
    signature: string,
    copyright: string,
    tokenId: string
) {
const formData = new FormData();

formData.append('file', selectedFile!);
console.log(formData);

let response = await fetch("http://172.32.0.1:9010/upload/" + ownerAddress, {
    method: "POST",
    body: formData,
});

// TODO: Implement write data to DB with file hash
let POSTbody = JSON.stringify({
    account_id: ownerAddress,
    file_name: selectedFile!.name,
    signature: signature,
    type: selectedFile!.type,
    URI: ownerAddress + "/" + selectedFile!.name,
    NFTtitle: title,
    NFT_id: tokenId,
    Copyright: copyright,
});

let responseFromDB = await fetch("http://172.30.0.1:8090/upload/submit", {
    method: "POST",
    body: POSTbody,
});
}

// Post Metadata json file to storage
async function postMetadata(address: string, URI: string, metadata: NFTMetaData) {
const formData = new FormData();
let metaDataBlob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
let metaDataFile = new File([metaDataBlob], URI);

formData.append('file', metaDataFile);

let response = await fetch("http://172.32.0.1:9010/upload/" + address, {
    method: "POST",
    body: formData,
});
}


async function mintERC721(
    connect: Connect | undefined,
    selectedFile: File,
    unlockableContent: boolean,
    nftMetaData: NFTMetaData,
    copyright: string
): Promise<Contract> {
    const abi = ERC4907ContractInfo.abi;
    const bytecode = ERC4907ContractInfo.bytecode;
    
    const signer = connect!.getSigner();
    const contract = new Contract(CONTRACT_ADDRESS, abi, signer);
    
    const metaDataURI = selectedFile!.name + ".metadata.json"
    const unlockableMetDataURI = selectedFile!.name + ".unlockable"+ ".metadata.json"

    const ownerAddress = await signer!.getAddress();
    const signature = await signer!.signMessage(ownerAddress);

    const mintingResult = await contract.mintNFT(ownerAddress, metaDataURI);
    const receipt = await mintingResult.wait();
    
    console.log(receipt)
    //https://ethereum.stackexchange.com/questions/57803/solidity-event-logs
    let hexTokenId = receipt.logs[0].topics[3]
    let tokenId_dec = parseInt(hexTokenId, 16).toString()    

    await uploadHandler(selectedFile, ownerAddress, nftMetaData.title, signature, copyright, tokenId_dec);
    if (unlockableContent) {
        console.log("Upload metadata file of unlockable content");

        let unlockableMetaData: NFTMetaData = {
            title: nftMetaData.title,
            image: nftMetaData.image,
            NFTId: tokenId_dec,
            unlockableContent: nftMetaData.unlockableContent,
            attribution: nftMetaData.attribution,
        };
        nftMetaData.image = "temp";

        console.log("Generate unlockable content metadata...");
        await postMetadata(ownerAddress, unlockableMetDataURI, unlockableMetaData);
    }

    nftMetaData.NFTId = tokenId_dec;
    console.log("Upload metadata file");
    await postMetadata(ownerAddress, metaDataURI, nftMetaData);

    console.log(nftMetaData);
    console.log(JSON.stringify(nftMetaData));
    console.log(selectedFile);

    return contract;
}   

export { cclLogo, Connect, ListItemLink, mintERC721, encryptAddress, splitTimestamp, testExpirationTime, }
export type { CCLLogo, Attribution, NFTMetaData }