import React, {useState} from 'react';
import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';  

import {Connect} from "./utils"
import type {ButtonProps, SpanProps} from "./utils"
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';

let connect: Connect | undefined = undefined;
let provider: ethers.providers.Web3Provider;

function ConnectAccount(props: ButtonProps): JSX.Element {
    let {title, }: ButtonProps = props;
    let userAccountComponent: HTMLSpanElement;

    const [isConnected, setIsConnected] = useState(false)
    const [userAccount, setUsetAccount] = useState<string>()

    const connectMetamask = async () => {
        connect = new Connect(window.ethereum);
        provider = connect.getProvider();
        await provider.send("eth_requestAccounts", []);
        const signer = connect.getSigner();

        setIsConnected(true)
        setUsetAccount(await signer?.getAddress())
    }

    const clickHandler = async () => {
        connectMetamask()
        
        //userAccountComponent = document.getElementById("userAccount") as HTMLSpanElement;
        //userAccountComponent.textContent = `User account: ${userAccount}`;
        console.log("Account", userAccount);
    }

    return (
        isConnected ? (
        <div>
            <Chip label={userAccount?.slice(0,15) + "..."} color="primary" />
        </div>
        ) : (
            <div>
                <Button variant="outlined" size="small" color="inherit" onClick={clickHandler}>{"Connect account"}</Button>
            </div>
        )
    )
}

export {ConnectAccount}