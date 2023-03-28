// import { AbstractConnector } from '@web3-react/abstract-connector';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import {
  NoEthereumProviderError,
  UserRejectedRequestError
} from '@web3-react/injected-connector';
import { Contract, ethers, Signer } from 'ethers';
import {  ReactElement, useEffect, useState, MouseEvent, ChangeEvent } from 'react';
// import styled from 'styled-components';
// import { injected } from '../utils/connectors';
// import { useEagerConnect, useInactiveListener } from '../utils/hooks';
import { Provider } from '../utils/provider';
import BasicDutchAuctionArtifact from '../artifacts/contracts/BasicDutchAuction.sol/BasicDutchAuction.json';
import styled from 'styled-components';


// type ActivateFunction = (
//     connector: AbstractConnector,
//     onError?: (error: Error) => void,
//     throwErrors?: boolean
//   ) => Promise<void>;

  function getErrorMessage(error: Error): string {
    let errorMessage: string;
  
    switch (error.constructor) {
      case NoEthereumProviderError:
        errorMessage = `No Ethereum browser extension detected. Please install MetaMask extension.`;
        break;
      case UnsupportedChainIdError:
        errorMessage = `You're connected to an unsupported network.`;
        break;
      case UserRejectedRequestError:
        errorMessage = `Please authorize this website to access your Ethereum account.`;
        break;
      default:
        errorMessage = error.message;
    }
  
    return errorMessage;
  }


  const StyledDeployContractButton = styled.button`
  width: 180px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
  `;

  const StyledButton = styled.button`
  width: 150px;
  height: 2rem;
  border-radius: 1rem;
  border-color: blue;
  cursor: pointer;
  place-self: center;
`;


  export function DeployContract(): ReactElement {
    const context = useWeb3React<Provider>();
    let [reservePrice, setReservePrice] = useState<number>();
    let [auctionBlocks, setAuctionBlocks] = useState<number>();
    let [priceDecrement, setPriceDecrement] = useState<number>();
    const [ basicDutchAuction, setBasicDutchAuction ] = useState<Contract>();
    let [contractAddress, setContractAddress] = useState<string>('');
    const [signer, setSigner] = useState<Signer>();
    const { library, active, error } = context;
    
  
    if (!!error) {
      window.alert(getErrorMessage(error));
    }

    useEffect((): void => {
      if (!library) {
        setSigner(undefined);
        return;
      }
  
      setSigner(library.getSigner());
    }, [library]);

    useEffect((): void => {
      if (!basicDutchAuction) {
        return;
      }
  
      async function getBDA(basicDutchAuction: Contract): Promise<void> {
        // const _greeting = await basicDutchAuction.greet();
  
        // if (_greeting !== greeting) {
        //   setGreeting(_greeting);
        // }
      }
  
      getBDA(basicDutchAuction);
    }, [basicDutchAuction]);
  
    function handleDeployContract(event: MouseEvent<HTMLButtonElement>) {
      event.preventDefault();
  
      // only deploy the Greeter contract one time, when a signer is defined
      // console.log('basicDutchAuction: ', basicDutchAuction);
      // console.log('signer: ', signer);
      if (basicDutchAuction || !signer) {
        return;
      }
  
      async function deployBDAContract(signer: Signer): Promise<void> {
        const BasicDutchAuction = await new ethers.ContractFactory(
          BasicDutchAuctionArtifact.abi,
          BasicDutchAuctionArtifact.bytecode,
          signer
        );

        console.log("Awaiting BasicDutchAuction.deploy");

        if(!reservePrice || !auctionBlocks || !priceDecrement) {
          window.alert('Please enter all the values');
          return;
        }
  
        try {
          const BasicDutchAuctionContract = await BasicDutchAuction.deploy(reservePrice, auctionBlocks, priceDecrement); 
          console.log('BasicDutchAuctionContract: ', BasicDutchAuctionContract);
  
          await BasicDutchAuctionContract.deployed();
  
          // const greeting = await BasicDutchAuctionContract.greet();
  
          setBasicDutchAuction(BasicDutchAuctionContract);
          // setGreeting(greeting);
  
          window.alert(`Basic Dutch Auction deployed to: ${BasicDutchAuctionContract.address}`);
  
          setContractAddress(BasicDutchAuctionContract.address);
        } catch (error: any) {
          window.alert(
            'Error!' + (error && error.message ? `\n\n${error.message}` : '')
          );
        }
      }
  
      deployBDAContract(signer);
    }

    const handleReservePriceChange = (event: any) => {
      setReservePrice(event.target.value);
    }

    const handleAuctionBlocksChange = (event: any) => {
      setAuctionBlocks(event.target.value);
    }

    const handlePriceDecrementChange = (event: any) => {
      setPriceDecrement(event.target.value);
    }


    function LookUpContract(): ReactElement {
      const context = useWeb3React<Provider>();
      const { account, active, library, error } = context;
      let [reservePriceLookUp, setreservePriceLookUp] = useState<number>();
      // let [auctionBlocksLookUp, setAuctionBlocksLookUp] = useState<number>(0);
      let [priceDecrementLookUp, setPriceDecrementLookUp] = useState<number>();
      let [contractAddress, setContractAddress] = useState<string>('');
      let [currentPriceLookUp, setCurrentPrice] = useState<number>();
      let [winner, setWinner] = useState<string>('');
     
      const handleContractAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
        setContractAddress(event.target.value);
      }
  
      const handleGetInfo = async () => {
        const basicDutchAuction = new ethers.Contract(contractAddress, BasicDutchAuctionArtifact.abi, library);
        const reservePriceLookUp = await basicDutchAuction.reservePrice();
        console.log('reservePriceLookUp: ', reservePriceLookUp);
        // const auctionBlocksLookUp = await basicDutchAuction.auctionBlocks();
        const priceDecrementLookUp = await basicDutchAuction.offerPriceDecrement();
        const currentPrice = await basicDutchAuction.currentPrice();
        const winner = await basicDutchAuction.winnerAddress();
        setreservePriceLookUp(reservePriceLookUp.toNumber());
        // setAuctionBlocksLookUp(auctionBlocksLookUp.toNumber());
        setPriceDecrementLookUp(priceDecrementLookUp.toNumber());
        setCurrentPrice(currentPrice.toNumber());
        setWinner(winner);
      }
    
      if (!!error) {
        window.alert(getErrorMessage(error));
      }
    
      return (
          <>
              <>
                  <>
                      <h1> Look Up Contract Details: </h1>
                  </>
                  <div>
                          <label> Deployed contract address: </label>
                          <input onChange={handleContractAddressChange} type="text" value={contractAddress}/>
                          <span>
                              <StyledButton
                                onClick={handleGetInfo}
                              > Show Info</StyledButton>
                          </span>
                  </div>          
              </>
              <>
                  <>
                      <h3> Auction Details: </h3>
                  </>
  
                  <div>
                      <label> Winner: </label>
                      <input type="text" value={winner} readOnly/>
                      <label> Current Price: </label>
                      <input type="text" value={currentPriceLookUp} readOnly/>
                      <label> Reserve Price: </label>
                      <input type="text" value={reservePriceLookUp} readOnly/>
                      {/* <label> Auction Blocks: </label> */}
                      {/* <input type="text" value={auctionBlocksLookUp} readOnly/> */}
                      <label> Price Decrement: </label>
                      <input type="text" value={priceDecrementLookUp} readOnly/>
                  </div>
              </>
          </>
      );
    }




    return (
      <>
          <>
              <h1> Deploy Contract : </h1>
          </>
          <div>
            <label> Reserve Price </label>
            <input type="text" pattern="[0-9]*" onChange={handleReservePriceChange} value={reservePrice} />
            <label> Auction Blocks </label>
            <input type="text" pattern="[0-9]*" onChange={handleAuctionBlocksChange} value={auctionBlocks} />
            <label> Price Decrement </label>
            <input type="text" pattern="[0-9]*" onChange={handlePriceDecrementChange} value={priceDecrement} />
          </div>

          <div>
                <StyledDeployContractButton
                  disabled={!active || !!basicDutchAuction ? true : false}
                  style={{
                    cursor: !active || basicDutchAuction ? 'not-allowed' : 'pointer',
                    borderColor: !active || basicDutchAuction ? 'unset' : 'blue'
                  }}
                  onClick={handleDeployContract}
                > Deploy Basic Dutch Auction</StyledDeployContractButton>
          </div>

          <div>
            <label> Deployed contract address : </label>
            <input type="text" value={contractAddress} readOnly/>
          </div>

          <LookUpContract />
      </>
    );
  }