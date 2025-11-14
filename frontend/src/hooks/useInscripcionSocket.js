import { useEffect, useRef } from "react";
import { createSocketConnection } from "../services/socket";

const useInscripcionSocket = (enabled = true) => {
	const socketRef = useRef(null);

	useEffect(() => {
		if (!enabled) return;
		const socket = createSocketConnection("/inscripcion", {
			transports: ["websocket"],
			autoConnect: false,
			reconnectionAttempts: 5,
			reconnectionDelay: 1000,
		});

		socketRef.current = socket;

		const onConnect = () => {
			console.log("✅ WebSocket conectado al namespace /inscripcion");
		};

		const onDisconnect = (reason) => {
			console.log("⚠️ WebSocket desconectado /inscripcion", reason);
		};

		const onInscripcionChanged = (data) => {
			try {
				const evt = new CustomEvent("inscripcion.changed", { detail: data });
				window.dispatchEvent(evt);
			} catch (e) {
				console.error("Error al despachar evento global inscripcion.changed", e);
			}
		};

		socket.on("connect", onConnect);
		socket.on("disconnect", onDisconnect);
		socket.on("inscripcion.changed", onInscripcionChanged);

		socket.connect();

		return () => {
			socket.off("connect", onConnect);
			socket.off("disconnect", onDisconnect);
			socket.off("inscripcion.changed", onInscripcionChanged);
			try {
				socket.disconnect();
			} catch (e) {
				console.warn("Error al desconectar socket /inscripcion", e);
			}
			socketRef.current = null;
		};
	}, [enabled]);
};

export default useInscripcionSocket;
