export default function CustomButton({ ...prop }) {
    return <button {...prop} onMouseDown={playSound("click-sound")}></button>;
}
