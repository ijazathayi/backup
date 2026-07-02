import React, { useState, useEffect, useMemo } from "react";
import "./css/uistyle.css";

const WordFlick = () => {
  const words = useMemo(
    () => [
      "FullStack Developer",
      "Front-end Developer",
      "Back-end Developer",
      "Database Developer",
    ],
    []
  );

  const [part, setPart] = useState("");
  const [i, setI] = useState(0);
  const [offset, setOffset] = useState(0);
  const [forwards, setForwards] = useState(true);
  const [skipCount, setSkipCount] = useState(0);

  const skipDelay = 10;
  const speed = 100;

  useEffect(() => {
    const interval = setInterval(() => {
      if (forwards) {
        if (offset >= words[i].length) {
          setSkipCount((c) => {
            if (c === skipDelay) {
              setForwards(false);
              return 0;
            }
            return c + 1;
          });
        } else {
          setOffset((o) => o + 1);
        }
      } else {
        if (offset === 0) {
          setForwards(true);
          setI((index) => (index + 1) % words.length);
        } else {
          setOffset((o) => o - 1);
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [offset, forwards, i, skipCount, words]);

  useEffect(() => {
    setPart(words[i].substring(0, offset));
  }, [offset, i, words]);

  return <div className="wordflicker">{part}</div>;
};

export default WordFlick;


// import React, { useState, useEffect } from "react";
// import './css/uistyle.css'

// const WordFlick = () => {
//   const words = [
//     "FullStack Developer",
//     "Front-end Developer",
//     "Back-end Developer",
//     "Database Developer",
//   ];

//   const [part, setPart] = useState("");
//   const [i, setI] = useState(0);
//   const [offset, setOffset] = useState(0);
//   const [forwards, setForwards] = useState(true);
//   const [skipCount, setSkipCount] = useState(0);

//   const skipDelay = 10;
//   const speed = 100;

//   useEffect(() => {
//     const interval = setInterval(() => {
//       if (forwards) {
//         if (offset >= words[i].length) {
//           setSkipCount((prev) => {
//             if (prev + 1 === skipDelay) {
//               setForwards(false);
//               return 0;
//             }
//             return prev + 1;
//           });
//         } else {
//           setOffset((prev) => prev + 1);
//         }
//       } else {
//         if (offset === 0) {
//           setForwards(true);
//           setI((prev) => (prev + 1 >= words.length ? 0 : prev + 1));
//         } else {
//           setOffset((prev) => prev - 1);
//         }
//       }

//       setPart(words[i].substr(0, offset));
//     }, speed);

//     return () => clearInterval(interval);
//   }, [offset, forwards, i, words]);

//   return (
//     <div
//       className="wordflicker"
      
//     >
//       {part}
//     </div>
//   );
// };

// export default WordFlick;
