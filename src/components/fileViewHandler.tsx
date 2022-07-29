import React, {useState} from 'react';
import { Connect } from './utils';

import { Alert, Button } from '@mui/material';
import type {ButtonProps, SpanProps} from './utils';

let connect: Connect


function displaySrc(srcURIs: string[] | undefined): JSX.Element {
    console.log(srcURIs)
    if (srcURIs == undefined) {
        return (
            <Alert severity="info">{"There is no file to show"}</Alert>
        )
    } else {
        console.log("http://172.32.0.1:9010/view/" + srcURIs[0])
        return (
            <img src={"http://172.32.0.1:9010/view/" + srcURIs[0]}></img>
        )
    }
}

function ViewFiles(props: ButtonProps): JSX.Element {
    let {display, onClick, ...htmlButtonProps}: ButtonProps = props;

    let jsonResponse: any
    let [fileURIs, setFileURIs]  = useState<string[]>()
    let [isSigValid, setIsSigValid] = useState(false)

    connect = new Connect(window.ethereum);

    const viewHandler = async (connect: Connect) => {
        const signer = connect.getSigner();
        let address = await signer!.getAddress();

        let response = await fetch("http://172.30.0.1:8090/view/" + address, {
            method: "GET",
        })
        jsonResponse = await response.json()
        console.log(jsonResponse)
        console.log(jsonResponse.signature)
        console.log(address)        

        let validSignature = await signer!.signMessage(address)
        if (validSignature === jsonResponse.signature) {
            fileURIs = jsonResponse.URI
            setIsSigValid(true)
            setFileURIs(fileURIs)

            console.log(fileURIs![0])
            console.log(isSigValid)
        }
    }

    return (
        <div>
            <Button variant="contained" onClick={
                () => viewHandler(connect)
            }>{display}
            </Button>
            { isSigValid ? (
                <div>
                    {displaySrc(fileURIs)}
                </div>
                ) : (
                    <Alert severity="info">{"Click VIEW FILE Button"}</Alert>
                )
            }
        </div>
    )   
}

export {ViewFiles}