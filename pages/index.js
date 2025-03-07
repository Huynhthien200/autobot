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
  const [time, setTime] = useState(0);

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

  const scheduleSwap = (interval) => {
    if (schedule) clearInterval(schedule);
    let t = 0;
    const newSchedule = setInterval(() => {
      const amount = (Math.sin(t) + 1) * 0.5 + 0.1; // Dao động lượng swap từ 0.1 - 1.1
      const increasePrice = Math.sin(t) > 0; // Tăng hoặc giảm theo chu kỳ
      swapToken(amount, increasePrice);
      t += Math.PI / 6; // Mỗi lần swap, tăng góc để tạo sóng mượt hơn
    }, interval * 1000);
    setSchedule(newSchedule);
    alert(`Đã lên lịch đẩy giá theo mô hình sóng mỗi ${interval} giây!`);
  };

  const scheduleAdvancedSwap = (interval) => {
    if (schedule) clearInterval(schedule);
    let t = 0;
    const newSchedule = setInterval(() => {
      const amount = Math.abs(Math.sin(t) * Math.cos(t) * 1.5) + 0.1; // Biến đổi sóng phức tạp hơn
      const increasePrice = Math.sin(t) > 0; // Tăng hoặc giảm theo chu kỳ
      swapToken(amount, increasePrice);
      t += Math.PI / 8; // Chu kỳ biến đổi khác nhau
    }, interval * 1000);
    setSchedule(newSchedule);
    alert(`Đã lên lịch đẩy giá theo mô hình nâng cao mỗi ${interval} giây!`);
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
        <button onClick={() => scheduleSwap(60)} className="bg-green-700 text-white px-4 py-2 rounded">
          ⏳ Lên lịch đẩy giá đẹp (mỗi 60s)
        </button>
        <button onClick={() => scheduleAdvancedSwap(45)} className="bg-purple-700 text-white px-4 py-2 rounded">
          🔄 Lên lịch đẩy giá nâng cao (mỗi 45s)
        </button>
      </div>
    </div>
  );
}
