import React, {useState, useEffect} from 'react';
import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';  

import {Connect} from "./utils"
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

let connect: Connect | undefined = undefined;
let provider: ethers.providers.Web3Provider;

interface ConnectProps {
    isConnected: boolean;
    setIsConnected: React.Dispatch<React.SetStateAction<boolean>>
    account: string| undefined
    setAccount: React.Dispatch<React.SetStateAction<string | undefined>>
}

function ConnectAccount(props: ConnectProps): JSX.Element {
    const {isConnected, setIsConnected, account, setAccount} = props

    useEffect(() => {
        connect = new Connect(window.ethereum);
    }, [])

    const connectMetamask = async () => {
        connect = new Connect(window.ethereum);
        provider = connect.getProvider();
        await provider.send("eth_requestAccounts", []);
        const signer = connect.getSigner();

        setIsConnected(true)
        setAccount(await signer?.getAddress())
    }

    const clickHandler = async () => {
        if (!account) {
            connectMetamask()
            console.log("Account", account);
        }
        //userAccountComponent = document.getElementById("userAccount") as HTMLSpanElement;
        //userAccountComponent.textContent = `User account: ${userAccount}`;
    }

    return (
        isConnected ? (
        <div>
            <Chip label={account?.slice(0,15) + "..."} color="primary" />
        </div>
        ) : (
            <div>
                <Button variant="outlined" size="small" color="inherit" onClick={clickHandler}>{"Connect account"}</Button>
            </div>
        )
    )
}

export {ConnectAccount}