import * as React from 'react';
import { ethers } from 'ethers';
import { parseUnits } from 'ethers/lib/utils';  

import {Connect} from "./utils"
import type {ButtonProps, SpanProps} from "./utils"
import Button from '@mui/material/Button';

let connect: Connect | undefined = undefined;
let provider: ethers.providers.Web3Provider;

function ConnectAccount(props: ButtonProps): JSX.Element {
    let {display, onClick, ...htmlButtonProps}: ButtonProps = props;

    let userAccountComponent: HTMLSpanElement;
    let userAccount: String;

    const clickHandler = async () => {
        connect = new Connect(window.ethereum);
        provider = connect.getProvider();
        await provider.send("eth_requestAccounts", []);
        const signer = connect.getSigner();

        if (signer != undefined) {
            userAccount = await signer.getAddress();

        } else {
            userAccount = "Cannot connect to Metamask. Please check Metamask"
        }

        userAccountComponent = document.getElementById("userAccount") as HTMLSpanElement;
        userAccountComponent.textContent = `User account: ${userAccount}`;
        console.log("Account", userAccount);
    }

    return (
        <div>
            <Button variant="contained" onClick={clickHandler}>{display}</Button>
            <span id="userAccount">{`User account: `}</span>
        </div>
    )
}

export {ConnectAccount}