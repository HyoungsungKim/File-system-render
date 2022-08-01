import React, {useState} from 'react';
import { Connect } from './utils';

import { Alert, Button } from '@mui/material';
import { Card, CardActions, CardContent, CardMedia} from '@mui/material';
import { Container } from '@mui/material';
import { Typography } from '@mui/material';
import {Grid} from '@mui/material';

import type {ButtonProps, SpanProps} from './utils';

let connect: Connect
const cards = [0, 1, 2, 3, 4]

function displaySrc(srcURIs: string[] | undefined): JSX.Element {
    console.log(srcURIs)
    if (srcURIs == undefined) {
        return (
            <Alert severity="info">{"There is no file to show"}</Alert>
        )
    } else {
        console.log("http://172.32.0.1:9010/view/" + srcURIs[0])
        return (
            <Container sx={{ py: 8 }} maxWidth="md">
            {/* End hero unit */}
            <Grid container spacing={4}>
                {cards.map((card) => (
                    <Grid item key={card} xs={12} sm={6} md={4}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }} >
                            <CardMedia
                                component="img"
                                sx={{
                                    // 16:9
                                    pt: '56.25%',
                                }}
                                image={"http://172.32.0.1:9010/view/" + srcURIs[card]} //"https://source.unsplash.com/random"
                                alt="random"
                            />
                            <CardContent sx={{ flexGrow: 1 }}>
                            <Typography gutterBottom variant="h5" component="h2">
                                Heading
                            </Typography>
                            <Typography>
                                This is a media card. You can use this section to describe the
                                content.
                            </Typography>
                            </CardContent>
                            <CardActions>
                                <Button size="small">View</Button>
                                <Button size="small">Edit</Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
            </Container>
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