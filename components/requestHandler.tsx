import React, {useState, useEffect} from 'react';
import type { NFTMetaData } from './utils';


import {Alert, Button, Card, CardMedia, TextField} from '@mui/material';
import {Grid, Paper, Stack} from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import LockIcon from '@mui/icons-material/Lock';
import CC_BY from './img/by.svg';
import CC_BY_NC from './img/by-nc.svg';
import CC_BY_ND from './img/by-nd.svg';
import CC_BY_SA from './img/by-sa.svg';
import CC_BY_NC_ND from './img/by-nc-nd.svg';
import CC_BY_NC_SA from './img/by-nc-sa.svg';

interface CCLogo {
    [key: string]: any;
}

let cclogo: CCLogo = {
    "CC BY": () => { return <CC_BY /> },
    "CC BY-NC": () => { return <CC_BY_NC /> },
    "CC BY-ND": () => { return <CC_BY_ND /> },
    "CC BY-SA": () => { return <CC_BY_SA />} ,
    "CC BY-NC-ND": () => { return <CC_BY_NC_ND />},
    "CC BY-NC-SA": () => { return <CC_BY_NC_SA />},
    "unlockable content": () => {
        return <Button startIcon={<LockIcon />} size="small" sx={{width:120, height: 42 }} />
    }
}

interface RequestProps {
    jsonResponse: any;
    setJsonResponse: React.Dispatch<any>;
}

interface MetadataInfoProps {
    jsonResponse: any;
}

const MetadataInfoHandler = (props: MetadataInfoProps): JSX.Element =>{
    let {jsonResponse} = props;
    return (
        <div>
            {jsonResponse ? 
            (<List>
                <ListItem disablePadding>
                    <ListItemText primary={"Title: " + jsonResponse.NFTtitle} />
                </ListItem>
                <ListItem disablePadding>
                    <ListItemText primary={"Owner: " + jsonResponse.account_id.slice(0,15) + "..."} />
                </ListItem>
                <ListItem style={{display:'flex', justifyContent:'center'}} >
                    {//copyrights![index] ? cclogo[copyrights![index]]() : cclogo["unlockable content"]()
                        cclogo[jsonResponse.copyright]()
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
                        <ListItemText primary={"Title:"} />
                    </ListItem>
                    <ListItem disablePadding>
                        <ListItemText primary={"Owner:"} />
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

    const textFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNFTId(event.target.value);
    }

    const getNFTInfoHandler = async (nftId: string) => {
        let response = await fetch("http://172.30.0.1:8090/request/" + nftId, {
            method: "GET",
        })
        let jsonResponse = await response.json()
        console.log(jsonResponse)
        setJsonResponse(jsonResponse)
    }

    return (
        <div>
            <Stack spacing={1} direction="row">
                <TextField id="NFT-id" label="NFT ID" variant="standard" onChange={textFieldHandler}/>
                <Button variant="contained" onClick={ () => getNFTInfoHandler(NFTId)}>{"Get"}</Button>
            </Stack>
            <MetadataInfoHandler jsonResponse={jsonResponse}/>
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