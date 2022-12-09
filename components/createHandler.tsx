import React, { useEffect, useState } from 'react';
import { Contract, ContractFactory } from 'ethers';



import { Connect, downloadHandler, mintERC721, parseInfo, zipFiles} from './utils';
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



let connect: Connect;

interface FileProps {
    setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
    setSuccessCreate: React.Dispatch<React.SetStateAction<boolean>>
}



const UploadAndMint = (props: FileProps): JSX.Element => {
    let { setFile, setSuccessCreate }: FileProps = props;
    const [cclList, setCCLList] = useState<string[]>(["CC BY", "CC BY-NC", "CC BY-ND", "CC BY-SA", "CC BY-NC-ND", "CC BY-NC-SA"])
    


    const [isSelected, setIsSelected] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File>();
    const [unlockableContent, isUnlockableContent] = useState(false)
    const [targetURI, setTargetURI] = useState<string>("Please load collection first")
    const [title, setTitle] = useState<string | undefined>(undefined) 
    const [copyright, setCopyright] = useState<string>("CC BY") 

    const [userId, setUserId] = useState<string>() 
    const [userPassword, setUserPassword] = useState<string>()

    const [musicId, setMusicId] = useState<string>()
    const [musicUCI, setMusicUCI] = useState<string>()
    const [musicName, setMusicName] = useState<string>()

    const [loginSuccess, setLoginSuccess] = useState<boolean>()
    const [musicIdList, setMusicIdList] = useState<string[]>()
    const [musicNameList, setMusicNameList] = useState<string[]>()
    const [musicUCIList, setMusicUCIList] = useState<string[]>()

    const [snackbarOpen, setSnackbarOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(true)

    useEffect(() => {
        connect = new Connect(window.ethereum);
    }, [connect])


    const userIdFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserId(event.target.value);
    }

    const userPasswordFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUserPassword(event.target.value);
    }

    const musicIdFieldHandler = (event: SelectChangeEvent) => {
        setMusicId(event.target.value as string);
        //console.log(musicId)
    }

    /*
    const NFTTitleFieldHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value);
    }
    */

    const cclFieldHandler = (event: SelectChangeEvent) => {
        setCopyright(event.target.value as string)
    }

    const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
        if (reason === 'clickaway') {
          return;
        }
    
        setSnackbarOpen(false);
    }

    const loginHandler = async () => {
        const loginResult = await login(userId!, userPassword!)
        ////console.log(loginResult)
        if (loginResult && connect != undefined) {
            setLoginSuccess(loginResult)

            setLoading(true)
            setSuccess(false)

            const response = await fetch("http://121.67.187.148:3333/allMusicInfo?memberID=" + userId, {
                method: "GET"
            })
            const jsonResponse = await response.json()
            //console.log(jsonResponse)
            
            setLoading(false)
            setSuccess(true)

            if(jsonResponse["status_code"] == 200) {
                const parsedMusicIdList = parseInfo(jsonResponse["data"], "musicID")
                const parsedMusicNameList = parseInfo(jsonResponse["data"], "musicName")
                const parsedUCIList = parseInfo(jsonResponse["data"], "UCI")

                setMusicIdList(parsedMusicIdList)
                setMusicNameList(parsedMusicNameList)
                //setMusicId(parsedMusicIdList[0])

                setMusicUCIList(parsedUCIList)
                //setMusicUCI(parsedUCIList[0])
                
                //console.log(parsedMusicIdList)
                //console.log(parsedMusicNameList)
                //console.log(parsedUCIList)
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
            //console.log(URL.createObjectURL(renamedFIle));
        }
    }

    const submissionHandler = async (connect: Connect | undefined) => {
        try {

            let responsePing = await fetch("file/ping", {
                method: "GET"
            });
            //console.log(responsePing)

            setLoading(true)
            setSuccess(false)

            const signer = connect!.getSigner()
            let address = await signer!.getAddress()

            
            let nftMetaData: NFTMetaData = {
                title: musicName ? musicName : "undefined", //title ? title : "undefined",
                image: address + "/" + selectedFile!.name,
                unlockableContent: unlockableContent,
                NFTId: undefined,
                attribution: unlockableContent ? undefined : {
                    copyright: copyright,
                }
            }
            //console.log(nftMetaData)

            //console.log("Call mint ERC721")
            if (isSelected) {
                const [metaDataInfo, unlockableMetaDataInfo] = await mintERC721(connect, userId!, selectedFile!, unlockableContent, nftMetaData, copyright, musicUCI!);       
                //console.log("Download a file from Jubaesi server and send it to backup server")
                const musicFile = await downloadHandler(address, musicId);    
                
                //console.log("Packing files...")
                const zipBlob = await zipFiles(musicId!, [selectedFile!, selectedFile!.type.slice(-3)], musicFile!, metaDataInfo, unlockableMetaDataInfo)
                const zipFile = new File([zipBlob], musicId!+".zip")
                const formData = new FormData()
                formData.append("file", zipFile)

                const response = await fetch("file/upload/" + address, {
                    method: "POST",
                    body: formData,
                });

                setSuccessCreate(true);            
            }
            setLoading(false)
            setSuccess(true)
        } catch (err) {
            setLoading(false)
            setSuccess(true)
            
            ////console.error(err);
            //console.log((err as Error).message)
            //statusMonitor.innerHTML = `Minting failed, ${(err as Error).message}`;
        }
    }

    return (
        <div>
            {!loginSuccess ? (
                <Stack spacing={1} direction="column" sx={{ my:1 }}>
                        <TextField id="Id" label="Id" variant="standard" onChange={userIdFieldHandler}/>
                        <TextField id="Password" label="Password" variant="standard" type="password" onChange={userPasswordFieldHandler} />
                        <Button variant="contained" component="label" onClick={loginHandler}> Get Data </Button>        
                        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleClose} message={"Login fail. Please Checck Id, password, or account"} />
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
                                                defaultValue={''}
                                                value={musicId}
                                                onChange={musicIdFieldHandler}
                                            >{
                                                musicIdList.map((musicId, idx) => (
                                                    <MenuItem value={musicId} key={musicId} onClick={() => {
                                                        setMusicUCI(musicUCIList![idx]),
                                                        setMusicName(musicNameList![idx]),
                                                        setTitle(musicNameList![idx])
                                                    }}>{"["+ musicId +"] " + musicNameList![idx]}</MenuItem>                                                        
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
            <Stack spacing={1} direction="row" sx={{ my: 1}}>
                <Box textAlign='center'>
                    <Button variant="contained" component="label" disabled={musicId==undefined || success==false}> {"Select \n Thumbnail"}
                        <input type="file" name="file" hidden onChange={changeHandler} />
                    </Button>
                </Box>
                <Button variant="contained" type="submit" disabled={musicId==undefined || success==false} onClick={
                    () => submissionHandler(connect)
                }>{"Create"}
                </Button>
            </Stack> 
            <Divider variant="middle" />
            {isSelected ? (
                <Stack spacing={1} direction="column" sx={{ my:1 }}>
                    {
                        //<TextField id="FileName" label="File name" variant="standard" defaultValue={selectedFile!.name} disabled/> 
                        //<TextField id="FileSize" label="File size (bytes)" variant="standard" defaultValue={selectedFile!.size} disabled/>                        
                    }
                    <TextField id="FileType" label="File type" variant="standard" defaultValue={selectedFile!.type} disabled/>
                        <FormControlLabel control={<Switch onChange= {() => { 
                            isUnlockableContent(!unlockableContent)
                            setCopyright("unlockable content")
                        }} />} label="Unlockable content" />
                    
                    <FormControl disabled={unlockableContent} fullWidth>
                        <InputLabel id="SelectCCLLabel">Select CCL</InputLabel> 
                        <Select
                            labelId="CCL"
                            id="CCL"
                            label="Select CCL"
                            variant="standard"
                            value={copyright}
                            onChange={cclFieldHandler}                                    
                        >{
                            cclList.map((ccl, idx) => (
                                <MenuItem value={ccl} key={ccl}>{ccl}</MenuItem>
                            ))
                        }</Select>
                    </FormControl>
                    <TextField id="NFT-title" label="Title" variant="standard" value={musicName} disabled/>
                </Stack>
            ) : (
                <Alert severity="info">Select a thumbnail</Alert>
            )}
            
        </div>
    )        
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
        connect = new Connect(window.ethereum)
    }, [successCreate, connect])

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