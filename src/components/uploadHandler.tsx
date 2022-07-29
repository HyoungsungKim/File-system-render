import React, {useState} from 'react';
import { Connect } from './utils';

import { Alert, Button } from '@mui/material';
import type {ButtonProps, SpanProps} from './utils';


let connect: Connect | undefined = undefined;
function FileUpload(props: ButtonProps): JSX.Element {
    let {display, onClick, ...htmlButtonProps}: ButtonProps = props;
    connect = new Connect(window.ethereum);

    const [isSelected, setIsSelected] = useState(false)
    const [selectedFile, setSelectedFile] = useState<File>();

    const changeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
        let file = event.target.files
        if (file) {
            setSelectedFile(file[0])
            setIsSelected(true)
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
                file_name:  selectedFile!.name,
                signature: signature,
                type:       selectedFile!.type,
                URI:        address + "/" + selectedFile!.name,
                size:       selectedFile!.size,
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
                <div>
                    <Button variant="contained" component="label" > Upload file
                        <input type="file" name="file" hidden onChange={changeHandler} />
                    </Button>
                    {isSelected ? (
                            <div>
                                <p>Filename: {selectedFile!.name}</p>
                                <p>FIletype: {selectedFile!.type}</p>
                                <p>Size in bytes: {selectedFile!.size}</p>
                            </div>
                        ) : (
                            <p>Select a file to upload</p>
                        )}
                    <Button variant="contained" type="submit" onClick={
                        () => submissionHandler(connect)
                    }>{display}
                    </Button>                
                </div>
            </div>
        )
    }
    return <Alert severity="error">Please connect wallet first.</Alert>
}

export {FileUpload}