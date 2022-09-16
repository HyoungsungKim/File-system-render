import React, { useEffect, useState } from 'react';
import { Contract, ContractFactory } from 'ethers';

import { Connect } from './utils';
import type { Attribution, NFTMetaData} from './utils';

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

const mintERC721 = async (connect: Connect | undefined, uri: string): Promise<Contract> => {
    const abi = ERC721ContractInfo.abi;
    const bytecode = ERC721ContractInfo.bytecode;
    const signer = connect!.getSigner();

    const contract = new Contract("0xc9D2D16d22E06fd11ceEF2FB119d7dBBA0aa7C83", abi, signer);
    //contract.attach("0xc9D2D16d22E06fd11ceEF2FB119d7dBBA0aa7C83")

    //const URI = URIInput.value;
    const URI = uri
    const toAddress = await signer!.getAddress()

    const mintingResult = await contract.mintNFT(toAddress, URI)
    mintingResult.wait().then(() => {
        contract.on("Transfer", async (from, to, tokenId) => {
            console.log("From:", from);
            console.log("To:", to);
            console.log("TokenId:", tokenId._hex);
            console.log("TokenId type:", typeof tokenId._hex);
            let owner = await contract.ownerOf(tokenId._hex)
            console.log(owner)
        })
    })
    

    return contract
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
    const [title, setTitle] = useState<string | undefined>(undefined) 
    const [copyright, setCopyright] = useState<string>("CC BY") 
    const [tokenId, setTokenId] = useState<string>()

    const textFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }

    const radioButtonHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCopyright(event.target.value)
    }

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
                NFTtitle: title,
                Copyright: copyright,
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

    const postMetadata = async (address: string, URI: string, metadata: NFTMetaData) => {
        const formData = new FormData()
        let metaDataBlob = new Blob([JSON.stringify(metadata, null, 2)], {type: 'application/json'})
        let metaDataFile = new File([metaDataBlob], URI)
        
        formData.append('file', metaDataFile)

        let response = await fetch("http://172.32.0.1:9010/upload/" + address, {
            method: "POST",
            body: formData,
        })
    }

    const submissionHandler = async (connect: Connect | undefined) => {
        try {
            const signer = connect!.getSigner()
            let address = await signer!.getAddress()
            const metaDataURI = selectedFile!.name + ".metadata.json"
            const unlockableMetDataURI = selectedFile!.name + ".unlockable"+ ".metadata.json"
            
            let nftMetaData: NFTMetaData
            await uploadHandler(connect)
            let contract = await mintERC721(connect, metaDataURI)                        

            nftMetaData = {
                name: title ? title : "undefined",
                image: address + "/" + selectedFile!.name,
                unlockableContent: unlockableContent,
                attribution: unlockableContent ? undefined : {
                    copyright: copyright,
                }
            }

            if (unlockableContent) {
                console.log("Upload metadata file of unlockable content")
                
                let unlockableMetaData = {
                    name: nftMetaData.name,
                    image: nftMetaData.image,
                    unlockableContent: nftMetaData.unlockableContent,
                    attribution: nftMetaData.attribution,
                }
                nftMetaData.image = "temp"

                console.log("Generate unlockable content metadata...")
                postMetadata(address, unlockableMetDataURI, unlockableMetaData)
            }

            console.log("Upload metadata file")
            postMetadata(address, metaDataURI, nftMetaData)

            console.log(nftMetaData)
            console.log(JSON.stringify(nftMetaData))
            console.log(selectedFile)



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
                            <FormControlLabel control={<Switch onChange= {() => { 
                                isUnlockableContent(!unlockableContent)
                                setCopyright("unlockable content")
                            }} />} label="Unlockable content" />
                        </div>

                        <div>
                            <FormControl>
                                <FormLabel id="demo-radio-buttons-group-label">Common Creative License</FormLabel>
                                <RadioGroup
                                    aria-labelledby="demo-radio-buttons-group-label"
                                    defaultValue="CC BY"
                                    name="radio-buttons-group"
                                    onChange={radioButtonHandler}
                                >
                                    <FormControlLabel value="CC BY" disabled={unlockableContent} control={<Radio />} label="CC BY" />
                                    <FormControlLabel value="CC BY-NC" disabled={unlockableContent} control={<Radio />} label="CC BY-NC" />
                                    <FormControlLabel value="CC BY-ND" disabled={unlockableContent} control={<Radio />} label="CC BY-ND" />
                                    <FormControlLabel value="CC BY-SA" disabled={unlockableContent} control={<Radio />} label="CC BY-SA" />
                                    <FormControlLabel value="CC BY-NC-ND" disabled={unlockableContent} control={<Radio />} label="CC BY-NC-ND" />
                                    <FormControlLabel value="CC BY-NC-SA" disabled={unlockableContent} control={<Radio />} label="CC BY-NC-SA" />
                                </RadioGroup>
                            </FormControl>
                        </div>

                        <div>
                            <TextField id="NFT-title" label="Title" variant="standard" onChange={textFieldHandler} />
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


const CreateLayout = (): JSX.Element => {
    const [file, setFile] = useState<File | undefined>(undefined)

    return (
        <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12} md={8} lg={9}>
                <Paper sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    {file ? (
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', margin:1}} >
                            <CardMedia
                                component="img"
                                sx={{
                                    height: 500,
                                    objectFit: "contain",
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
            <Grid item xs={12} md={4} lg={3}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 600,
                    }}
                >
                    <UploadAndMint setFile={setFile} />
                </Paper>
            </Grid>
        </Grid>
    )
}

export {CreateLayout}