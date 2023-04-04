const Transaction = ({blockDetails, txnDetails}) => {
    
    const getTransactionDetails = () => {
        if(blockDetails){
            var txn = blockDetails.transactions.find(item => item.hash === txnDetails);
            
            if(txn){
                return (
                    <div style={{fontSize: "14px", marginBottom: "10px"}}>
                        <div style={{marginBottom: "10px"}} ><label>Txn hash: {txn.hash}</label></div>
                        <div style={{marginBottom: "10px"}} ><label>Txn type: {txn.type}</label></div>
                        <div style={{marginBottom: "10px"}} ><label>txn index: {txn.transactionIndex}</label></div>
                        <div style={{marginBottom: "10px"}} ><label>Block hash: {txn.blockHash}</label></div>
                        <div style={{marginBottom: "10px"}} ><label>Block Number: {txn.blockNumber}</label></div>
                    </div>
                )
            }       
        }
    }

    return (
        <div >
            { txnDetails && 
                <div>
                    <h3>Transaction Details:</h3>
                    {getTransactionDetails()}
                </div>
            }            
        </div>
    )
}

export default Transaction