import { Canvas } from "@react-three/fiber";
import { Experience } from "./components/Experience";
import { Leva } from "leva";
import { isHost, isStreamScreen } from "playroomkit";
import {Ui} from "./components/Ui";
import { MotionConfig } from "framer-motion";


const DEBUG = true;
function App() {
  console.log( 'ホスト？? ',isHost())
  return (
    <>
   <Leva hidden={!DEBUG || !isHost()}/>
    <Canvas shadows camera={{ position:isStreamScreen()? [14,10,-14]:[0, 4, 12], fov: 30 }}>
      <color attach="background" args={["#ececec"]} />
      <MotionConfig
  transition={{
    type: "spring", // アニメーションのタイプをスプリングに設定
    mass: 5,        // スプリングの質量。質量が大きいほど、動きが遅く、重く感じる
    stiffness: 500, // スプリングの硬さ。硬さが高いほど、動きが速く、反発力が強い
    damping: 100,   // 減衰。動きがどれだけ早く止まるかを制御する。高い値は動きを早く止める
    restDelta: 0.0001, // スプリングが静止状態に達するための許容範囲。小さいほど、より正確に静止する
  }}
>

      <Experience />
      </MotionConfig>
    </Canvas>
    <Ui/>
    </>
  );
}

export default App;
