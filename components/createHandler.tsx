import React, { useEffect, useState } from 'react';
import { Contract, ContractFactory } from 'ethers';

import { Connect, mintERC721} from './utils';
import type { Attribution, NFTMetaData} from './utils';

import {login, requestDownloadURL} from './externalAPI';

import { Alert, AlertColor, Button, Box, Card, CardActions, CardContent, CardMedia, CircularProgress, Divider } from '@mui/material';
import {TextField, Typography, MenuItem, Switch, FormControlLabel} from '@mui/material';
import {Radio, RadioGroup, FormControl, FormLabel} from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';

import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';
//import ERC721ContractInfo from './contract/ERC721/MyNFT.json';



let connect: Connect | undefined = undefined;

interface FileProps {
    setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
    setSuccessCreate: React.Dispatch<React.SetStateAction<boolean>>
}

const parseInfo = (allMusicInfo: object[], objKey:string): string[] => {
    let parsedList: string[] = []
    allMusicInfo.forEach((musicInfo) => {
        parsedList.push(musicInfo[objKey as keyof object])
    })

    return parsedList
}

const UploadAndMint = (props: FileProps): JSX.Element => {
    let { setFile, setSuccessCreate }: FileProps = props;

    useEffect(() => {
        connect = new Connect(window.ethereum);
    }, [])

    const [isSelected, setIsSelected] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File>();
    const [unlockableContent, isUnlockableContent] = useState(false)
    const [targetURI, setTargetURI] = useState<string>("Please load collection first")
    const [title, setTitle] = useState<string | undefined>(undefined) 
    const [copyright, setCopyright] = useState<string>("CC BY") 

    const [userId, setUserId] = useState<string>() 
    const [userPassword, setUserPassword] = useState<string>()

    const [musicId, setMusicId] = useState<string>()
    const [loginSuccess, setLoginSuccess] = useState<boolean>()
    const [musicIdList, setMusicIdList] = useState<string[]>()
    const [musicNameList, setMusicNameList] = useState<string[]>()

    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(true)

    const userIdFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserId(event.target.value);
    }

    const userPasswordFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserPassword(event.target.value);
    }

    const musicIdFieldHandler = (event: SelectChangeEvent) => {
        setMusicId(event.target.value);
    }

    /*
    const NFTTitleFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }
    */

    const radioButtonHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCopyright(event.target.value)
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
    }

    const loginHandler = async () => {
        const loginResult = await login(userId!, userPassword!)
        console.log(loginResult)
        if (loginResult) {
            setLoginSuccess(loginResult)

            setLoading(true)
            setSuccess(false)

            const response = await fetch("http://121.67.187.148:3333/allMusicInfo?memberID=" + userId, {
                method: "GET"
            })
            const jsonResponse = await response.json()
            console.log(jsonResponse)
            
            setLoading(false)
            setSuccess(true)

            if(jsonResponse["status_code"] == 200) {
                const musidIdList = parseInfo(jsonResponse["data"], "musicID")
                const musidNameList = parseInfo(jsonResponse["data"], "musicName")

                setMusicIdList(musidIdList)
                setMusicNameList(musidNameList)

                console.log(musidIdList)
                console.log(musidNameList)
            }
        } else {
            setSnackbarOpen(true);
        }
    }

    // Select file and change states
    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        let file = event.target.files;
        if (file) {
            const renamedFIle = new File([file[0]], musicId! + "." + file[0].type.slice(-3), {                
                type: file[0].type
            })
            //setSelectedFile(file[0]);
            setSelectedFile(renamedFIle)
            setIsSelected(true);

            //setFile(file[0]);
            setFile(renamedFIle)
            setTargetURI(event.target.value);
            console.log(URL.createObjectURL(renamedFIle));
        }
    }

    const downloadHandler = async (connect: Connect | undefined) => {
        if(musicId) {
            const signer = connect!.getSigner()
            let address = await signer!.getAddress()

            let jsonResponse = await requestDownloadURL(musicId)
            console.log(jsonResponse)

            const url = jsonResponse["mp3_url "]
            const formData = new FormData()
            const fileFromJubaesi = await fetch(url, {
                method: "GET",
            })
            console.log(fileFromJubaesi)
            const mp3Blob = await fileFromJubaesi.blob()
            //const mp3File = new File([mp3Blob], musicId + "." + url.slice(-3))
            console.log(url.slice(-3))
            const mp3File = new File([mp3Blob], musicId + "." + url.slice(-3), {                
                type: url.slice(-3)
            })
            formData.append('file',  mp3File)

            console.log(formData)
            const response = await fetch("http://172.32.0.1:9010/upload/" + address, {
                method: "POST",
                body: formData,
            });

            console.log(response)
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
                setSuccessCreate(true);
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
                {!loginSuccess ? (
                    <Stack spacing={1} direction="column" sx={{ my:1 }}>
                            <TextField id="Id" label="Id" variant="standard" onChange={userIdFieldHandler}/>
                            <TextField id="Password" label="Password" variant="standard" type="password" onChange={userPasswordFieldHandler} />
                            <Button variant="contained" component="label" onClick={loginHandler}> Get Data </Button>        
                            <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleClose} message={"Login fail"} />
                    </Stack>
                    ) : ( success ? (
                            <Stack spacing={1} direction="column" sx={{ my:1 }}>
                                <Box sx={{ minWidth: 120 }}>
                                    <FormControl fullWidth>
                                        <InputLabel id="SelectMusicLabel">Select a music</InputLabel>
                                        {
                                            musicIdList ? (
                                                <Select
                                                    labelId="SelectMusic"
                                                    id="SelectMusic"
                                                    label="Select a music"
                                                    variant="standard"
                                                    value={musicIdList[0]}
                                                    onChange={musicIdFieldHandler}
                                                >{
                                                    musicIdList.map((musicId, idx) => (
                                                        <MenuItem value={musicId} key={musicId}>{"["+ musicId +"] " + musicNameList![idx]}</MenuItem>
                                                    ))
                                                }</Select>): (
                                                    <Typography align="center" gutterBottom>{"There is no music"}</Typography>
                                                )
                                        }                                    
                                    </FormControl>
                                </Box>
                            </Stack>
                        ) : (
                            <Typography align="center" gutterBottom>
                                <CircularProgress />
                            </Typography>
                        )
                    )
                }
                <Stack  spacing={1} direction="column" sx={{ my:1 }}>                    
                    <Button variant="contained" component="label" onClick={() => downloadHandler(connect)}> Download </Button>
                </Stack>
                <Stack spacing={1} direction="row" sx={{ my: 1}}>
                    <Box textAlign='center'>
                        <Button variant="contained" component="label" > {"Select \n Thumbnail"}
                            <input type="file" name="file" hidden onChange={changeHandler} />
                        </Button>
                    </Box>
                    <Button variant="contained" type="submit" onClick={
                        () => submissionHandler(connect)
                    }>{"Create"}
                    </Button>
                </Stack> 
                <Divider variant="middle" />
                {isSelected ? (
                    <div>
                        {
                            //<TextField id="FileName" label="File name" variant="standard" defaultValue={selectedFile!.name} disabled/> 
                            //<TextField id="FileSize" label="File size (bytes)" variant="standard" defaultValue={selectedFile!.size} disabled/>                        
                        }
                        <TextField id="FileType" label="File type" variant="standard" defaultValue={selectedFile!.type} disabled/>
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
                            <TextField id="NFT-title" label="Title" variant="standard" defaultValue={musicId} disabled />
                        </div>
                    </div>
                    
                ) : (
                    <Alert severity="info">Select a thumbnail</Alert>
                )}
                
            </div>
        )
    }
    return <Alert severity="error">Please connect wallet first.</Alert>
}


const CreateLayout = (): JSX.Element => {
    const [file, setFile] = useState<File | undefined>(undefined)

    // type AlertColor = "error" | "success" | "info" | "warning"
    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [snackbarSeverity, setSnackbarSeverity] = useState<AlertColor>("success")
    const [successCreate, setSuccessCreate] = useState(false)

    useEffect(() => {
        if (successCreate) {
            handleClick()
            setSuccessCreate(false)
        }
    }, [successCreate])

    const handleClick = () => {
        setSnackbarOpen(true);
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
    }

    // Use this component when snackbar needs specific message.
    const snackbarHandler = (severity: AlertColor) : JSX.Element => { 
        if (severity === "success") {
            return <Alert severity={severity} onClose={handleClose}>{"Success"}</Alert> 
        } else {
            return <Alert severity={severity} onClose={handleClose}>{severity}</Alert> 
        }
    }

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
                    <UploadAndMint setFile={setFile} setSuccessCreate={setSuccessCreate} />
                    <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleClose} >
                        <Alert severity={"success"} onClose={handleClose}>{"success"}</Alert> 
                    </Snackbar>
                </Paper>
            </Grid>
        </Grid>
    )
}

export {CreateLayout}