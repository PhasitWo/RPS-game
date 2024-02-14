import { useState } from "react";

function Home({ setPage }) {
    function joinRoom() {
        const loadModal = document.getElementById("load-modal");
        loadModal.showModal();
        setTimeout(() => {
            loadModal.close();
            popError("something went wrong");
        }, 2000);
    }

    return (
        <>
            <h1>This is Home Page</h1>
            <button onClick={() => document.getElementById("wait-modal").showModal()}>Create Room</button>
            <br />
            <button onClick={() => document.getElementById("join-modal").showModal()}>Join Room</button>
            <dialog className="join-modal" id="join-modal">
                This is Join Dialog!
                <form method="dialog">
                    <label htmlFor="code">Code </label>
                    <input id="code"></input>
                    <br />
                    <button type="button" onClick={joinRoom}>Join</button>
                    <button>Close</button>
                </form>
            </dialog>
            <dialog className="wait-modal" id="wait-modal">
                Waiting for other player!
                <form method="dialog">
                    <button>Quit</button>
                </form>
            </dialog>
            <dialog className="load-modal" id="load-modal">
                LOADING!
            </dialog>
        </>
    );
}

export default Home;
