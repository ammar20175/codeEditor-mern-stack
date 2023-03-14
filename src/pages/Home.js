import { v4 as uuidV4 } from "uuid"
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const Home = () => {

    const navigate = useNavigate()

    const [roomId, setRoomId] = useState('')
    const [username, setUsername] = useState('')

    const createNewRoom = (e) => {
        e.preventDefault();
        const id = uuidV4()
        setRoomId(id);

        toast.success('New room created');
    }

    const joinRoom = () => {
        if (!roomId || !username) {
            toast.error('Room Id & username required')
        }

        if (roomId && username) {
            //redirect
            navigate(`/editor/${roomId}`, {
                state: {
                    username,
                }
            })
        }

    }

    const handleInputEnter = (e) => {
        if (e.code === 'Enter') {
            joinRoom();
        }
    }

    return (
        <div className="homePageWrapper">
            <div className="formWrapper">

                <img className="homePageLogo" src="/code_sync.png" alt="pic" />
                <h4 className="mainLabel">Paste invitatioin Room ID</h4>

                <div className="inputGroup">
                    <input type="text" className="inputBox" placeholder="Room Id" onChange={(e) => { setRoomId(e.target.value) }} value={roomId} onKeyUp={handleInputEnter} />
                    <input type="text" className="inputBox" placeholder="Username" onChange={(e) => { setUsername(e.target.value) }} value={username} onKeyUp={handleInputEnter} />

                    <button className="btn joinBtn" onClick={joinRoom}>Join</button>
                    <span className="createInfo">
                        if you don't have an invite then create &nbsp; <a onClick={createNewRoom} href="#" className="createNewBtn">new room</a>
                    </span>
                </div>
            </div>

            <footer>
                <h4>Built by &nbsp;
                    <a href="#">Ammar Ahmad</a>
                </h4>
            </footer>

        </div>
    )
}

export default Home