import React, { useState } from 'react';

import { Connect } from './utils';
import { Card, CardActions, CardContent, CardMedia } from '@mui/material';
import { Alert, Button, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

let connect: Connect | undefined = undefined;

interface UploadProps {
    title: string;
    setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
}

function FileUpload(props: UploadProps): JSX.Element {
    let { title, setFile }: UploadProps = props;
    connect = new Connect(window.ethereum);

    const [isSelected, setIsSelected] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File>();

    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        let file = event.target.files
        if (file) {
            setSelectedFile(file[0])
            setIsSelected(true)

            setFile(file[0])
            console.log(URL.createObjectURL(file[0]))
        }
    };

    const submissionHandler = async (connect: Connect | undefined) => {
        const formData = new FormData()
        const signer = connect!.getSigner()
        console.log(signer)

        let address = await signer!.getAddress()
        let signature = await signer!.signMessage(address)

        console.log(signature)

        if (isSelected) {
            formData.append('file', selectedFile!)
            console.log(formData)

            let response = await fetch("http://172.32.0.1:9010/upload/" + address, {
                method: "POST",
                body: formData,
            })
            console.log(response)

            // TODO: Implement write data to DB with file hash
            let POSTbody = JSON.stringify({
                account_id: address,
                file_name: selectedFile!.name,
                signature: signature,
                type: selectedFile!.type,
                URI: address + "/" + selectedFile!.name,
                size: selectedFile!.size,
            })

            let responseFromDB = await fetch("http://172.30.0.1:8090/upload/submit", {
                method: "POST",
                body: POSTbody,
            })
            console.log(POSTbody)
            console.log(responseFromDB)
        }
    }

    if (connect !== undefined) {
        return (
            <div>
                <Stack spacing={1} direction="row">
                    <Button variant="contained" component="label" > Select file
                        <input type="file" name="file" hidden onChange={changeHandler} />
                    </Button>

                    <Button variant="contained" type="submit" onClick={
                        () => submissionHandler(connect)
                    }>{title}
                    </Button>
                </Stack>
                {isSelected ? (
                    <div>
                        <p>Filename: {selectedFile!.name}</p>
                        <p>FIletype: {selectedFile!.type}</p>
                        <p>Size in bytes: {selectedFile!.size}</p>
                    </div>
                ) : (
                    <p>Select a file to upload</p>
                )}
            </div>
        )
    }
    return <Alert severity="error">Please connect wallet first.</Alert>
}

const UploadLayout = (): JSX.Element => {
    const [file, setFile] = useState<File | undefined>(undefined)

    return (
        <Grid container spacing={3}>
            {/* Chart */}
            <Grid item xs={12} md={8} lg={9}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 480,
                    }}
                >
                    {file ? (
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', margin: "auto",}} >
                            <CardMedia
                                component="img"
                                sx={{
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
            {/* Recent Deposits */}
            <Grid item xs={12} md={4} lg={3}>
                <Paper
                    sx={{
                        p: 2,
                        display: 'flex',
                        flexDirection: 'column',
                        height: 240,
                    }}
                >
                    <FileUpload title="upload" setFile={setFile} />
                </Paper>
            </Grid>
        </Grid>
    )
}



export { UploadLayout }