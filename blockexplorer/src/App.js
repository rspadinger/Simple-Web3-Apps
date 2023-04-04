import { Alchemy, Network } from 'alchemy-sdk';
import { useEffect, useState } from 'react';

import './main.css';
import Block from "./components/block";
import Transactions from "./components/transactions";
import Transaction from "./components/transaction";

const alchemy = new Alchemy({
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
});

function App() {

  const [blockNumber, setBlockNumber] = useState();
  const [blockDetails, setBlockDetails] = useState();
  const [txnDetails, setTxnDetails] = useState();

  return (
      <div className="container">
          <div className='row'>    
            <div className='column'>
              <Block alchemy={alchemy} blockNumber={blockNumber} setBlockNumber={setBlockNumber} 
                blockDetails={blockDetails} setBlockDetails={setBlockDetails} ></Block> 
            </div>
          </div>
          <div className='row'>    
            <div className='column'>
              <Transactions blockNumber={blockNumber} blockDetails={blockDetails}
                txnDetails={txnDetails} setTxnDetails={setTxnDetails}></Transactions>  
            </div>
            <div className='column'>
              <Transaction blockDetails={blockDetails} txnDetails={txnDetails}></Transaction>  
            </div>
          </div>            
      </div>
    )  
}

export default App;
