import ERC721ContractInfo from './contract/ERC721/MyNFT.json';
import ERC721Metdata from './contract/ERC721/testdata.json';
import { Connect } from './utils';
import {Contract, ContractFactory} from 'ethers';
import type {ButtonProps, SpanProps} from './utils';

let connect: Connect | undefined = undefined
const admin = "0x6bB4353b050CF2D36461ae2dfA9e4a78C098F736"

function Form(labelSrc: string, elementId: string|undefined = undefined, value: string|undefined = undefined): JSX.Element {
    return (
        <form>
            <label>
                {labelSrc}:<br />
                <input id={elementId} type="text" defaultValue={value}/>
            </label>
        </form>
    )
}

function ERC721Handler(props: ButtonProps): JSX.Element {
    let {display, onClick, ...htmlButtonProps}: ButtonProps = props;
    connect = new Connect(window.ethereum)
    
    const abi = ERC721ContractInfo.abi;
    const bytecode = ERC721ContractInfo.bytecode;

    let statusMonitor: HTMLSpanElement;
    let sendTokenButton: HTMLButtonElement;
    
    let URIInput: HTMLInputElement;
    let nameInput: HTMLInputElement;
    let symbolInput: HTMLInputElement;
    let toAddressInput: HTMLInputElement;

    let contract: Contract;

    let addressMap: {[key: string]: number[]} = {};

    async function deployButtonHandler() {
        let signer = connect?.getSigner();
        const factory = new ContractFactory(abi, bytecode, signer);        
        statusMonitor = document.getElementById("NFTstatus") as HTMLSpanElement;
        sendTokenButton =  document.getElementById("NFTsendTokenButton") as HTMLButtonElement;

        URIInput = document.getElementById("URI") as HTMLInputElement;
        nameInput = document.getElementById("NFTname") as HTMLInputElement;
        symbolInput = document.getElementById("NFTsymbol") as HTMLInputElement;

        toAddressInput = document.getElementById("NFTtoAddress") as HTMLInputElement;

        try {
            const name = nameInput.value;
            const symbol = symbolInput.value;

            contract = await factory.deploy(name, symbol);
            statusMonitor.innerHTML = "Deploying";

            await contract.deployTransaction.wait();
            statusMonitor.innerHTML = "Deployed";

            console.log(`Contract mined! address: ${contract.address} transactionHash: ${contract.deployTransaction}`);
            sendTokenButton.disabled = false;
        } catch(err) {
            console.error(err);
            statusMonitor.innerHTML = `Deploy failed, ${(err as Error).message}`;
        }
    }

    async function mintERC721() {
        try {
            const URI = URIInput.value;
            const toAddress = toAddressInput.value;
            
            const mintingResult = await contract.mintNFT(toAddress, URI)
            mintingResult.wait();
            statusMonitor.innerHTML = `Minting Success`;
            let NFTId: any;

            contract.on("Transfer", (from, to, tokenId) => {        
                console.log("From:", from);
                console.log("To:",to);
                console.log("TokenId:", tokenId);

                if (addressMap[toAddress]) {
                    addressMap[toAddress].push(tokenId);
                } else {
                    addressMap[toAddress] = [tokenId];
                } 

                console.log(addressMap[toAddress]);
            })
        } catch(err) {
            console.error(err);
            statusMonitor.innerHTML = `Minting failed, ${(err as Error).message}`;
        }
    }

    return (
        <div>
            <span id="NFTstatus">Click deploy</span><br />            
            <div>
                <button {...htmlButtonProps} onClick={deployButtonHandler}>Deploy(Minting token)</button>
                <div>
                    {Form("Name", "NFTname")}
                    {Form("Symbol", "NFTsymbol")}
                </div><br />

                <button {...htmlButtonProps} id="NFTsendTokenButton" onClick={mintERC721}>Mint token</button>
                <div>
                    {Form("URI", "URI")}
                    {Form("Mint To", "NFTtoAddress")}
                </div>
            </div>
        </div>
    )
}

export {ERC721Handler}