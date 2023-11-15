// SPDX-License-Identifier: MIT

//Chainlink Upkeeps: https://automation.chain.link/sepolia/73290858071747945597402516458153161102617601238253258976338842749689606969428
//Chainlink VRF: https://vrf.chain.link/sepolia/1882
//LINK Faucet: https://faucets.chain.link/

//TEST: 1: update price on MockV3Aggregator : call updateAnswer : 3000000000000
//      2: call performUpkeep [] on Bull&Bear contract 
//      3: call tokenURI 0 on Bull&Bear contract to check if image changed

//MockV3Aggregator on Sepolia: 0x55B4463a87d17b40Ed68A7CC225Eb8884117d1F5
//Depl on Sepolia with Mock Price Feed: 0x9B9f577D5c38f8e5D122E4c9e9785f62c427A909

// Keeper: check BTC/USD price periodically => if price increases => request random number => change image of NFT

//Create Compatible (automation) contract: https://docs.chain.link/chainlink-automation/compatible-contracts
//Register custom logic: https://docs.chain.link/chainlink-automation/register-upkeep
//Other automation examples (EthBalanceMonitor & Dynamic NFTs): https://docs.chain.link/chainlink-automation/util-overview

//Price Feeds: https://docs.chain.link/data-feeds/price-feeds/addresses#Sepolia%20Testnet
//Test LINK: https://faucets.chain.link/

//Chainlink VRF: https://docs.chain.link/vrf/v2/introduction
//VRF direct funding: https://docs.chain.link/vrf/v2/direct-funding/
//VRF direct funding example: https://docs.chain.link/vrf/v2/direct-funding/
//VRF subscription: https://docs.chain.link/vrf/v2/subscription
//VRF subscr example: https://docs.chain.link/vrf/v2/subscription/examples/get-a-random-number
//VRF subscr manager: https://vrf.chain.link/

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

// Chainlink Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";
import "hardhat/console.sol";

// Chainlink VRF
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/shared/access/ConfirmedOwner.sol";

