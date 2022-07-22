import React, {useState} from 'react';
import { Connect } from './utils';
import type {ButtonProps, SpanProps} from './utils';

function FileUpload(props: ButtonProps): JSX.Element {
    let {display, onClick, ...htmlButtonProps}: ButtonProps = props;

    const [_, setIsSelected] = useState(false)
    const [selectedFile, setSelectedFile] = useState();
    const [isFilePicked, setIsFilePicked] = useState(false);

    const changeHandler = (event: any) => {
        setSelectedFile(event.target.files[0])
        setIsSelected(true)
        //console.log(event.target.files[0])
    };
    
    /*
     go-gin router connection test
     go-gin server: 172.32.0.1:9010
    const handleSubmission = () => {
        fetch(`/ping`).then((response) => response.json())
        .then((data) => console.log(data))
    }
    */

    return (
        <div>
            <input type="file" name="file" onChange={changeHandler} />
            <div>
                <button {...htmlButtonProps} type="submit" onClick={handleSubmission}>{display}</button>                
            </div>
        </div>
    )
}

export {FileUpload}