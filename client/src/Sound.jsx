import clickSound from "./assets/button-click.wav";
import youScoreSound from "./assets/you-score.wav";
import foeScoreSound from "./assets/foe-score.wav";
import youWinSound from "./assets/you-win.wav";
import youLoseSound from "./assets/you-lose.wav";

export default function Sound() {
return (
    <>
        <audio id="click-sound" src={clickSound} preload="auto"></audio>
        <audio id="you-score-sound" src={youScoreSound} preload="auto"></audio>
        <audio id="foe-score-sound" src={foeScoreSound} preload="auto"></audio>
        <audio id="you-win-sound" src={youWinSound} preload="auto"></audio>
        <audio id="you-lose-sound" src={youLoseSound} preload="auto"></audio>
    </>
);
}