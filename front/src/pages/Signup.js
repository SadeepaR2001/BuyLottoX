import axios from "axios";
import { useState } from "react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {
    try {
      await axios.post("http://localhost:5000/api/auth/signup", {
        name,
        email,
        password
      });
      window.location.href = "/";
    } catch (err) {
      alert("Signup failed");
    }
  };

  return (
    <div>
      <h2>Signup</h2>
      <input placeholder="Name" onChange={e => setName(e.target.value)} />
      <br />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <br />
      <input type="password" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <br />
      <button onClick={signup}>Signup</button>
    </div>
  );
}
