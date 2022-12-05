import React, {useState, useEffect, useRef} from 'react';
import type { NFTMetaData } from './utils';
import { cclLogo, Connect, parseInfo } from './utils';
import { Contract, } from 'ethers';

import {Alert, AlertColor, Box, Button, Card, CardMedia, CircularProgress, TextField, InputLabel, Menu, MenuItem} from '@mui/material';
import {LinearProgress } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import {Container, Divider, Grid, Paper, Stack, Typography} from '@mui/material';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Snackbar from '@mui/material/Snackbar';

import ERC4907ContractInfo from './contract/ERC4907/ERC4907.json';


let connect: Connect

interface MusicInfoListSetter {
    setMusicIdList: React.Dispatch<React.SetStateAction<string[] | undefined>>
    setMusicNameList: React.Dispatch<React.SetStateAction<string[] | undefined>>
    setMusicUCIList: React.Dispatch<React.SetStateAction<string[] | undefined>>
}

interface MusicInfoList {
    musicIdList: string[] | undefined
    musicNameList: string[] | undefined
    musicUCIList: string[] | undefined
}

interface MusicInfoSetter {
    setMusicId: React.Dispatch<React.SetStateAction<string | undefined>>
    setMusicName: React.Dispatch<React.SetStateAction<string | undefined>>
    setMusicUCI: React.Dispatch<React.SetStateAction<string | undefined>>
}

interface MusicInfo {
    musicId: string | undefined
    musicName: string | undefined
    musicUCI: string | undefined
}

interface UCIListCallbackProps {
    setOwnerId: React.Dispatch<React.SetStateAction<string | undefined>>
    musicInfoListSetter: MusicInfoListSetter    

    setLoading: React.Dispatch<React.SetStateAction<boolean>>
    setSuccess: React.Dispatch<React.SetStateAction<boolean>>
}

interface ShowUCIListProps {
    musicInfoList: MusicInfoList
    musicInfoSetter: MusicInfoSetter    
}

function parseIds(jsonResponse: any, key: string): string[] {
    let ids: string[] = []
    jsonResponse[key].forEach((val: string) => {
        ids.push(val.split('.')[0])
    })

    return ids
}

function GetOwningMusicInfo(props: UCIListCallbackProps): JSX.Element {
    let {setOwnerId, musicInfoListSetter, setLoading, setSuccess } = props;    

    const getOwningInfoHandler = async () => {
        const signer = connect.getSigner();
        const address = await signer!.getAddress();

        let response = await fetch("http://172.30.0.1:8090/collection/" + address, {
            method: "GET",
        })
        const jsonResponse = await response.json()
        const parsedMusicIdList = parseIds(jsonResponse, "file_names")
        const parsedMusicNameList = jsonResponse.NFTtitles
        const parsedUCIList = jsonResponse.UCIs
        const parsedOwnerId = jsonResponse.owner_id
        
        console.log(jsonResponse)

        setOwnerId(parsedOwnerId)
        musicInfoListSetter.setMusicIdList(parsedMusicIdList)
        musicInfoListSetter.setMusicNameList(parsedMusicNameList)
        musicInfoListSetter.setMusicUCIList(parsedUCIList)
    }

    return (
            <Button variant="contained" component="label" onClick={getOwningInfoHandler}> {"Load"} </Button>
    )
}

function ShowUCIList(props: ShowUCIListProps): JSX.Element {
    const {musicInfoList, musicInfoSetter} = props
    const [selectedUCI, setSelectedUCI] = useState<string|undefined>()

    const selectHandler = (event: SelectChangeEvent) => {
        musicInfoSetter.setMusicUCI(event.target.value as string)
        setSelectedUCI(event.target.value as string)
    }
    return (
        <Box sx={{ minWidth: 120 }}>
            <FormControl fullWidth>
                <InputLabel id="SelectMusicLabel">Select a music</InputLabel>
                <Select
                    labelId="SelectMusic"
                    id="SelectMusic"
                    label="Select a music"
                    variant="standard"
                    defaultValue={''}
                    onChange={selectHandler}
                >{
                    musicInfoList!.musicUCIList!.map((UCI, idx) => (
                        <MenuItem value={UCI} key={UCI} onClick={() => {
                            musicInfoSetter.setMusicUCI(UCI),
                            musicInfoSetter.setMusicId(musicInfoList!.musicIdList![idx]),
                            musicInfoSetter.setMusicName(musicInfoList!.musicNameList![idx])
                        }}>{"["+ musicInfoList!.musicIdList![idx] +"] " + musicInfoList!.musicNameList![idx]}</MenuItem>                                                        
                    ))}
                </Select>
            </FormControl>
        </Box>
    )
}

