const Transactions = ({blockNumber, blockDetails, txnDetails, setTxnDetails}) => {
    
    const onTxnClick = async (hash) => { 
        setTxnDetails(hash);
    }

    const getTransactions = () => {
        if(blockDetails){
            let res = blockDetails.transactions.map(txn => (
                <div style={{marginBottom: "10px"}} key={txn.hash}><label onClick={() => onTxnClick(txn.hash)}>{txn.hash}</label></div>
            ))
            return res.slice(0, 10)            
        }
    }

    return (
        <div >
            { blockDetails &&
                <div>
                    <h3>The first 10 transactions for block number: {blockNumber}</h3> 
                    {getTransactions()}
                </div>
            } 
        </div> 
    )
}

export default Transactions