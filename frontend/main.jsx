import React, { useState } from "react";
import { Server } from "@stellar/stellar-sdk";

const server = new Server("https://horizon-testnet.stellar.org");

function App() {
  const [account, setAccount] = useState(null);

  const connectFreighter = async () => {
    if (window.freighter) {
      try {
        const publicKey = await window.freighter.getPublicKey();
        setAccount(publicKey);
        alert("Connected! Public Key: " + publicKey);
      } catch (err) {
        console.error("Error connecting Freighter:", err);
      }
    } else {
      alert("Please install Freighter wallet!");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Campus DAO Wallet</h1>
      {account ? (
        <p>Connected Account: {account}</p>
      ) : (
        <button onClick={connectFreighter}>Connect Freighter</button>
      )}
    </div>
  );
}

export default App;
