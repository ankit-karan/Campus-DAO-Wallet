# 🏫 Campus DAO Wallet: Decentralized Club Governance & Rewards on Stellar

## 🚀 Project Overview: The Digital Campus Economy
**Campus DAO Wallet** is a full-stack, blockchain-based system designed to modernize college club management and boost student engagement. Built on the **Stellar/Soroban** ecosystem, it replaces manual, opaque processes with automated, transparent smart contracts.

The project is divided into two core, interconnected pillars:

| Pillar | Goal | Key Benefit |
| :--- | :--- | :--- |
| **1. Campus DAO (Governance)** | To make college club decisions transparent and democratic. | **✅ Transparent Decisions** & **Automated Fund Usage**. |
| **2. Smart Campus Wallet (Rewards)** | To incentivize student participation and create a cashless campus economy. | **✅ Reward-Based Motivation** & **Cashless Transactions**. |

---

## ✨ Features & Value Proposition

This system offers a powerful value proposition for students, clubs, and administration:

### 1. Decentralized Club Management (DAO)
* **On-Chain Voting:** Each college club operates as a mini-DAO, where members use their wallet address to **create and vote on proposals** (events, budgets, resources) directly on the blockchain.
* **Trust & Transparency:** Every vote, proposal, and approval is **publicly recorded on the blockchain**, guaranteeing accountability and preventing misuse of funds or disputes.
* **Automation:** Approved proposals are **automatically executed** by the smart contract (e.g., releasing funds), eliminating manual approvals and paperwork.

### 2. Tokenized Rewards & Payments
* **Earn Tokens:** Students earn custom CAMPUS tokens for key participation activities (attending events, hackathons, volunteering).
* **Spend Tokens:** Tokens can be spent instantly for campus goods and services:
    * Canteen Food 🍕
    * Event Passes/Workshops 🎟️
    * College Merchandise 👕
* **Future-Ready:** Provides students with **hands-on experience** in DeFi, smart contracts, and digital asset management.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Blockchain** | **Stellar Testnet** | Fast, low-cost, and transparent transaction base. |
| **Smart Contracts** | **Soroban** (Stellar Smart Contracts) | Executes DAO governance and Wallet reward logic. |
| **Contract Language** | **Rust** | Used to write the secure, efficient Soroban contracts. |
| **Frontend/UI** | **React / JavaScript** | Student and Admin web interface for wallets, voting, and proposals. |
| **CLI** | **Soroban CLI** | Tool for local contract build, deployment, and testing. |

---

## ⚙️ Installation & Setup (Local Development)

### Prerequisites
1.  **Rust & Cargo:** Install the latest stable version of Rust via `rustup`.
2.  **Soroban Targets:** Add the necessary WebAssembly targets for contract compilation:
    ```bash
    rustup target add wasm32-unknown-unknown
    rustup target add wasm32v1-none
    ```
3.  **Soroban CLI:** Install the command-line tool for deployment and interaction:
    ```bash
    cargo install soroban-cli --force
    ```

### Contract Deployment
1.  **Navigate & Build:** Build both contracts to generate their WASM binaries.
    ```bash
    # Build DAO
    cd contracts/campus_dao && cargo build --target wasm32v1-none --release

    # Build Wallet
    cd ../campus_wallet && cargo build --target wasm32v1-none --release
    ```
2.  **Deploy & Fund:** Follow the deployment guide to get your **Contract IDs** and fund your Admin account.
3.  **Initialize:** Run the initialization commands, linking the DAO to the Wallet Contract ID (which acts as the token treasury).

### Frontend Setup
1.  **Update IDs:** Replace the placeholder Contract IDs in `frontend/src/App.jsx`.
2.  **Install Dependencies:**
    ```bash
    cd frontend && npm install
    ```
3.  **Run Application:**
    ```bash
    npm run dev
    ```

The application will now run locally, connecting to your live deployed contracts on the Stellar Testnet.

---

## 🤝 Contribution

We welcome contributions! Please open an issue to discuss a feature or bug fix before submitting a pull request.

## 📜 License

This project is licensed under the MIT License - see the `LICENSE.md` file for details.

The following video shows how to create a good `README.md` file for your GitHub repository: [ReadMe Template for Github Repos](https://www.youtube.com/watch?v=eVGEea7adDM).
http://googleusercontent.com/youtube_content/1
