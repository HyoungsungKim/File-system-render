import React, { useState, useEffect } from 'react';
import { Contract, BigNumber } from 'ethers';

import { cclLogo, Connect, testExpirationTime } from './utils';

import { Alert, Box, Button, Card, CardMedia, TextField } from '@mui/material';
import { LinearProgress } from '@mui/material';
import { Grid, Paper, Stack } from '@mui/material';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';


import ERC4907ContractInfo from './contract/ERC4907/ERC4907.json';

let connect: Connect | undefined = undefined;

const NOTRENTED: string = "0x0000000000000000000000000000000000000000"

const ONEMINUTE_SECOND = 60
const ONEHOUR_SECOND = ONEMINUTE_SECOND * 60
const ONEDAY_SECOND = ONEHOUR_SECOND * 24
const ONEWEEK_SECOND = ONEDAY_SECOND * 7
const THIRTYDAYS_SECOND = ONEDAY_SECOND * 30
const ONEYEAR_SECOND = ONEDAY_SECOND * 365


interface RequestProps {
    jsonResponse: any;
    setJsonResponse: React.Dispatch<any>;
}

interface MetadataInfoProps {
    isLoaded: boolean,
    NFTtitle: string,
    accountId: string,
    nftId: string,
    copyright: string,
}

interface ExpirationDataProps {
    rentalPeriod: number
    setRentalPeriod: React.Dispatch<React.SetStateAction<number>>
}

function ExpirationDateRadioButton(props: ExpirationDataProps) {
    let {rentalPeriod, setRentalPeriod} = props;

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRentalPeriod(parseInt(event.target.value));
    };

    return (
        <FormControl>
            <FormLabel id="expiration-date-radio-buttons-group-label">Expiration date</FormLabel>
            <RadioGroup
                row
                aria-labelledby="expiration-date-row-radio-buttons-group-label"
                name="expiration-date-row-radio-buttons-group"
                defaultValue={rentalPeriod}
                value={rentalPeriod}
                onChange={handleChange}
            >
                <FormControlLabel label="5 min(test)" value={ONEMINUTE_SECOND*5} control={<Radio checked={true} />}  />
                <FormControlLabel label="1 hour" value={ONEHOUR_SECOND} control={<Radio />}  />
                <FormControlLabel label="1 day" value={ONEDAY_SECOND} control={<Radio />}  />
             </RadioGroup>
        </FormControl>
    );
}

const checkRentalAvailable = async (
    signerAddress: string,
    NFTOwner: string,
    NFTUser: string
): Promise<boolean> => {

    console.log("owner: ", NFTOwner);
    console.log("user: ", NFTUser);

    if (NFTOwner == signerAddress && NFTUser == NOTRENTED) {
        return true;
    } else {
        return false
    }
}

const rentalHandler = async (
    connect: Connect | undefined,
    nftId: string,
    rentalTo: string | undefined,
    rentalPeriod: number
) => {
    const abi = ERC4907ContractInfo.abi;
    const signer = connect!.getSigner();
    const contract = new Contract("0x0354fab135deE2b7aCc82c36047C1C157cE98B1B", abi, signer);
    const signerAddress = await signer!.getAddress()

    const NFTOwner: string = await contract.ownerOf(nftId)
    const NFTUser: string = await contract.userOf(nftId)

    let rentalAvailable = await checkRentalAvailable(signerAddress, NFTOwner, NFTUser);
    // rental for 180 sec

    if (rentalAvailable) {
        let rentalSince = new Date().getTime();                         // Miliseconds
        let expiration = Math.floor(rentalSince/1000) + rentalPeriod    // Seconds
        //let testExpires = Math.floor(new Date().getTime() / 1000) + 60;

        const pendingContract = await contract.setUser(nftId, rentalTo, BigNumber.from(expiration));
        const receipt = await pendingContract.wait()

        console.log(receipt)

        testExpirationTime(rentalSince, expiration * 1000, 10 * 1000)
    }

};


