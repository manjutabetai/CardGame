import {
  AccumulativeShadows,
  Gltf,
  RandomizedLight,
  useGLTF,
} from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { useMemo } from "react";
import { degToRad } from "three/src/math/MathUtils";
import { useGameEngine } from "../hooks/useGameEngine";
import { Card } from "./Card";
import { Player} from "./Player"

import { AxesHelper, GridHelper } from 'three';

export const Gameboard = () => {

  
  // Streamerのレスポンシブ対応
  const viewport = useThree((state) => state.viewport);
  // 最大値を1にして縮小に対応する、デスクトップ版は 12でわるとちょうどいい
  const scalingRatio = Math.min(1, viewport.width / 12);

  const { deck, gems, players, phase, getCard } = useGameEngine();

  const shadows = useMemo(
    () => (
      <AccumulativeShadows
        temporal
        frames={35}
        alphaTest={0.75}
        scale={100}
        position={[0, 0.01, 0]}
        color="#EFBD4E"
      >
        <RandomizedLight
          amount={4}
          radius={9}
          intensity={1}
          ambient={0.25}
          position={[30, 5, -10]}
        />
        <RandomizedLight
          amount={4}
          radius={5}
          intensity={0.5}
          ambient={0.55}
          position={[-30, 5, -9]}
        />
      </AccumulativeShadows>
    ),
    []
  );

  return (
    <>
    
    <group scale={scalingRatio}>
      {/* BG */}
      <Gltf
        castShadow
        src="/models/Gameboard.glb"
        scale={0.8}
        position-x={-1}
        position-z={5}
      />
      {shadows}

      {/* DECK */}
      <group position-x={4} position-z={-2}>
        {deck.map((_, index) => (
          <motion.group
            key={index}
            position-y={index * 0.015}
            //  奇数のカードをずらし重なっている状態を表現
            rotation-y={index % 2 ? degToRad(4) : 0}
            // 一番上のカードをselectedにする
            animate={
              phase === "playerAction" && index === deck.length - 1
                ? "selected"
                : ""
            }
            // 位置と全体の回転を担当
            variants={{
              selected: {
                x: 1.5,
                y: 1.5,
                z: -1,
                rotateY: degToRad(130),
                scale: 1.5,
              },
            }}
           
          >
            {/* 傾きのみを担当 */}
            <motion.group
              rotation-x={degToRad(90)}
              variants={{
                selected: {
                  rotateX: degToRad(-30),

                },
              }}
            >
              <Card type={getCard() || undefined} />
            </motion.group>
          </motion.group>
        ))}
      </group>
      {/* ジェムの山 */}
      {
      [...Array(gems)].map((_, index) => (
        <Gltf
        key={index}
         src="/models/grilled-fish.glb"
       position-x={ index > 6? (index -6) * 0.5:index > 3?(index-3)*0.5:index * 0.5}
       position-y={0.25}
       position-z={index > 6?-4:index > 3? -3.5:-3}
        scale={0.5}
        rotation-x={degToRad(45)}
       
      />
      ))
    }
     
      {/* CHARACTERS */}
      {players.map((player, index) => (
        <group key={player.id}>
          <Player index={index} player={player} />
        </group>
      ))}
    </group>
    </>
  );
};

useGLTF.preload("/models/Gameboard.glb");
useGLTF.preload("/models/grilled-fish.glb");