//KeeperCompatibleInterface, Ownable
contract BullBear is ERC721, ERC721Enumerable, ERC721URIStorage, 
    AutomationCompatibleInterface,
    VRFConsumerBaseV2, ConfirmedOwner {
    
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    AggregatorV3Interface public pricefeed;    
    uint public interval; 
    uint public lastTimeStamp;
    int256 public currentPrice;

    string[] bullUrisIpfs = [
        "https://ipfs.io/ipfs/QmexMA23m89cZwBUxYaje5RCfJy6DWeceM3p251y3yEo46?filename=gamer_bull.json",
        "https://ipfs.io/ipfs/QmbTBLicYU5rbSdVr4mvvMYapLYEDT9XMziFZSnBZEoN6C?filename=party_bull.json",
        "https://ipfs.io/ipfs/QmYtAAeMVKTJmPF9NHvVbaJHTmRUzWnXnyDGCU9Cybvk5c?filename=simple_bull.json"
    ];    string[] bearUrisIpfs = [
        "https://ipfs.io/ipfs/QmaUtxeJdV91efdEP6JsurecU4yWasscKsVSkWJnmtbWqi?filename=beanie_bear.json",
        "https://ipfs.io/ipfs/QmY3KUHryfTGj55v5d6gQdN9yCzNHHhxb65QniTKGeJz19?filename=coolio_bear.json",
        "https://ipfs.io/ipfs/QmdDdPAHX6BLaYx17BHpiJ4tp7XPEmKDGY9RRf2LuxnPys?filename=simple_bear.json" ];   
    
    //VRF equest
    struct RequestStatus {
        bool fulfilled; 
        bool exists; 
        uint256[] randomWords;
    }
    
    mapping(uint256 => RequestStatus) public s_requests; 
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId; //VRF subscription Id: 1882

    uint256[] public requestIds;
    uint256 public lastRequestId;

    // The gas lane to use, which specifies the maximum gas price to bump to.
    // List of available gas lanes: https://docs.chain.link/docs/vrf/v2/subscription/supported-networks/#configurations
    bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c;

    // Depends on the number of requested values that you want sent to the
    // fulfillRandomWords() function. Storing each word costs about 20,000 gas.
    // Test and adjust this limit based on the network that you select, the size of the request,
    // and the processing of the callback request in  fulfillRandomWords()
    uint32 callbackGasLimit = 300000;

    // The default is 3, but you can set this higher.
    uint16 requestConfirmations = 3;

    // Cannot exceed VRFCoordinatorV2.MAX_NUM_WORDS.
    uint32 numWords = 1;

    event TokensUpdated(string marketTrend);
    event RequestSent(uint256 requestId, uint32 numWords);
    event RequestFulfilled(uint256 requestId, uint256[] randomWords);

    //SEPOLIA COORDINATOR: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625 => see: https://vrf.chain.link/
    constructor() ERC721("Bull&Bear", "BBTK") 
        VRFConsumerBaseV2(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625)
        ConfirmedOwner(msg.sender) {
        
        //update interval & priceFeed contract address => we use some constants => could be added as args to the constructor
        interval = 10;
        //BTC/USD Sepolia: 0x1b44F3514812d835EB1BDB0acB33d3fA3351Ee43 
        //My MockV3Aggregator on Sepolia (for easier testing): 0x55B4463a87d17b40Ed68A7CC225Eb8884117d1F5
        pricefeed = AggregatorV3Interface(0x55B4463a87d17b40Ed68A7CC225Eb8884117d1F5);

        lastTimeStamp = block.timestamp;
        currentPrice = 3000000000000; // getLatestPrice();

        //VRF COORDINATOR for Sepolia: 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625
        COORDINATOR = VRFCoordinatorV2Interface(0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625);
        s_subscriptionId = 1882; // see: https://vrf.chain.link/
    }

    //TODO make this internal
    function requestRandomWords() public returns (uint256 requestId)
    {
        // Will revert if subscription is not set and funded.
        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        s_requests[requestId] = RequestStatus({
            randomWords: new uint256[](0),
            exists: true,
            fulfilled: false
        });
        requestIds.push(requestId);
        lastRequestId = requestId;
        emit RequestSent(requestId, numWords);
        return requestId;
    }

    //callback function for requestRandomWords =>  VRF returns the random values to the contract via this function.
    //once we receive those values, we can execute our custom logic => updating the tokenURI's of our NFT's
    function fulfillRandomWords(uint256 _requestId, uint256[] memory _randomWords) internal override {
        require(s_requests[_requestId].exists, "request not found");
        s_requests[_requestId].fulfilled = true;
        s_requests[_requestId].randomWords = _randomWords;
        emit RequestFulfilled(_requestId, _randomWords);

        //custom logic => return 0, 1 or 2 and call updateTokenUris()
         uint newTokenId = _randomWords[0] % 3;
        updateTokenUris(newTokenId);
    }
    
    function updateTokenUris(uint newTokenId) internal {
        if ((block.timestamp - lastTimeStamp) > interval ) {
            lastTimeStamp = block.timestamp;         
            int latestPrice =  getLatestPrice();
        
            if (latestPrice == currentPrice) {
                console.log("NO CHANGE -> returning!");
                return;
            }

            if (latestPrice < currentPrice) {
                // bear
                console.log("ITS BEAR TIME");
                updateAllTokenUris("bear", newTokenId);

            } else {
                // bull
                console.log("ITS BULL TIME");
                updateAllTokenUris("bull", newTokenId);
            }

            // update currentPrice
            currentPrice = latestPrice;
        } else {
            console.log(" INTERVAL NOT UP!");
            return;
        }       
    }

    function getRequestStatus(uint256 _requestId) external view returns (bool fulfilled, uint256[] memory randomWords) {
        require(s_requests[_requestId].exists, "request not found");
        RequestStatus memory request = s_requests[_requestId];
        return (request.fulfilled, request.randomWords);
    }

    function safeMint(address to) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        
        string memory defaultUri = bullUrisIpfs[0];
        _setTokenURI(tokenId, defaultUri);

        console.log("DONE!!! minted token ", tokenId, " and assigned token url: ", defaultUri);
    }

    //The custom logic upkeek calls this function, before calling the performUpkeep function --- we dont need checkData
    function checkUpkeep(bytes calldata /* checkData */) external view override returns (bool upkeepNeeded, bytes memory /*performData */) {
         upkeepNeeded = (block.timestamp - lastTimeStamp) > interval;
    }

    //we can call this manually for testing => for automation, register an upkeep: https://automation.chain.link/new-custom-logic
    //https://docs.chain.link/chainlink-automation/register-upkeep
    //we dont need performData
    function performUpkeep(bytes calldata /* performData */ ) external override {
        if ((block.timestamp - lastTimeStamp) > interval ) {
            int latestPrice =  getLatestPrice();
        
            if (latestPrice == currentPrice) {
                console.log("NO CHANGE -> returning!");
                return;
            }

            //time is up and conditions for tokenURI change are met (price increased or decreased)
            requestRandomWords();            
        } else {
            console.log("INTERVAL NOT UP!");
            return;
        }       
    }

    // Helpers
    function getLatestPrice() public view returns (int256) {
         (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = pricefeed.latestRoundData();

        return price; //  example price returned 3000000000000
    }
  
    function updateAllTokenUris(string memory trend, uint tokenIndex) internal {        
        if (compareStrings("bear", trend)) {
            console.log(" UPDATING TOKEN URIS WITH ", "bear", trend);
            //TODO careful, this could be very expensive
            for (uint i = 0; i < _tokenIdCounter.current() ; i++) {
                _setTokenURI(i, bearUrisIpfs[tokenIndex]);
            } 
            
        } else {     
            console.log(" UPDATING TOKEN URIS WITH ", "bull", trend);

            for (uint i = 0; i < _tokenIdCounter.current() ; i++) {
                _setTokenURI(i, bullUrisIpfs[tokenIndex]);
            }  
        }   
        emit TokensUpdated(trend);
    }

    function setPriceFeed(address newFeed) public onlyOwner {
        pricefeed = AggregatorV3Interface(newFeed);
    }
    
    function setInterval(uint256 newInterval) public onlyOwner {
        interval = newInterval;
    }    

    function compareStrings(string memory a, string memory b) internal pure returns (bool) {
        return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
    }

    // The following functions are overrides required by Solidity.
    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}