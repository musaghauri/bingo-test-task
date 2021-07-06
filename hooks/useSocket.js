import { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io();

export default function useSocket(cb) {
	const [activeSocket, setActiveSocket] = useState(null);

	useEffect(() => {
		if (activeSocket || !socket) return;
		cb && cb(socket);
		setActiveSocket(socket);
		return function cleanup() {
			socket.off("Bingo", cb);
		};
	}, [socket]);
	return activeSocket;
}
