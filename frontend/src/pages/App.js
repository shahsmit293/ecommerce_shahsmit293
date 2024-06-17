import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/App.css';
import React, { useContext, useState } from "react";

const App = () => {
  const [email, setValue] = useState("");
  const [amount, setamount] = useState("");
  const { actions } = useContext(Context); // Destructure actions from Context
  const navigate = useNavigate()
  if (!actions) {
    return <div>Error: Actions not available</div>;
  }

  return (
    <div className="App">
      <input type='text' value={email} onChange={(e) => setValue(e.target.value)} />
      <input type='text' value={amount} onChange={(e) => setamount(e.target.value)} />
      <button onClick={() => actions.getname(email,amount)}>Add my name here</button>
      <button onClick={()=>navigate("/login")}>Route to login</button>
    </div>
  );
}

export default App;
