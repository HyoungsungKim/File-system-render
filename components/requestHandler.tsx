import React, {useState, useEffect} from 'react';
import type { NFTMetaData } from './utils';
import { cclLogo, Connect } from './utils';
import { Contract, } from 'ethers';

import {Alert, Button, Card, CardMedia, TextField} from '@mui/material';
import {Grid, Paper, Stack} from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import ERC4907ContractInfo from './contract/ERC4907/ERC4907.json';

let connect: Connect | undefined = undefined;

interface RequestProps {
    jsonResponse: any;
    setJsonResponse: React.Dispatch<any>;
}

interface MetadataInfoProps {
    jsonResponse: any;
    NFTUser: string;
}

const MetadataInfoHandler = (props: MetadataInfoProps): JSX.Element =>{
    let {jsonResponse, NFTUser} = props;



    return (
        <div>
            {jsonResponse ? 
            (<List>
                <ListItem disablePadding>
                    <TextField id="NFT-owner" label="NFT title" variant="standard" defaultValue={jsonResponse.NFTtitle} disabled/>
                </ListItem>
                <ListItem disablePadding>
                    <TextField id="NFT-owner" label="NFT Owner" variant="standard" defaultValue={jsonResponse.account_id.slice(0,15) + "..."} disabled/>
                </ListItem>
                <ListItem disablePadding>
                    <TextField id="NFT-user" label="NFT User" variant="standard" defaultValue={NFTUser} disabled/>
                </ListItem>
                <ListItem style={{display:'flex', justifyContent:'center'}} >
                    {//copyrights![index] ? cclogo[copyrights![index]]() : cclogo["unlockable content"]()
                        cclLogo[jsonResponse.copyright]()
                    }
                </ListItem>
                <ListItem style={{display:'flex', justifyContent:'center'}} >
                    <Button variant="contained" disabled={jsonResponse.copyright == "unlockable content"}>{"Request rental"}</Button>
                </ListItem>
            </List>
            ) : (
            <div>
                <List>
                    <ListItem disablePadding>
                        <TextField id="NFT-title" label="NFT title" variant="standard" disabled />
                    </ListItem>
                    <ListItem disablePadding>
                        <TextField id="NFT-owner" label="NFT Owner" variant="standard" disabled/>
                    </ListItem>
                    <ListItem disablePadding>
                        <TextField id="NFT-user" label="NFT User" variant="standard" disabled/>
                    </ListItem>
                    <ListItem style={{display:'flex', justifyContent:'center'}} >
                        {//copyrights![index] ? cclogo[copyrights![index]]() : cclogo["unlockable content"]()
                        // cclogo["CC BY"]()
                        }
                    </ListItem>
                    <ListItem style={{display:'flex', justifyContent:'center'}} >
                        <Button variant="contained" size="small" sx={{height: 42 }} > Rental request </Button>
                    </ListItem>
                </List>
                    
            </div>
        )}        
        </div>
    )
}

const NFTInfoHandler = (props: RequestProps): JSX.Element => {
    let {jsonResponse, setJsonResponse} = props;
    let [NFTInfo, setNFTInfo] = useState<NFTMetaData>();
    let [NFTId, setNFTId] = useState<string>("");
    let [NFTuser, setNFTUser] = useState<string>("");

    useEffect(() => {
        connect = new Connect(window.ethereum);
    }, [])


    const textFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNFTId(event.target.value);
    }

    const getNFTInfoHandler = async (connect: Connect | undefined, nftId: string) => {
        let response = await fetch("http://172.30.0.1:8090/request/" + nftId, {
            method: "GET",
        })
        let jsonResponse = await response.json()
        console.log(jsonResponse)
        setJsonResponse(jsonResponse)

        const abi = ERC4907ContractInfo.abi;
        const contract = new Contract("0x0354fab135deE2b7aCc82c36047C1C157cE98B1B", abi, connect?.getProvider());

        console.log(contract)
        console.log(NFTId)
        console.log(await contract.ownerOf(NFTId))

    }

    return (
        <div>
            <Stack spacing={1} direction="row">
                <TextField id="NFT-id" label="NFT ID" variant="standard" onChange={textFieldHandler}/>
                <Button variant="contained" onClick={ () => getNFTInfoHandler(connect, NFTId)}>{"Get"}</Button>
            </Stack>
            <MetadataInfoHandler jsonResponse={jsonResponse} NFTUser={NFTuser}/>
        </div>
    )
}

const RentalHandler = () => {
    return (
        <Alert severity="info">NFT Rental</Alert>
    )
}

const RequestLayout = (): JSX.Element => {
    const [jsonResponse, setJsonResponse] = useState<any>(undefined)
    

    return (
        <Grid container spacing={1}>
            <Grid item xs={12} md={8} lg={9}>
                {/* NFT info */}
                <Paper sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', margin:1}} >
                        <CardMedia
                            component="img"
                            sx={{
                                height: 500,
                                objectFit: "contain",
                                margin: "auto",
                            }}
                            image={
                                jsonResponse ?
                                    "http://172.32.0.1:9010/collection/" + jsonResponse.URI
                                    : "http://172.32.0.1:9010/collection/404Images/lockedContent.png"
                            }
                            alt="random"
                        />
                    </Card>
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
                    <NFTInfoHandler jsonResponse={jsonResponse} setJsonResponse={setJsonResponse}/> 
                </Paper>
            </Grid>

            <Grid item xs={12} md={12} lg={12}>
                {/* NFT rental request */}
                <Paper sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                        widht: '100%',
                    }}
                >                
                </Paper>
            </Grid>
        </Grid>
    )
}

export {RequestLayout}