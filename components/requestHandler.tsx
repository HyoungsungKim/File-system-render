import React, {useState, useEffect} from 'react';
import type { NFTMetaData } from './utils';


import {Button, Card, CardMedia, TextField} from '@mui/material';
import {Grid, Paper, Stack} from '@mui/material';

const NFTInfoHandler = (): JSX.Element => {

    return (
        <div>
            <Stack spacing={1} direction="row">
                <TextField id="NFT-id" label="NFT ID" variant="standard" />
                <Button variant="contained">{"Get"}</Button>
            </Stack>
        </div>
    )
}


const RequestLayout = (): JSX.Element => {
    let [NFTInfo, setNFTInfo] = useState<NFTMetaData>();


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
                            //image={}
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
                    <NFTInfoHandler /> 
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