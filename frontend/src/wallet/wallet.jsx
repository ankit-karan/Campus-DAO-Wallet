import React, { useState } from "react";
import { Server, Keypair, TransactionBuilder, Networks, Operation } from "stellar-sdk";

const server = new Server("https://horizon-testnet.stellar.org"); // Testnet

export default function Wallet({ onConnect }) {
  const [secret, setSecret] = useState("");
  const [publicKey, setPublicKey] = useState("");
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  // Connect wallet with secret key (demo only)
  const connectWallet = async () => {
    const s = prompt("Paste your Stellar SECRET key (Testnet only):");
    if (!s) return;
    if (!s.startsWith("S")) {
      alert("Invalid secret key!");
      return;
    }

    setSecret(s);
    const kp = Keypair.fromSecret(s);
    setPublicKey(kp.publicKey());
    await loadBalance(kp.publicKey());

    // notify parent App about connected wallet
    if (onConnect) onConnect(kp.publicKey());
    alert("Wallet connected: " + kp.publicKey());
  };

  // Load balance from Stellar testnet
  const loadBalance = async (pub) => {
    setLoading(true);
    try {
      const account = await server.loadAccount(pub);
      const native = account.balances.find(b => b.asset_type === "native");
      setBalance(native ? native.balance : 0);
    } catch (err) {
      console.error(err);
      alert("Account not found on Testnet. Fund it using Friendbot.");
      setBalance(0);
    }
    setLoading(false);
  };

  // Send XLM
  const sendPayment = async () => {
    if (!secret) return alert("Connect wallet first!");
    const kp = Keypair.fromSecret(secret);
    const destination = prompt("Enter destination public key (G...)");
    const amount = prompt("Amount XLM to send");

    if (!destination || !amount) return;

    try {
      setLoading(true);
      const source = await server.loadAccount(kp.publicKey());
      const fee = await server.fetchBaseFee();

      const tx = new TransactionBuilder(source, {
        fee: fee.toString(),
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(Operation.payment({
          destination,
          asset: { type: "native" },
          amount: amount.toString(),
        }))
        .setTimeout(30)
        .build();

      tx.sign(kp);
      await server.submitTransaction(tx);
      alert(`Transaction successful! Sent ${amount} XLM to ${destination}`);
      await loadBalance(kp.publicKey());
    } catch (err) {
      console.error(err);
      alert("Transaction failed. See console.");
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    setSecret("");
    setPublicKey("");
    setBalance(0);
    alert("Wallet disconnected");
  };

  return (
    <div style={{ padding: 20, border: "1px solid #ccc", borderRadius: 8 }}>
      <h3>💳 Stellar Wallet (Testnet Demo)</h3>
      <div>
        <strong>Public Key:</strong> {publicKey || "—"}
      </div>
      <div>
        <strong>Balance:</strong> {loading ? "Loading..." : balance} XLM
      </div>
      <div style={{ marginTop: 10 }}>
        {!publicKey ? (
          <button onClick={connectWallet} disabled={loading}>
            Connect Wallet
          </button>
        ) : (
          <>
            <button onClick={sendPayment} disabled={loading}>Send XLM</button>{" "}
            <button onClick={disconnect}>Disconnect</button>
          </>
        )}
      </div>
      <p style={{ color: "red", marginTop: 10 }}>
        ⚠️ Security Warning: Do NOT use real mainnet secret keys. Testnet only.
      </p>
    </div>
  );
}
