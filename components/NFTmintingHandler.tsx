import React, { useState, useEffect } from 'react';
import ERC721ContractInfo from './contract/ERC721/MyNFT.json';
import ERC721Metdata from './contract/ERC721/testdata.json';
import TextField from '@mui/material/TextField';
import { Alert, Box, Button, MenuItem } from '@mui/material';
import { Connect } from './utils';
import { Contract, ContractFactory } from 'ethers';

let connect: Connect | undefined = undefined
const abi = ERC721ContractInfo.abi;
const bytecode = ERC721ContractInfo.bytecode;

const admin = "0x6bB4353b050CF2D36461ae2dfA9e4a78C098F736"

interface MintProps {
    title: string
}

interface URIItem {
    URIitem: string
}

function ERC721Handler(props: MintProps): JSX.Element {
    let { title, } = props;
    let signer: any

    useEffect(() => {
        connect = new Connect(window.ethereum)
        signer = connect.getSigner();
    }, [])

    const [accountVerification, setAccountVerification] = useState(false)
    const [targetURI, setTargetURI] = useState<string>("Please load collection first")
    const [URIList, setURIList] = useState<URIItem[]>([{
        URIitem: "Please load collection first"
    }])
    const handleSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTargetURI(event.target.value)
    }


    /*
      TODO: Load URI From db and convert to URIItem[]
        if (accountVerification) {
            ...load URIItem list from DB
        }
    */


    /*
    async function deployButtonHandler() {
        const factory = new ContractFactory(abi, bytecode, signer);        
        statusMonitor = document.getElementById("NFTstatus") as HTMLSpanElement;
        sendTokenButton =  document.getElementById("NFTsendTokenButton") as HTMLButtonElement;

        URIInput = document.getElementById("URI") as HTMLInputElement;
        nameInput = document.getElementById("NFTname") as HTMLInputElement;
        symbolInput = document.getElementById("NFTsymbol") as HTMLInputElement;

        toAddressInput = document.getElementById("NFTtoAddress") as HTMLInputElement;

        try {
            const name = nameInput.value;
            const symbol = symbolInput.value;

            contract = await factory.deploy(name, symbol);
            statusMonitor.innerHTML = "Deploying";

            await contract.deployTransaction.wait();
            statusMonitor.innerHTML = "Deployed";

            console.log(`Contract mined! address: ${contract.address} transactionHash: ${contract.deployTransaction}`);
            sendTokenButton.disabled = false;
        } catch(err) {
            console.error(err);
            statusMonitor.innerHTML = `Deploy failed, ${(err as Error).message}`;
        }
    }
    */

    async function mintERC721() {
        try {
            let contract = new Contract("0xc9D2D16d22E06fd11ceEF2FB119d7dBBA0aa7C83", abi, connect?.getSigner());
            //contract.attach("0xc9D2D16d22E06fd11ceEF2FB119d7dBBA0aa7C83")

            //const URI = URIInput.value;
            const URI = "Test URI"
            const toAddress = await signer!.getAddress()

            const mintingResult = await contract.mintNFT(toAddress, URI)
            mintingResult.wait();
            let NFTId: any;

            contract.on("Transfer", (from, to, tokenId) => {
                console.log("From:", from);
                console.log("To:", to);
                console.log("TokenId:", tokenId);
            })
        } catch (err) {
            console.error(err);
            console.log((err as Error).message)
            //statusMonitor.innerHTML = `Minting failed, ${(err as Error).message}`;
        }
    }

    return (
        <Box
            component="form"
            sx={{
                '& .MuiTextField-root': { m: 1, width: '25ch' },
            }}
            noValidate
            autoComplete="off"
        >
            <div>
                {/*
                <button {...htmlButtonProps} onClick={deployButtonHandler}>Deploy(Minting token)</button>
                <div>
                    {Form("Name", "NFTname")}
                    {Form("Symbol", "NFTsymbol")}
                </div><br />
                */}

                {
                    /*
                    TODO: Verify account and Load collection
                    <Button variant="contained" onClick={() => 
                        () => loadCollection()...
                    }>{"Load collection"}
                    </Button>
                    */
                }
                <Button variant="contained" onClick={
                    () => mintERC721()
                }>{title}
                </Button>
                <div>
                    <TextField
                        id="URI"
                        select
                        label="URI"
                        value={targetURI}
                        onChange={handleSelection}
                    >
                        {URIList.map((URI) => (
                            <MenuItem key={URI.URIitem} value={URI.URIitem}>
                                {URI.URIitem}
                            </MenuItem>
                        ))}
                    </TextField>
                </div>
            </div>
        </Box>
    )
}

export { ERC721Handler }