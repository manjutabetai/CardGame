import { Text, useFont, useGLTF, useTexture } from "@react-three/drei";
import React from "react";

const CARD_DESCRIPTIONS = {
  punch: "他の海賊を殴って宝石を落とさせる",
  shield: "攻撃から身を守る",
  grab: "宝物から宝石を取る。宝石が残っていなければ、何も得られない。",
};

export function Card({ type = "shield", ...props }) {
  const { nodes, materials } = useGLTF("/models/card.glb");
  const texture = useTexture(`cards/${type}.jpg`);
  return (
    <group {...props} dispose={null}>
      <mesh castShadow receiveShadow geometry={nodes.Plane.geometry}>
        <meshStandardMaterial
          {...materials.Front}
          map={texture}
          color="white"
        />
      </mesh>
     {/* ボーターを表示するマテリアル */}
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane_1.geometry}
        material={materials.Borders}
      />
      {/* 裏面 */}
      <mesh
        castShadow
        receiveShadow
        geometry={nodes.Plane_2.geometry}
        material={materials.Back}
      />
      {/* カード名 */}
      <Text
        font="/fonts/NotoSansJP-Bold.ttf"
        fontSize={0.1}
        anchorY={"top"}
        anchorX={"left"}
        position-x={-0.46}
        position-y={-0.3}
        position-z={0.01}
      >
        {type.toUpperCase()}
        <meshStandardMaterial
          color="white"
          roughness={materials.Front.roughness}
        />
      </Text>
      {/* カードの説明 */}
      <Text
      overflowWrap="break-word"
        font="/fonts/NotoSansJP-Medium.ttf"
        fontSize={0.05}
        maxWidth={0.9}
        anchorY={"top"}
        anchorX={"left"}
        position-x={-0.46}
        position-y={-0.44}
        position-z={0.01}
        lineHeight={1}
      >
        {CARD_DESCRIPTIONS[type] || ""}
        <meshStandardMaterial
          color="white"
          roughness={materials.Front.roughness}
        />
      </Text>
    </group>
  );
}

useGLTF.preload("/models/card.glb");
useTexture.preload("/cards/punch.jpg");
useTexture.preload("/cards/shield.jpg");
useTexture.preload("/cards/grab.jpg");
useFont.preload("/fonts/NotoSansJP-Medium");
useFont.preload("/fonts/NotoSansJP-Bold");