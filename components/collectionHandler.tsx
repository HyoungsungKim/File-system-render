import React, {useState, useEffect} from 'react';
import { cclLogo, Connect } from './utils';

import { Alert, Button } from '@mui/material';
import { Card, CardActions, CardContent, CardMedia, Container} from '@mui/material';
import { Icon, IconButton, Stack, Typography } from '@mui/material';
import {Grid} from '@mui/material';

import DownloadIcon from '@mui/icons-material/Download';


interface ViewProps {
    title: string;
}

let connect: Connect


function displaySrc(
        srcURIs: string[] | undefined,
        NFTtitles: string[] | undefined,
        copyrights: string[] | undefined
    ): JSX.Element {
    console.log(srcURIs)
    console.log(NFTtitles)
    console.log(copyrights)
    if (srcURIs == undefined) {
        return (
            <Alert severity="info">{"There is no file to show"}</Alert>
        )
    } else {
        let cards : number[] = []
        for (let i = 0; i < srcURIs.length; i++) {
            cards.push(i)
        }

        console.log("http://172.32.0.1:9010/collection/" + srcURIs[0])
        return (
            <Container sx={{ py: 8 }} maxWidth="md">
            {/* End hero unit */}
            <Grid container spacing={4}>
                {cards.map((card, index) => (
                    <Grid item key={card} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} >
                            <CardMedia
                                component="img"
                                sx={{
                                    objectFit: "contain",
                                    margin: "auto",
                                }}
                                image={"http://172.32.0.1:9010/collection/" + srcURIs[card]} //"https://source.unsplash.com/random"
                                alt="random"
                            />
                           <CardContent sx={{ flexGrow: 1 }}>
                                <Typography gutterBottom variant="h5" component="h2">
                                    {NFTtitles![index]}
                                </Typography>
                                <Typography>
                                    This is a media card. You can use this section to describe the
                                    content.
                                </Typography>
                            </CardContent>
                            <CardActions>      
                                <Stack direction="row" alignItems="center" gap={0.5}>
                                    {//copyrights![index] ? cclogo[copyrights![index]]() : cclogo["unlockable content"]()
                                        cclLogo[copyrights![index]]()
                                    }
                                    <Button variant="contained" startIcon={<DownloadIcon />} size="small" sx={{height: 42 }} onClick={async () => {
                                        let response = await fetch("http://172.32.0.1:9010/download/" + srcURIs[card], {
                                            method: "GET",
                                        })
                                        if (response.status === 200) {
                                            let a = document.createElement("a");
                                            a.href = response.url
                                            a.setAttribute("download", srcURIs[card].split('/')[1])
                                            a.click()
                                        }
                                    }}> Download </Button>
                                </Stack>                          
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            </Container>
        )
    }
}

function ViewFiles(props: ViewProps): JSX.Element {
    let {title,}: ViewProps = props;

    let jsonResponse: any
    let [fileURIs, setFileURIs]  = useState<string[]>()
    let [NFTtitles, setNFTtitles] = useState<string[]>()
    let [copyrights, setCopyrights] = useState<string[]>()
    let [isSigValid, setIsSigValid] = useState(false)

    useEffect(() => {
        connect = new Connect(window.ethereum);
    }, [])

    const viewHandler = async (connect: Connect) => {
        const signer = connect.getSigner();
        let address = await signer!.getAddress();

        let response = await fetch("http://172.30.0.1:8090/collection/" + address, {
            method: "GET",
        })
        jsonResponse = await response.json()
        console.log(jsonResponse)
        console.log(jsonResponse.signature)
        console.log(address)        

        let validSignature = await signer!.signMessage(address)
        if (validSignature === jsonResponse.signature) {
            fileURIs = jsonResponse.URIs
            NFTtitles = jsonResponse.NFTtitles
            copyrights = jsonResponse.copyrights
            console.log(jsonResponse)
            console.log(NFTtitles)
            console.log(copyrights)

            setIsSigValid(true)
            setFileURIs(fileURIs)
            setNFTtitles(NFTtitles)
            setCopyrights(copyrights)
        }
    }

    return (
        <div>
            <Button variant="contained" onClick={
                () => viewHandler(connect)
            }>{title}
            </Button>
            { isSigValid ? (
                <div>
                    {displaySrc(fileURIs, NFTtitles, copyrights)}
                </div>
                ) : (
                    <Alert severity="info">{"Click VIEW FILE Button"}</Alert>
                )
            }
        </div>
    )   
}

export {ViewFiles}