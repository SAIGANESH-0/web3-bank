import { useEffect, useState } from "react";
import Web3 from "web3";
import abi from "../public/Bank.json";

const contractAddress = "0xE9661f82eA0c64772590D199ab4B8016851F485B";

// replace with your contract address

export default function Home() {
  const [web3, setWeb3] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [contract, setContract] = useState(null);

  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [deposit, setDeposit] = useState(0);
  const [withdraw, setWithdraw] = useState(0);

  // Connect to MetaMask and fetch trans on page load

  useEffect(() => {
    async function connectToMetaMask() {
      if (typeof window.ethereum !== "undefined") {
        try {
          const web3 = new Web3(window.ethereum);
          await window.ethereum.request({ method: "eth_requestAccounts" });
          const accounts = await web3.eth.getAccounts();
          const selectedAddress = accounts[0];

          const networkId = await web3.eth.net.getId();
          if (networkId != 11155111) {
            alert("Please switch to Sepolia testnet to use");
            return;
          }

          setWeb3(web3);
          setSelectedAddress(selectedAddress);

          const contract = new web3.eth.Contract(abi.abi, contractAddress);
          setContract(contract);

          setLoading(true);

          const trans = await contract.methods
            .getTransactions()
            .call({ from: selectedAddress });
          setTransactions(trans);

          let bal = await contract.methods.balanceOf(selectedAddress).call();
          bal = web3.utils.fromWei(bal, "ether");
          setBalance(bal);

          setLoading(false);
        } catch (error) {
          console.error(error);
        }
      }
    }
    connectToMetaMask();
  }, []);

  //deposit

  async function handleDeposit() {
    // Deposit the specified amount
    const amountInWei = web3.utils.toWei(deposit, "ether");

    setLoading(true);

    await contract.methods
      .deposit()
      .send({ from: selectedAddress, value: amountInWei });

    // Reload the user's balance and transactions

    const trans = await contract.methods
      .getTransactions()
      .call({ from: selectedAddress });
    setTransactions(trans);

    let bal = await contract.methods.balanceOf(selectedAddress).call();
    bal = web3.utils.fromWei(bal, "ether");
    setBalance(bal);
    setDeposit(0);

    setLoading(false);
  }

  //withdraw

  async function handleWithdraw() {
    // Withdraw the specified amount
    const amountInWei = web3.utils.toWei(withdraw, "ether");

    setLoading(true);

    await contract.methods
      .withdraw(amountInWei)
      .send({ from: selectedAddress });

    // Reload the user's balance and transactions

    const trans = await contract.methods
      .getTransactions()
      .call({ from: selectedAddress });
    setTransactions(trans);

    let bal = await contract.methods.balanceOf(selectedAddress).call();
    bal = web3.utils.fromWei(bal, "ether");

    setBalance(bal);
    setWithdraw(0);
    setLoading(false);
  }

  return (
    <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 min-h-screen min-w-full flex flex-col justify-center items-center">
      {loading ? (
        <div className="absolute top-0 bottom-0 left-0 right-0 flex items-center justify-center z-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="animate-spin h-16 w-16 text-white"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-4  w-full flex flex-col justify-center items-center">
          <h1 className="text-3xl text-center font-bold mb-3">Bank App</h1>
          {selectedAddress ? (
            <>
              <p className="text-xl text-center text-white font-semibold mt-4 mb-4">
                Connected to MetaMask with address :
              </p>
              <p className="text-base text-center text-black font-semibold mb-4">
                {selectedAddress}
              </p>
            </>
          ) : (
            <button
              onClick={() =>
                window.ethereum.request({ method: "eth_requestAccounts" })
              }
              className="bg-blue-500  text-white mt-4 font-semibold py-2 px-4 rounded-full hover:bg-indigo-500 hover:text-black transition-colors duration-300 ease-in-out mb-3"
            >
              Connect to MetaMask
            </button>
          )}
          <p className="text-xl text-center text-black font-semibold mt-4 mb-8">
            Sepolia Eth Balance :{" "}
            <span className="text-white">{balance} ETH</span>
          </p>

          <div className=" mb-8">
            <h2 className="text-xl font-semibold mb-2">Deposit :</h2>
            <div className="flex items-center">
              <input
                type="number"
                value={deposit}
                onChange={(e) => setDeposit(e.target.value)}
                className="border border-gray-400 rounded-lg p-2 mr-2 w-48"
              />
              <button
                onClick={handleDeposit}
                className="bg-green-500 hover:bg-green-600 text-white rounded-lg px-4 py-2"
              >
                Deposit
              </button>
            </div>
          </div>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Withdraw :</h2>
            <div className="flex items-center">
              <input
                type="number"
                value={withdraw}
                onChange={(e) => setWithdraw(e.target.value)}
                className="border border-gray-400 rounded-lg p-2 mr-2 w-48"
              />
              <button
                onClick={handleWithdraw}
                className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-4 py-2"
              >
                Withdraw
              </button>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-3">Transaction History</h2>
            <table className="table-auto">
              <thead>
                <tr className="bg-gray-200  text-gray-700">
                  <th className="border py-2 px-4">Number</th>
                  <th className="border py-2 px-4">Amount</th>
                  <th className="border py-2 px-4">Transaction</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, index) => (
                  <tr key={index} className="border">
                    <td className="border py-2 px-4">{index + 1}</td>
                    <td className="border py-2 px-4">
                      {web3.utils.fromWei(tx.amount, "ether")} ETH
                    </td>
                    <td className="border py-2 px-4">
                      {tx.isDeposit ? "Deposited" : "Withdrawn"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
