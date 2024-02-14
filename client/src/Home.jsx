import { useState } from "react";

function Home({ setPage }) {
    function joinRoom(e) {
        e.preventDefault()
        const loadModal = document.getElementById("load-modal");
        loadModal.showModal();
        setTimeout(() => {
            loadModal.close();
            popError("something went wrong");
        }, 2000);
    }

    function closeJoinModal() {
        document.getElementById("join-modal").close();
    }

    return (
        <>
            <div className="home-container">
                <h2>Rock Paper Scissors</h2>
                <button onClick={() => document.getElementById("wait-modal").showModal()}>Create Room</button>
                <br />
                <button onClick={() => document.getElementById("join-modal").showModal()}>Join Room</button>
                <dialog className="join-modal" id="join-modal">
                    <p>This is Join Dialog!</p>
                    <form onSubmit={joinRoom} method="dialog">
                        <label htmlFor="code">Code </label>
                        <input id="code"></input>
                        <button type="submit">Join</button>
                        <button type="button" onClick={closeJoinModal}>Close</button>
                    </form>
                </dialog>
                <dialog className="wait-modal" id="wait-modal">
                    Waiting for other player!
                    <form method="dialog">
                        <button>Quit</button>
                    </form>
                </dialog>
                <dialog className="load-modal" id="load-modal">
                    LOADING...
                </dialog>
            </div>
        </>
    );
}

export default Home;
