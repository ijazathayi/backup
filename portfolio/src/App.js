import "./App.css";
import Five from "./components/Five";
import Four from "./components/Four";
import Mypage from "./components/Mypage";
import One from "./components/One";
import Three from "./components/Three";
import Two from "./components/Two";
import Contact from "./components/Contact";
import "./styles.css";
import ScrollToTop from "./components/ScrollToTop";

import { BrowserRouter, Routes, Route } from "react-router-dom"; 

function App() {
  if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}
  return (
    <div className="App">
      <BrowserRouter>
    <ScrollToTop />
        <Routes>
          <Route path="/" element={<One />} />
          <Route path="/two" element={<Two />} />
          <Route path="/three" element={<Three />} />
          <Route path="/four" element={<Four />} />
          <Route path="/five" element={<Five />} />
          <Route path="/about" element={<Mypage />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </BrowserRouter>

    </div>
  );
}

export default App;















// import "./App.css";
// import Five from "./components/Five";
// import Four from "./components/Four";
// import Mypage from "./components/Mypage";
// import One from "./components/One";
// // import MarqueeJS from "./components/Sample";
// import Three from "./components/Three";
// import Two from "./components/Two";
// import "./styles.css";
// import { BrowserRouter, Routes, Route } from "react-router";

// function App() {
//   return (
//     <div className="App">
//       <BrowserRouter>
//         <Routes>
//           {/* <Route path="/" element={<One />} /> */}
//           <Route path="/" element={<One />} />
//           <Route path="/two" element={<Two />} />
//           <Route path="/three" element={<Three />} />
//           <Route path="/four" element={<Four />} />
//           <Route path="/five" element={<Five />} />
//           <Route path="/about" element={<Mypage />} />
//         </Routes>
//       </BrowserRouter>
//       <Two />
//       <Three />
//       <Four />
//       <Five />
//       {/* <Mypage /> */}
//     </div>
//   );
// }

// export default App;
