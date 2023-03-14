import { useState, useRef, useEffect } from "react"
import Editor from "../components/Editor"
import Client from "../components/Client"
import { initSocket } from "../socket"
import ACTIONS from "../Actions"
import { useLocation, useNavigate, Navigate, useParams } from "react-router-dom"
import { toast } from "react-hot-toast"



const EditorPage = () => {

    const socketRef = useRef(null);
    const location = useLocation();
    const reactNavigator = useNavigate();
    const { roomId } = useParams();
    const codeRef = useRef(null);

    const [clients, setClients] = useState([]);

    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();

            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {

                toast.error('socket connection failed try again')
                reactNavigator('/')
            }
            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username
            });

            socketRef.current.on(ACTIONS.JOINED, ({ clients, username, socketId }) => {
                if (username !== location.state?.username) {
                    toast.success(`${username} joined the room`);

                }

                setClients(clients);

                socketRef.current.emit(ACTIONS.SYNC_CODE, {
                    code: codeRef.current,
                    socketId
                })
            })

            //listening for disconnected

            socketRef.current.on(ACTIONS.DISCONNECTED, ({ socketId, username }) => {
                toast.success(`${username} left the room`);
                setClients((prevs) => {
                    return prevs.filter((client) => client.socketId !== socketId)
                });
            });

        }
        init();

        //for not getting memory leaks

        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        }
    }, [])




    if (!location.state) {
        return <Navigate to='/' />
    }

    async function copyRoomID() {

        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room Id has been copied to the clipBoard');
        } catch (error) {
            toast.error('Error!try copying Room Id manually')
        }

    }

    function leaveRoom() {
        reactNavigator('/')
    }

    return (
        <div className="mainWrap">
            <div className="aside">
                <div className="asideInner">
                    <div className="logo">
                        <img className="logoImage" src="/code_sync.png" alt="logo" />
                    </div>
                    <h3>Connected</h3>
                    <div className="clientsList">
                        {clients.map(client => <Client key={client.socketId} username={client.username} />)}
                    </div>
                </div>
                <button className="btn copyBtn" onClick={copyRoomID}>Copy RoomId</button>
                <button className="btn leaveBtn" onClick={leaveRoom}>Leave Room</button>
            </div>
            <div className="editorWrap">
                <Editor socketRef={socketRef}
                    roomId={roomId} onCodeChange={(code) => {
                        codeRef.current = code;
                    }} />
            </div>
        </div>
    )
}

export default EditorPage