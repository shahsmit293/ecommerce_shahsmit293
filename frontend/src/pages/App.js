import { useNavigate } from 'react-router-dom';
import { Context } from '../store/appContext';
import '../styles/App.css';
import React, { useContext, useState } from "react";

const App = () => {
  const [email, setValue] = useState("");
  const { actions } = useContext(Context);
  const navigate = useNavigate()
  if (!actions) {
    return <div>Error: Actions not available</div>;
  }

  return (
    <div className="App">
      <input type='text' value={email} onChange={(e) => setValue(e.target.value)} />
      <button onClick={() => actions.getname(email)}>Add my name here</button>
      <button onClick={()=>navigate("/login")}>Route to login</button>
    </div>
  );
}

export default App;
