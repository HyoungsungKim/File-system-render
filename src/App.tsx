import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ConnectAccount } from './components/accountHandler'
import {FileUpload} from './components/uploadHandler'
import {ViewFiles} from './components/fileViewHandler'
import {ERC721Handler} from './components/NFTmintingHandler'

function App() {
  return (
    <div className="App">
      <ConnectAccount display="Connect Account" />
      <FileUpload display="Upload"/>
      <ViewFiles display="View Files"/>
      <ERC721Handler display="Mint NFT"/>
    </div>
  );
}

export default App;
