import React, {useState} from 'react';
import axios, { AxiosResponse } from 'axios';
import { Connect } from './utils';
import { ethers } from 'ethers'
import type {ButtonProps, SpanProps} from './utils';
import { Alert, Button } from '@mui/material';

let connect: Connect | undefined = undefined;

function FileUpload(props: ButtonProps): JSX.Element {
    let {display, onClick, ...htmlButtonProps}: ButtonProps = props;
    connect = new Connect(window.ethereum);

    const [isSelected, setIsSelected] = useState(false)
    const [selectedFile, setSelectedFile] = useState();

    const changeHandler = (event: any) => {
        let file = event.target.files[0]
        setSelectedFile(file)
        setIsSelected(true)
    };
    
    /*
     go-gin router connection test
     go-gin file server: 172.32.0.1:9010

     API for DB server
    const handleSubmission = () => {
        fetch(`/ping`).then((response) => response.json())
        .then((data) => console.log(data))
    }
    
    API for file server
    const submissionHandler = () => {
        axios
        .get('http://172.32.0.1:9010/ping')
        .then((response: AxiosResponse) => console.log(response))
    }
    */

    const submissionHandler = (address: string) => {
        const formData = new FormData()
        if (isSelected) {
            formData.append('file', selectedFile!)
            console.log(formData)

            fetch("http://172.32.0.1:9010/upload/" + address, {
                method: "POST",
                /*
                headers: {
                    "Content-Type": "multipart/form-data",
                },
                */
                body: formData,
            })
            .then((response) => console.log(response))

            console.log(formData.get('file'))
        }
    }

    if (connect !== undefined && connect.getSigner() !== undefined) {
        return (
            <div>
                <Button variant="contained" component="label"> Upload file
                    <input type="file" name="file" hidden onChange={changeHandler} />
                </Button>
                <div>
                    <Button variant="contained" type="submit" onClick={
                            async () => connect!.getSigner()?.getAddress()
                            .then((address) => submissionHandler(address))                      
                        }>{display}
                    </Button>                
                </div>
            </div>
        )
    }
    return <Alert severity="error">Please connect wallet first.</Alert>
}

export {FileUpload}