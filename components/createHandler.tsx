import React, { useEffect, useState } from 'react';
import { Contract, ContractFactory } from 'ethers';

import { Connect } from './utils';
import type { Attribution, NFTMetaData} from './utils';

import { Alert, Button, Card, CardActions, CardContent, CardMedia, Divider } from '@mui/material';
import {TextField, Typography, MenuItem, Switch, FormControlLabel} from '@mui/material';
import {Radio, RadioGroup, FormControl, FormLabel} from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

//import ERC721ContractInfo from './contract/ERC721/MyNFT.json';
import ERC4907ContractInfo from './contract/ERC4907/ERC4907.json';


let connect: Connect | undefined = undefined;

interface FileProps {
    setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}

 // post metadata to DB
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

// Post Metadada json file to storage
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
    //const abi = ERC721ContractInfo.abi;
    const abi = ERC4907ContractInfo.abi;
    
    //const bytecode = ERC721ContractInfo.bytecode;
    const byteconde = ERC4907ContractInfo.bytecode;
    
    const signer = connect!.getSigner();
    // ERC4907 contract "0x0354fab135deE2b7aCc82c36047C1C157cE98B1B"
    const contract = new Contract("0x0354fab135deE2b7aCc82c36047C1C157cE98B1B", abi, signer);
    //ERC721 contract
    //const contract = new Contract("0xc9D2D16d22E06fd11ceEF2FB119d7dBBA0aa7C83", abi, signer);
    
    const metaDataURI = selectedFile!.name + ".metadata.json"
    const unlockableMetDataURI = selectedFile!.name + ".unlockable"+ ".metadata.json"

    //contract.attach("0xc9D2D16d22E06fd11ceEF2FB119d7dBBA0aa7C83")
    //contract.on("transfer", (from, to, tokenid) => {...})
    //const URI = URIInput.value;
    const ownerAddress = await signer!.getAddress();
    const signature = await signer!.signMessage(ownerAddress);

    const mintingResult = await contract.mintNFT(ownerAddress, metaDataURI);
    const receipt = await mintingResult.wait();
    
    //https://ethereum.stackexchange.com/questions/57803/solidity-event-logs
    let hexTokenId = receipt.logs[0].topics[3]
    let tokenId_dec = parseInt(hexTokenId, 16).toString()
    console.log(tokenId_dec);

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

    const textFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }

    const radioButtonHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCopyright(event.target.value)
    }

    // Select file and change states
    function changeHandler(event: React.ChangeEvent<HTMLInputElement>) {
        let file = event.target.files;
        if (file) {
            setSelectedFile(file[0]);
            setIsSelected(true);

            setFile(file[0]);
            setTargetURI(event.target.value);
            console.log(URL.createObjectURL(file[0]));
        }
    }

    const submissionHandler = async (connect: Connect | undefined) => {
        try {
            const signer = connect!.getSigner()
            let address = await signer!.getAddress()

            
            let nftMetaData: NFTMetaData = {
                title: title ? title : "undefined",
                image: address + "/" + selectedFile!.name,
                unlockableContent: unlockableContent,
                NFTId: undefined,
                attribution: unlockableContent ? undefined : {
                    copyright: copyright,
                }
            }

            console.log("Call mint ERC721")
            if (isSelected) {
                await mintERC721(connect, selectedFile!, unlockableContent, nftMetaData, copyright);                      
            }
         

        } catch (err) {
            console.error(err);
            console.log((err as Error).message)
            //statusMonitor.innerHTML = `Minting failed, ${(err as Error).message}`;
        }
    }

    if (connect !== undefined) {
        return (
            <div>
                <Stack spacing={1} direction="row" sx={{ my: 1}}>
                    <Button variant="contained" component="label" > Select file
                        <input type="file" name="file" hidden onChange={changeHandler} />
                    </Button>

                    <Button variant="contained" type="submit" onClick={
                        () => submissionHandler(connect)
                    }>{"Create"}
                    </Button>
                </Stack> 
                <Divider variant="middle" />
                {isSelected ? (
                    <div>
                        <TextField id="FileName" label="File name" variant="standard" defaultValue={selectedFile!.name} disabled/>
                        <TextField id="FileType" label="File type" variant="standard" defaultValue={selectedFile!.type} disabled/>
                        <TextField id="FileSize" label="File size (bytes)" variant="standard" defaultValue={selectedFile!.size} disabled/>
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
                    <Alert severity="info">Select a file</Alert>
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