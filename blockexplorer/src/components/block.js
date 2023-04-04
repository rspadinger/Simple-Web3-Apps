const Block = ({alchemy, blockNumber, setBlockNumber, blockDetails, setBlockDetails}) => {

    const onBlockDetailsPressed = async () => {        
        let parsedBlockNumber = parseInt(blockNumber);
        if (isNaN(parsedBlockNumber)) {
            parsedBlockNumber = await alchemy.core.getBlockNumber()
        }

        setBlockNumber(parsedBlockNumber);

        let block = await alchemy.core.getBlockWithTransactions (parsedBlockNumber)
        setBlockDetails(block)
    }

    return (
        <div  >
            <b>Provide a block number or simply click the button to get the latest block number: &nbsp;</b>
            <input
                    type="text"
                    placeholder="Block number..."
                    onChange={(e) => setBlockNumber(e.target.value)}
                /> &nbsp;
            <button id="mintButton" onClick={onBlockDetailsPressed}>Get Block Details</button>
            <br/><br/>
            {blockDetails && 
                <b>Hash: {blockDetails.hash}</b>            
            }            
        </div>
    )
}

export default Block