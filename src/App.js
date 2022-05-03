import myEpicNft from "./utils/MyEpicNFT.json";
import { ethers } from "ethers";
import React, { useEffect, useState } from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
// import React from "react";

// Constantsを宣言する: constとは値書き換えを禁止した変数を宣言する方法です。
const TWITTER_HANDLE = 'edi_0000';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = '';
const TOTAL_MINT_COUNT = 50;
const CONTRACT_ADDRESS = "0x3C073eAeD053089A62DB7d00118D41c5B7755e23";
const RARIBLE_URL_ADDRESS = `https://rinkeby.rarible.com/collection/${CONTRACT_ADDRESS}/items`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [currentTokenId, setCurrentTokenId] = useState("");
  const [isOnRinkeby, setIsOnRinkeby] = useState("");
  const [isDuringMint, setIsDuringMint] = useState("");

  console.log("currentAccount: ", currentAccount);

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Make sure you have MetaMask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !==0 ) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      // const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        provider
      );
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);

      setupEventListener();

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
        setIsOnRinkeby("n");
        console.log("isOnRinkeby:", isOnRinkeby);
      } else {
        const tokenId = await connectedContract.getCurrentTokenId() 
        setCurrentTokenId(tokenId)
        console.log("CurrentTokenId:", tokenId);
        setIsOnRinkeby("y");
        console.log("isOnRinkeby:", isOnRinkeby);
      }
    } else {
      console.log("No authorized account found");
    }
  };

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(ethereum);
      // const signer = provider.getSigner();
      const connectedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicNft.abi,
        provider
      );

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);

      setCurrentAccount(accounts[0]);

      setupEventListener();

      let chainId = await ethereum.request({ method: "eth_chainId" });
      console.log("Connected to chain " + chainId);
      const rinkebyChainId = "0x4";
      if (chainId !== rinkebyChainId) {
        alert("You are not connected to the Rinkeby Test Network!");
        setIsOnRinkeby("n");
        console.log("isOnRinkeby:", isOnRinkeby);
      } else {
        const tokenId = await connectedContract.getCurrentTokenId() 
        setCurrentTokenId(tokenId)
        setIsOnRinkeby("y");
        console.log("isOnRinkeby:", isOnRinkeby);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const setupEventListener = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `あなたのウォレットにNFTを送信しました。OpenSeaに表示されるまで最大で10分かかることがあります。NFTへのリンクはこちらです：https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });
        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  }

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNft.abi,
          signer
        );
        console.log("Going to pop wallet now to pay gas...");
        setIsDuringMint("y");
        let nftTxn = await connectedContract.makeAnEpicNFT({ value: ethers.utils.parseEther("0.001")});
        console.log("Mining...please wait.");
        await nftTxn.wait();
        setIsDuringMint("n");

        const tokenId = await connectedContract.getCurrentTokenId() 
        setCurrentTokenId(tokenId)
        console.log("CurrentTokenId:", tokenId);

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      setIsDuringMint("n");
      console.log(error);
    }
  };

  // renderNotConnectedContainer メソッドを定義します。
  const renderNotConnectedContainer = () => (
    <button onClick={connectWallet} className="cta-button connect-wallet-button">
      Connect to Wallet
    </button>
  );

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            あなただけの特別な NFT を Mint しよう💫
          </p>
          {currentAccount === "" ? (
            renderNotConnectedContainer()
          ) : (isOnRinkeby === "y" ? (
                isDuringMint === "y" ? (
                  <center>
                    <div className="loading-icon"></div>
                    <br></br>
                  </center>
                ) : (
                <button onClick={askContractToMintNft} className="cta-button connect-wallet-button">
                  Mint NFT
                </button>
                )
              ) : (
              <div className="sub-text">
                Rinkebyに接続してください
              </div>
              )
          )}
          {currentAccount === "" ? (
            <div></div>
          ) : ( isOnRinkeby === "y" ? (
              <div className="sub-text">
                これまでに作成された{currentTokenId}/{TOTAL_MINT_COUNT}NFT
              </div>
            ) : (<div></div>)
          )}
          <br></br>
          <a className="button cta-button" href={RARIBLE_URL_ADDRESS}>Rarible でコレクションを表示</a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
