import { Environment, OrbitControls } from "@react-three/drei";
import { MobileController } from "./MobileController";
import { isStreamScreen } from "playroomkit";
import {Gameboard} from "./GameBoard";
import { Character } from "./Character";

export const Experience = () => {
  return (
    <>
      <OrbitControls />
      {
        isStreamScreen() ? <Gameboard/> : <MobileController/>
      } 
     
      <Environment preset="dawn" background blur={2}/>
      
    </>
  );
};
