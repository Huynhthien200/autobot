import { useState, useEffect } from "react";
import Web3 from "web3";

const UNISWAP_V2_ROUTER = "0xfb8e1c3b833f9e67a71c859a132cf783b645e436";
const WMON_ADDRESS = "0x760AfE86e5de5fa0Ee542fc7B7B713e1c5425701";
const PDC_ADDRESS = "0x083978Dd12842779e907472A331314190730a5Bf";

export default function Home() {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const web3Instance = new Web3(window.ethereum);
      setWeb3(web3Instance);
    }
  }, []);

  const connectWallet = async () => {
    if (!web3) return alert("Vui lòng cài đặt MetaMask!");
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(accounts[0]);
  };

  const swapToken = async (amount, increasePrice) => {
    if (!web3 || !account) return alert("Vui lòng kết nối ví!");
    setIsSwapping(true);

    try {
      const router = new web3.eth.Contract(UNISWAP_V2_ROUTER_ABI, UNISWAP_V2_ROUTER);
      const deadline = Math.floor(Date.now() / 1000) + 300;
      const amountInWei = web3.utils.toWei(amount.toString(), "ether");

      let tx;
      if (increasePrice) {
        tx = await router.methods.swapExactETHForTokens(0, [WMON_ADDRESS, PDC_ADDRESS], account, deadline).send({
          from: account,
          value: amountInWei,
        });
      } else {
        tx = await router.methods.swapExactTokensForETH(amountInWei, 0, [PDC_ADDRESS, WMON_ADDRESS], account, deadline).send({
          from: account,
        });
      }

      alert(`Giao dịch thành công! TX Hash: ${tx.transactionHash}`);
    } catch (error) {
      console.error("Lỗi swap:", error);
      alert("Lỗi khi thực hiện swap!");
    }

    setIsSwapping(false);
  };

  const scheduleAutoPriceMovement = () => {
    if (schedule) clearInterval(schedule);
    let t = 0;
    const newSchedule = setInterval(() => {
      let amount = Math.abs(Math.sin(t) * Math.cos(t) * 3) + 0.1; // Dao động lượng swap nhưng tối đa 3 MON
      amount = Math.min(amount, 3); // Giới hạn tối đa 3 MON
      const increasePrice = Math.sin(t) > 0; // Tăng hoặc giảm theo chu kỳ
      swapToken(amount, increasePrice);
      t += Math.PI / 30; // Cập nhật mỗi giây
    }, 1000);
    setSchedule(newSchedule);
    alert("Đã kích hoạt tự động đẩy giá mỗi giây trong 1 tuần!");
    setTimeout(() => clearInterval(newSchedule), 7 * 24 * 60 * 60 * 1000); // Dừng sau 1 tuần
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">DApp Auto Swap - Monad</h1>
      {account ? (
        <p className="mb-2">Ví: {account}</p>
      ) : (
        <button onClick={connectWallet} className="bg-blue-500 text-white px-4 py-2 rounded">
          Kết Nối Ví
        </button>
      )}
      <div className="flex gap-4 mt-4">
        <button onClick={scheduleAutoPriceMovement} className="bg-red-700 text-white px-4 py-2 rounded">
          🚀 Tự động đẩy giá mỗi giây (hoạt động trong 1 tuần)
        </button>
      </div>
    </div>
  );
}
