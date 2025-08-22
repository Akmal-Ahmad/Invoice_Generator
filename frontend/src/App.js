import { BrowserRouter, Routes, Route } from "react-router-dom";
import Steps from "./components/Steps";
import { UserProvider } from "./UserContext";

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Steps />} />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  );
}
