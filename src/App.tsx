import React from 'react';
import logo from './logo.svg';
import './App.css';
import { ConnectAccount } from './components/accountHandler'
import {FileUpload} from './components/uploadHandler'

function App() {
  return (
    <div className="App">
      <ConnectAccount display="Connect Account" />
      <FileUpload display="Upload"/>
    </div>
  );
}

export default App;