// Get all music allow Id
// curl -sX GET -H "Content-Type: application/json; charset=utf-8" "http://121.67.187.148:3333/allmusicallowcondition?memberID=jubesi001&musicID=S000000000001885"
function ShowAllowIdList(props: {ownerId: string, musicInfo: MusicInfo}): JSX.Element {
    const {ownerId, musicInfo} = props

    const SearchHandler = async () => {
        const response = await fetch(`http://121.67.187.148:3333/allmusicallowcondition?memberID=${ownerId}&musicID=${musicInfo.musicId}`, {
            method: "GET",
        })
        const jsonResponse = await response.json()
        const parsedAllowId = parseInfo(jsonResponse["data"], "allowID")
        console.log(parsedAllowId)
    }


    
    return (
        <Box m={2}>
            <Stack spacing={2} direction="row" sx={{my:1}} justifyContent="center"> 
                <TextField id="UCI" label="UCI" variant="standard" value={musicInfo.musicUCI} disabled/>
                <Button variant="contained" component="label" onClick={SearchHandler} >{"Search"}</Button>
            </Stack>
        </Box>
    )
}


function ReportLayout(): JSX.Element {
    const [jsonResponse, setJsonResponse] = useState<any>(undefined)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(true)

    const [ownerId, setOwnerId] = useState<string>()

    const [musicIdList, setMusicIdList] = useState<string[]>()
    const [musicNameList, setMusicNameList] = useState<string[]>()
    const [musicUCIList, setMusicUCIList] = useState<string[]>()

    const [musicId, setMusicId] = useState<string>()
    const [musicName, setMusicName] = useState<string>()
    const [musicUCI, setMusicUCI]  = useState<string>()

    const musicInfoListSetter: MusicInfoListSetter = {
        setMusicIdList: setMusicIdList,
        setMusicNameList: setMusicNameList,
        setMusicUCIList: setMusicUCIList
    }

    let musicInfoList: MusicInfoList = {
        musicIdList: musicIdList,
        musicNameList: musicNameList,
        musicUCIList: musicUCIList,
    }

    const musicInfoSetter: MusicInfoSetter = {
        setMusicId: setMusicId,
        setMusicName: setMusicName,
        setMusicUCI: setMusicUCI
    }

    let musicInfo: MusicInfo = {
        musicId: musicId,
        musicName: musicName,
        musicUCI: musicUCI,
    }

    useEffect(() => {
        musicInfoList.musicIdList = musicIdList
        musicInfoList.musicNameList = musicNameList
        musicInfoList.musicNameList = musicNameList

        musicInfo.musicId = musicId
        musicInfo.musicName = musicName
        musicInfo.musicUCI = musicUCI
    })

    useEffect(() => {
        connect = new Connect(window.ethereum);
    }, [])

    return (
        <Container component="main"  maxWidth="md" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
            {
                <Stack spacing={2} direction="column" sx={{my:1}} justifyContent="center"> {
                    success ? (
                        musicUCIList ? (
                            <ShowUCIList musicInfoList={musicInfoList} musicInfoSetter={musicInfoSetter}/>
                        ): (
                            <GetOwningMusicInfo setOwnerId={setOwnerId} musicInfoListSetter={musicInfoListSetter} setLoading={setLoading} setSuccess={setSuccess} />                            
                        )
                    ) : (
                        <CircularProgress />
                    )
                } </Stack>
            }

            <Divider />
            <ShowAllowIdList ownerId={ownerId as string} musicInfo={musicInfo}/>
          </Paper>
      </Container>
    )
}

export {ReportLayout}