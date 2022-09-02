import React, { useEffect, useState } from 'react';
import { Contract, ContractFactory } from 'ethers';

import { Connect } from './utils';
import { Alert, Button, Card, CardActions, CardContent, CardMedia } from '@mui/material';
import {TextField, Typography, MenuItem, Switch, FormControlLabel} from '@mui/material';
import {Radio, RadioGroup, FormControl, FormLabel} from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

import ERC721ContractInfo from './contract/ERC721/MyNFT.json';


let connect: Connect | undefined = undefined;

interface FileProps {
    setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}

const mintERC721 = async (connect: Connect | undefined) => {
    const abi = ERC721ContractInfo.abi;
    const bytecode = ERC721ContractInfo.bytecode;
    const signer = connect!.getSigner();

    const contract = new Contract("0xc9D2D16d22E06fd11ceEF2FB119d7dBBA0aa7C83", abi, signer);
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
}

const UploadAndMint = (props: FileProps): JSX.Element => {
    let { setFile }: FileProps = props;

    useEffect(() => {
        connect = new Connect(window.ethereum);
    }, [])

    const [isSelected, setIsSelected] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File>();

    const [unlockableContent, isUnlockableContent] = useState(false)
    const [targetURI, setTargetURI] = useState<string>("Please load collection first")

    // Select file and change states
    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        let file = event.target.files
        if (file) {
            setSelectedFile(file[0])
            setIsSelected(true)

            setFile(file[0])
            setTargetURI(event.target.value)
            console.log(URL.createObjectURL(file[0]))
        }
    };

    const uploadHandler = async (connect: Connect | undefined) => {
        const formData = new FormData()
        const signer = connect!.getSigner()
        console.log("Signer: ")
        console.log(signer)

        let address = await signer!.getAddress()
        let signature = await signer!.signMessage(address)

        console.log(signature)

        if (isSelected) {
            formData.append('file', selectedFile!)
            console.log(formData)

            let response = await fetch("http://172.32.0.1:9010/upload/" + address, {
                method: "POST",
                body: formData,
            })
            console.log(response)

            // TODO: Implement write data to DB with file hash
            let POSTbody = JSON.stringify({
                account_id: address,
                file_name: selectedFile!.name,
                signature: signature,
                type: selectedFile!.type,
                URI: address + "/" + selectedFile!.name,
                size: selectedFile!.size,
            })

            let responseFromDB = await fetch("http://172.30.0.1:8090/upload/submit", {
                method: "POST",
                body: POSTbody,
            })
            console.log(POSTbody)
            console.log(responseFromDB)
            console.log("Upload is successful!")
        }
    }

    const submissionHandler = async (connect: Connect | undefined) => {
        try {
            console.log(unlockableContent)
            //await uploadHandler(connect)
            //await mintERC721(connect)
        } catch (err) {
            console.error(err);
            console.log((err as Error).message)
            //statusMonitor.innerHTML = `Minting failed, ${(err as Error).message}`;
        }
    }

    if (connect !== undefined) {
        return (
            <div>
                <Stack spacing={1} direction="row">
                    <Button variant="contained" component="label" > Select file
                        <input type="file" name="file" hidden onChange={changeHandler} />
                    </Button>

                    <Button variant="contained" type="submit" onClick={
                        () => submissionHandler(connect)
                    }>{"Create"}
                    </Button>
                </Stack>
                {isSelected ? (
                    <div>
                        <p>Filename: {selectedFile!.name}</p>
                        <p>FIletype: {selectedFile!.type}</p>
                        <p>Size in bytes: {selectedFile!.size}</p>

                        <div>
                            <FormControlLabel control={<Switch onChange= {() => { isUnlockableContent(!unlockableContent)} } />} label="Unlockable content" />
                        </div>

                        <div>
                            <FormControl>
                                <FormLabel id="demo-radio-buttons-group-label">Common Creative License</FormLabel>
                                <RadioGroup
                                    aria-labelledby="demo-radio-buttons-group-label"
                                    defaultValue="CC BY"
                                    name="radio-buttons-group"
                                >
                                    <FormControlLabel value="CC BY" disabled={unlockableContent} control={<Radio />} label="CC BY" />
                                    <FormControlLabel value="CC BY-NC" disabled={unlockableContent} control={<Radio />} label="CC BY-NC" />
                                    <FormControlLabel value="CC BY-ND" disabled={unlockableContent} control={<Radio />} label="CC BY-ND" />
                                    <FormControlLabel value="CC BY-SA" disabled={unlockableContent} control={<Radio />} label="CC BY-SA" />
                                    <FormControlLabel value="CC BY-NC-SA" disabled={unlockableContent} control={<Radio />} label="CC BY-NC-SA" />
                                    <FormControlLabel value="CC BY-NC-ND" disabled={unlockableContent} control={<Radio />} label="CC BY-NC-ND" />
                                </RadioGroup>
                            </FormControl>
                        </div>
                    </div>
                ) : (
                    <p>Select a file to upload</p>
                )}
            </div>
        )
    }
    return <Alert severity="error">Please connect wallet first.</Alert>
}


const UploadAndMintLayout = (): JSX.Element => {
    const [file, setFile] = useState<File | undefined>(undefined)
    return (
        <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12} md={8} lg={9}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 500,
                    }}
                >
                    {file ? (
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', margin: "auto",}} >
                            <CardMedia
                                component="img"
                                sx={{
                                    margin: "auto",
                                }}
                                image={URL.createObjectURL(file)}
                                alt="random"
                            />
                        </Card>
                        
                    ) : (
                        "Select a file to upload"
                    )}
                </Paper>
            </Grid>
            {/* Recent Deposits */}
            <Grid item xs={12} md={4} lg={3}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 500,
                    }}
                >
                    <UploadAndMint setFile={setFile} />
                </Paper>
            </Grid>
        </Grid>
    )
}

export {UploadAndMintLayout}