function MetadataInfoHandler(props: MetadataInfoProps): JSX.Element {
    let { isLoaded, NFTtitle, accountId, nftId, copyright } = props;
    const [rentalTo, setRentalTo] = useState<string>();
    const [rentalPeriod, setRentalPeriod] = useState<number>(ONEMINUTE_SECOND * 5);

    const textFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRentalTo(event.target.value);
    };

    if (isLoaded) {
        return (<List>
            <ListItem disablePadding>
                <TextField id="NFT-owner" label="NFT title" variant="standard" value={NFTtitle} disabled />
            </ListItem>
            <ListItem disablePadding>
                <TextField id="NFT-owner" label="NFT Owner" variant="standard" value={accountId!.slice(0, 15) + "..."} disabled />
            </ListItem>
            <ListItem disablePadding>
                <TextField id="NFT-rental-to" label="NFT rental to" variant="standard" onChange={textFieldHandler} />
            </ListItem>
            <ListItem style={{ display: 'flex', justifyContent: 'center' }}>
                {//copyrights![index] ? cclogo[copyrights![index]]() : cclogo["unlockable content"]()
                    cclLogo[copyright]()
                }
            </ListItem>
            <ExpirationDateRadioButton rentalPeriod={rentalPeriod} setRentalPeriod={setRentalPeriod}/>
            <ListItem style={{ display: 'flex', justifyContent: 'center' }}>
                <Button variant="contained" disabled={copyright == "unlockable content"} onClick={() => {
                    rentalHandler(connect, nftId, rentalTo, rentalPeriod);
                }}>{"Rental"}</Button>
            </ListItem>
        </List>
        )
    } else {
        return (
            <List>
                <ListItem disablePadding>
                    <TextField id="NFT-title" label="NFT title" variant="standard" disabled />
                </ListItem>
                <ListItem disablePadding>
                    <TextField id="NFT-owner" label="NFT Owner" variant="standard" disabled />
                </ListItem>
                <ListItem style={{ display: 'flex', justifyContent: 'center' }}>
                    {//copyrights![index] ? cclogo[copyrights![index]]() : cclogo["unlockable content"]()
                        // cclogo["CC BY"]()
                    }
                </ListItem>
                <ListItem style={{ display: 'flex', justifyContent: 'center' }}>
                    <Button variant="contained" size="small" sx={{ height: 42 }}> Rental </Button>
                </ListItem>
            </List>
        )
    }
}

const NFTInfoHandler = (props: RequestProps): JSX.Element => {
    let { jsonResponse, setJsonResponse } = props

    let [NFTtitle, setNFTtitle] = useState<string>();
    let [NFTOwnerAccountId, setNFTOwnerAccountId] = useState<string>()
    let [NFTId, setNFTId] = useState<string>();
    let [copyright, setCopyright] = useState<string>();

    let [isLoaded, setIsLoaded] = useState<boolean>(false)
    let [loadCircular, setLoadCircular] = useState<boolean>(false)

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
        setNFTtitle(jsonResponse.NFTtitle)
        setNFTOwnerAccountId(jsonResponse.account_id)
        setCopyright(jsonResponse.copyright)
        setIsLoaded(true)
    }

    return (
        <div>
            <Stack spacing={1} direction="row">
                <TextField id="NFT-id" label="NFT ID" variant="standard" onChange={textFieldHandler} />
                <Button variant="contained" onClick={() => getNFTInfoHandler(NFTId!)}>{"Get"}</Button>
            </Stack>
            {
                isLoaded ?
                    <MetadataInfoHandler isLoaded={isLoaded} NFTtitle={NFTtitle!} accountId={NFTOwnerAccountId!} nftId={NFTId!} copyright={copyright!} />
                    : (
                        loadCircular ?
                            <Box sx={{ m: 1, width: "100%" }}>
                                <LinearProgress />
                            </Box>
                            : <Box sx={{ m: 1, width: "100%" }}>
                                <Alert severity="info">NFT Rental</Alert>
                            </Box>
                    )
            }
        </div>
    )
}


const RentalLayout = (): JSX.Element => {
    const [jsonResponse, setJsonResponse] = useState<any>(undefined)

    useEffect(() => {
        connect = new Connect(window.ethereum);
    }, [])

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
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', margin: 1 }} >
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
                    <NFTInfoHandler jsonResponse={jsonResponse} setJsonResponse={setJsonResponse} />
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

export { RentalLayout }