import React, {useState, useEffect, useRef} from 'react';
import type { NFTMetaData } from './utils';
import { cclLogo, Connect, parseInfo } from './utils';
import { TablePaginationActions } from './reportTablePagenation';
import { Contract, } from 'ethers';

import {Alert, AlertColor, Box, Button, Card, CardMedia, CircularProgress, TextField, InputLabel, Menu, MenuItem} from '@mui/material';
import {LinearProgress } from '@mui/material';
import Select, { SelectChangeEvent } from '@mui/material/Select';

import {Container, Divider, Grid, Paper, Stack, Typography} from '@mui/material';
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Snackbar from '@mui/material/Snackbar';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableFooter from '@mui/material/TableFooter';
import TablePagination from '@mui/material/TablePagination';

import ERC4907ContractInfo from './contract/ERC4907/ERC4907.json';
import monitorData from './data/data.json';

let connect: Connect;

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

        let response = await fetch("DB/collection/" + address, {
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
    const [allowIds, setAllowIds] = useState<string[]>()
    const SearchHandler = async () => {
        const response = await fetch(`http://121.67.187.148:3333/allmusicallowcondition?memberID=${ownerId}&musicID=${musicInfo.musicId}`, {
            method: "GET",
        })
        const jsonResponse = await response.json()
        const parsedAllowId = parseInfo(jsonResponse["data"], "allowID")
        setAllowIds(parsedAllowId)
        console.log(parsedAllowId)
    }


    
    return (
        <Box m={2}>
            <Stack spacing={2} direction="row" sx={{my:1}} justifyContent="center"> 
                <TextField id="UCI" label="UCI" variant="standard" value={musicInfo.musicUCI} disabled/>
                <Button variant="contained" component="label" onClick={SearchHandler} >{"Search"}</Button>
            </Stack>
            {(allowIds ? 
                <TableArcodian allowIds={allowIds} musicInfo={musicInfo}/>
                : <div></div>
            )}            
        </Box>
    )
}

function DisplayTable(props: {data: typeof monitorData}): JSX.Element {
    const {data} = props
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(5);

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - data.length) : 0;

    const handleChangePage = (
        event: React.MouseEvent<HTMLButtonElement> | null,
        newPage: number,
    ) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <div>
            <TableContainer component={Paper}>
                <Table size="small"  >
                    <TableHead>
                        <TableRow>
                            {
                                //<TableCell>F_SEQ</TableCell>
                            }
                            <TableCell>Date</TableCell>
                            <TableCell>Platform</TableCell>
                            <TableCell>Song</TableCell>
                            <TableCell>Program</TableCell>
                            <TableCell>Time</TableCell>
                            <TableCell>Duration</TableCell>
                            <TableCell>Artist name</TableCell>                            
                            { 
                                //<TableCell>F_SONG_NM_SCH</TableCell>                            
                                //<TableCell>F_ARTIST_NM_SCH</TableCell>
                                //<TableCell>F_UCI</TableCell> 
                            }
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {(rowsPerPage > 0 ?
                            data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) 
                            : data).map((list, index) => (
                            <TableRow key={index} component="th" scope="row">
                                {
                                    //<TableCell>{list.F_SEQ}</TableCell>
                                }
                                <TableCell>{list.F_MONITOR_DT}</TableCell>
                                <TableCell>{list.F_PLATFORM_NM}</TableCell>
                                <TableCell>{list.F_SONG_NM}</TableCell>
                                <TableCell>{list.F_PROGRAM_NM}</TableCell>
                                <TableCell>{list.F_START_DT}</TableCell>
                                <TableCell>{list.F_DURATION}</TableCell>
                                <TableCell>{list.F_ARTIST_NM}</TableCell>                                
                                {
                                    //<TableCell>{list.F_SONG_NM_SCH}</TableCell>                                
                                    //<TableCell>{list.F_ARTIST_NM_SCH}</TableCell>
                                    //<TableCell>{list.F_UCI}</TableCell>
                                }
                            </TableRow>
                        ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                            <TableCell colSpan={6} />
                            </TableRow>
                        )}
                    </TableBody>
                    <TableFooter>
                        <TableRow>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
                                colSpan={3}
                                count={data.length}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                SelectProps={{
                                    inputProps: {
                                    'aria-label': 'rows per page',
                                    },
                                    native: true,
                                }}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                ActionsComponent={TablePaginationActions}
                            />
                        </TableRow>
                        </TableFooter>
                </Table>
            </TableContainer>
        </div>
    )
}

function TableArcodian(props: {allowIds: string[], musicInfo: MusicInfo}): JSX.Element {
    const {allowIds, musicInfo} = props;
    const filtedData = monitorData.filter((data: typeof monitorData[0]) => {
        if(data.F_UCI == musicInfo.musicUCI) return true
    })
    
    const splitByallowId = () => {
        let allowed: typeof monitorData = []
        let disallowed: typeof monitorData = []

        filtedData.map((data) => {
            if (allowIds.includes(data.F_PLATFORM_NM )) {
                allowed.push(data)
            } else {
                disallowed.push(data)
            }
        })

        return [allowed, disallowed]
    }

    const [allowed, disallowed] = splitByallowId()

    return (
        <Container sx={{ py: 8 }} maxWidth="md">
        <Accordion>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                >
                <Typography>Allow</Typography>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
                <Grid container spacing={4}>
                    {
                        <DisplayTable data={allowed}/>
                    }
                </Grid>
            </AccordionDetails>
        </Accordion>

        <Accordion>
                <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
                >
                <Typography>Disallow</Typography>
            </AccordionSummary>
            <Divider />
            <AccordionDetails>
                <Grid container spacing={4}>
                    {
                        <DisplayTable data={disallowed}/>
                    }
                </Grid>
            </AccordionDetails>
        </Accordion>
        </Container>
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
        connect = new Connect(window.ethereum);

        musicInfoList.musicIdList = musicIdList
        musicInfoList.musicNameList = musicNameList
        musicInfoList.musicNameList = musicNameList

        musicInfo.musicId = musicId
        musicInfo.musicName = musicName
        musicInfo.musicUCI = musicUCI
    })

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
            <Divider />
          </Paper>
      </Container>
    )
}

export {ReportLayout}