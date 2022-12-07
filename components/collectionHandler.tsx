import React, {useState, useEffect} from 'react';
import { cclLogo, Connect } from './utils';

import { Alert, Button } from '@mui/material';
import { Card, CardActions, CardContent, CardMedia, Container} from '@mui/material';
import { Divider, Stack, Typography } from '@mui/material';
import {Grid} from '@mui/material';

import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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

        console.log("file/collection/" + srcURIs[0])
        return (
            <Container sx={{ py: 8 }} maxWidth="md">
            {/* End hero unit */}
            <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                    <Typography>Own</Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
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
                                        image={"file/collection/" + srcURIs[card]} //"https://source.unsplash.com/random"
                                        alt="random"
                                    />
                                    <Divider />
                                    <CardContent sx={{ flex: '1 0 auto' }}>
                                        <Typography gutterBottom variant="h6" component="div" align="center">
                                            {NFTtitles![index]}
                                        </Typography>
                                        
                                        <Typography> {
                                            // This is a media card. You can use this section to describe the content.
                                        }
                                        </Typography>
                                    </CardContent>
                                    <Divider />
                                    <CardActions>      
                                        <Stack direction="row" alignItems="center" gap={0.5}>
                                            {//copyrights![index] ? cclogo[copyrights![index]]() : cclogo["unlockable content"]()
                                                cclLogo[copyrights![index]]()
                                            }
                                            <Button variant="contained" startIcon={<DownloadIcon />} size="small" sx={{height: 42, fontSize:12}} onClick={async () => {
                                                let response = await fetch("file/download/" + srcURIs[card].split('.')[0] + ".zip", {
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
                </AccordionDetails>
            </Accordion>

            <Accordion>
                    <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                    >
                    <Typography>Rental</Typography>
                </AccordionSummary>
                <Divider />
                <AccordionDetails>
                    
                </AccordionDetails>
            </Accordion>
            </Container>
        )
    }
}

function ViewFiles(props: ViewProps): JSX.Element {
    let {title,}: ViewProps = props;

    let jsonResponse: any
    const [fileURIs, setFileURIs]  = useState<string[]>()
    const [NFTtitles, setNFTtitles] = useState<string[]>()
    const [copyrights, setCopyrights] = useState<string[]>()
    const [UCIs, setUCIs] = useState<string[]>()
    const [isSigValid, setIsSigValid] = useState(false)

    useEffect(() => {
        connect = new Connect(window.ethereum);
    }, [])

    const viewHandler = async (connect: Connect) => {
        const signer = connect.getSigner();
        let address = await signer!.getAddress();

        let response = await fetch("DB/collection/" + address, {
            method: "GET",
        })
        jsonResponse = await response.json()
        console.log(jsonResponse)
        console.log(jsonResponse.signature)
        console.log(address)        

        let validSignature = await signer!.signMessage(address)
        if (validSignature === jsonResponse.signature) {
            let fileURIs = jsonResponse.URIs
            let NFTtitles = jsonResponse.NFTtitles
            let copyrights = jsonResponse.copyrights
            let UCIs = jsonResponse.UCIs

            console.log(jsonResponse)
            console.log(NFTtitles)
            console.log(copyrights)

            setIsSigValid(true)
            setFileURIs(fileURIs)
            setNFTtitles(NFTtitles)
            setCopyrights(copyrights)
            setUCIs(UCIs)
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
                    <Alert severity="info">{"Click OPEN COLLECTION Button"}</Alert>
                )
            }
        </div>
    )   
}

export {ViewFiles}