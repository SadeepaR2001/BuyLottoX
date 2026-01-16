import axios from "axios";
import { useEffect, useState } from "react";

export default function Home() {
  const [lotteries, setLotteries] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/lottery")
      .then(res => setLotteries(res.data));
  }, []);

  const buyTicket = async (id) => {
    const res = await axios.post(`http://localhost:5000/api/lottery/buy/${id}`);
    alert("Your Ticket Number: " + res.data.ticketNo);
  };

  return (
    <div>
      <h2>Lottery Draws</h2>
      {lotteries.map(l => (
        <div key={l._id}>
          <h3>{l.title}</h3>
          <p>Price: Rs.{l.price}</p>
          <button onClick={() => buyTicket(l._id)}>Buy Ticket</button>
        </div>
      ))}
    </div>
  );
}
