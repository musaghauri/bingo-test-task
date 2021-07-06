import { useRouter } from 'next/dist/client/router';
import Head from 'next/head'
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti'
import useSocket from "../hooks/useSocket";

import Modal from '@/components/Modal'
import Board from '@/components/Board'
import { generateArray, shuffleArray } from '../utils/helperFunctions';

const roomId = "BINGO_GAME"

export default function Home() {
  const socket = useSocket();
  const router = useRouter()
  const [lostMessage, setLostMessage] = useState("")

  const [isTurn, setIsTurn] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [allowedValue, setAllowedValue] = useState('')

  const [rivalEntries, setRivalEntries] = useState([])
  const [rivalCheckBoxes, setRivalCheckBoxes] = useState(new Set())
  const [username, setUsername] = useState(false)
  const [oponenetUsername, setOponenetUsername] = useState("")
  const [boardEntries, setBoardEntries] = useState(() => shuffleArray(generateArray(24)));

  useEffect(() => {
    if (socket && username) {

      socket && socket.emit('joinRoom', { user: username, roomId }, () => {
        socket.emit("rivalEntries", roomId, boardEntries)
      });

      socket.on('oponentLeft', () => {
        setShowConfetti(true)
      })

      socket.on('pickedBox', (index) => {
        setRivalCheckBoxes(previousBoxes => new Set([...previousBoxes, index]))
      });

      socket.on('setTurn', turn => setIsTurn(turn))

      socket.on('allowedValue', value => {
        setAllowedValue(value)
        const indexOfSelectedBox = boardEntries.findIndex(val => val === value)
        setCheckedBoxes(previousBoxes => new Set([...previousBoxes, indexOfSelectedBox]))
      })

      socket.on('redirect', () => {
        window.alert('Room is Full')
        router.push('/404')
        return
      })

      socket.on('badLuck', () => {
        setLostMessage("Good luck next time")
      })

      socket.on("users", (users) => {
        if (users[0].user === username) {
          setIsTurn(true)
          setOponenetUsername(users[1]?.user)
        } else {
          setOponenetUsername(users[0]?.user)
        }
      });

      socket.on('sendYourBoard', () => {
        setShowConfetti(false)
        socket.emit("rivalEntries", roomId, boardEntries)
      })

      socket.on("rivalEntries", (data) => {
        setRivalEntries(data)
      })

      socket.on("rematch", () => {
        setShowConfetti(false)
        setRivalCheckBoxes(new Set())
        setCheckedBoxes(new Set())
        setBoardEntries(shuffleArray(generateArray(24)))
      })
    }

    // socket disconnet onUnmount if exists
    if (socket && username) return () => {
      socket.disconnect()
    };
  }, [socket, username]);

  useEffect(() => {
    socket && socket.emit("rivalEntries", roomId, boardEntries)
  }, [boardEntries])

  useEffect(() => {
    if (showConfetti) {
      setTimeout(() => {
        setShowConfetti(false)
      }, 5000)
    }
  }, [showConfetti])

  const [checkedBoxes, setCheckedBoxes] = useState(new Set())

  const checkWin = () => {
    let winningOption = -1;
    let setSquares = 0;
    let winners = new Array(31, 992, 15360, 507904, 541729, 557328, 1083458, 2162820, 4329736, 8519745, 8659472, 16252928);
    for (let i = 0; i < 24; i++) {
      if (checkedBoxes.has(i)) {
        setSquares = setSquares | Math.pow(2, i);
      }
    }
    for (let i = 0; i < winners.length; i++) {
      if ((winners[i] & setSquares) === winners[i]) {
        winningOption = i;
        // break;
      }
    }
    if (winningOption > -1) {
      setShowConfetti(true)
      socket && socket.emit("badLuck", roomId)
    }
  };

  const pickBox = (index, value) => {
    setCheckedBoxes(previousBoxes => new Set([...previousBoxes, index]))
    const indexOfRivalBoard = rivalEntries.findIndex(val => val === value)
    setRivalCheckBoxes(previousBoxes => new Set([...previousBoxes, indexOfRivalBoard]))
    setAllowedValue("")
    if (checkedBoxes.size + 1 > rivalCheckBoxes.size) {
      socket.emit("setTurn", true)
      setIsTurn(false)
    }
    value !== allowedValue ? socket.emit("allowedValue", value) : socket.emit("allowedValue", "")
    socket.emit("pickedBox", roomId, index)
  }

  useEffect(() => {
    if ([...checkedBoxes].length >= 4) {
      checkWin()
    }
  }, [checkedBoxes])

  const handleRematch = () => {
    setLostMessage("")
    socket.emit("rematch")
  }

  const isBoxSelectable = (index) => (!checkedBoxes.has(index) && !showConfetti && isTurn) && rivalEntries.length > 0

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 bg-indigo-300">
      <Head>
        <title>Bingo</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className="">
        {
          showConfetti && <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
          />
        }
        {
          !username && <Modal setUsername={setUsername} />
        }
        {lostMessage && <p className="text-xl font-medium text-center text-indigo-600">{lostMessage}</p>}
        <div className="flex space-x-4">
          <Board
            active={isTurn}
            username={username || 'Me'}
            boardCells={boardEntries}
            checkedCells={checkedBoxes}
            isBoxSelectable={isBoxSelectable}
            pickBox={pickBox}
          />
          <Board
            active={!isTurn}
            username={oponenetUsername || 'Waiting for opponent...'}
            boardCells={rivalEntries}
            checkedCells={rivalCheckBoxes}
            isBoxSelectable={false}
            pickBox={pickBox}
          />
        </div>
        {
          lostMessage && <button
            onClick={handleRematch}
            className="px-6 py-3 my-2 mr-1 text-sm font-bold text-white uppercase bg-green-500 rounded shadow outline-none active:bg-green-600 hover:shadow-lg focus:outline-none"
          >
            Rematch
          </button>
        }
      </div>
    </div >
  )
}
