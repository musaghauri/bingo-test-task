import Head from 'next/head'
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti'
import SocketIOClient from "socket.io-client";

export default function Home() {
  const generateArray = (n) => [...Array(n + 1).keys()].slice(1)
  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);


  const [connected, setConnected] = useState(false);
  // const [isTurn, setIsTurn] = useState(users.length === 0)

  useEffect(() => {
    // connect to socket server
    const socket = SocketIOClient.connect(process.env.BASE_URL, {
      path: "/api/socketio",
    });

    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
      setConnected(true);
    });

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  const [boardEntries, setBoardEntries] = useState(shuffleArray(generateArray(24)));
  const [checkedBoxes, setCheckedBoxes] = useState(new Set())
  const [showConfetti, setShowConfetti] = useState(false)


  const checkWin = () => {
    let winningOption = -1;
    let setSquares = 0;
    let winners = new Array(31, 992, 15360, 507904, 541729, 557328, 1083458, 2162820, 4329736, 8519745, 8659472, 16252928);
    for (let i = 0; i < 24; i++) {
      if (checkedBoxes.has(i)) {
        setSquares = setSquares | Math.pow(2, i);
      }
    }
    console.log({ setSquares })
    for (let i = 0; i < winners.length; i++) {
      if ((winners[i] & setSquares) === winners[i]) {
        winningOption = i;
        // break;
      }
    }
    console.log({ winningOption })
    if (winningOption > -1) setShowConfetti(true)

  };

  const toggleColor = (index) => {
    setCheckedBoxes(previousBoxes => new Set([...previousBoxes, index]))
  }


  useEffect(() => {
    if ([...checkedBoxes].length >= 4) {
      checkWin()
    }
  }, [checkedBoxes])
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-indigo-300">
      <Head>
        <title>Bingo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div>
        {connected ? 'connected' : 'connecting...'}
      </div>
      <div className="">
        {
          showConfetti && <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
          />
        }

        <div className="flex">
          <ul className="grid grid-cols-5 select-none">

            {
              boardEntries.map((value, i) => (
                <React.Fragment key={value}>
                  {i === 12 && (
                    <li
                      className="p-6 text-xl font-medium text-center bg-[#5dc4de] border-2 border-gray-300 border-solid">
                      😀
                    </li>
                  )}
                  <li
                    onClick={() => !showConfetti ? toggleColor(i) : null}
                    className={`p-6 text-xl font-medium text-center border-2 border-gray-300 border-solid ${checkedBoxes.has(i) ? 'bg-[#5dc4de] picked' : ''}`}
                  >
                    {value}
                  </li>
                </React.Fragment>
              ))
            }
          </ul>

        </div>
      </div>
    </div >
  )
}
