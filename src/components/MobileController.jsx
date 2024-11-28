import { Center, ContactShadows, Gltf } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { motion } from "framer-motion-3d";
import { myPlayer, usePlayersList } from "playroomkit";
import { degToRad } from "three/src/math/MathUtils";
import { useGameEngine } from "../hooks/useGameEngine";
import { Card } from "./Card";
import { Character } from "./Character";
import { PlayerName } from "./PlayerName";
import { useEffect } from "react";

export const MobileController = () => {
  const me = myPlayer();
  // 状態を取得
  const { players, phase, playerTurn } = useGameEngine();
  // me.idをつかいplayersから自身のインデックスを取得
  const myIndex = players.findIndex((player) => player.id === me.id);
  const cards = me.getState("cards") || [];
  // playerの状態変更じに強制的に再レンダリング
  usePlayersList(true); // force rerender when player change
  let playerIdx = 0;

  // レスポンシブ対応
  const viewport = useThree((state) => state.viewport);
  // viewportはpxではないよ。
  const scalingRatio = Math.min(1, viewport.width / 3);
  
  return (
  
  
    <motion.group position-y={-1}>
      <ContactShadows opacity={0.12}/>
      <group scale={scalingRatio}>
      {/* Character */}
      <group position-z={3.5} position-x={-0.6}>
        <PlayerName
        name={me.state.profile.name}
        position-y={0.8}
        fontSize={0.3}
        />
        <Character
        character={myIndex}
        rotation-y={degToRad(45)}
        scale={0.4}
        />
        {/* プレイヤーの横にgemを表示 */}
         {[...Array(me.getState("gems") || 0)].map((_, index) => (
            <Gltf
              key={index}
              src="/models/UI_Gem_Blue.gltf"
              position-x={0.7 + index * 0.25}
              position-y={0.25}
              scale={0.5}
            />
          ))}

      </group>

      {/* cards */}
      <group position-y={1}>
          {cards.map((card, index) => {
            let cardAnimState = "";
            // 選択中のカードはvariantsをtrueにする
            const selected = index === me.getState("selectedCard");
            if (phase === "cards") {
              // フェーズはcardSelection
              cardAnimState = "cardSelection";
              if (selected) {
                // 選択済み
                cardAnimState = "cardSelectionSelected";
              }
            } else {
              // カード以外のフェーズは選択済みにする
              if (selected) {
                cardAnimState = "selected";
              }
            }
            return (
              <motion.group
                key={index}
                // だんだん右へずれる
                position-x={index * 0.1}
                // 2が一番上のカード
                position-y={2 - index * 0.1}
                // 0からだんだん奥へ
                position-z={-index * 0.1}
                animate={cardAnimState}
                variants={{
                  // カードが重なっている状態
                  selected: {
                    x: -0.1,
                    y: 2.1,
                    z: 0.1,
                  },
                  // 選択可能状態
                  cardSelection: {
                    x: index % 2 ? 0.6 : -0.6,
                    y: Math.floor(index / 2) * 1.6,
                    z: -0.5,
                  },
                  // 選択済み
                  cardSelectionSelected: {
                    x: 0,
                    y: 0,
                    z: 2,
                    rotateX: degToRad(-45),
                    rotateY: 0,
                    rotateZ: 0,
                    scale: 1.1,
                  },
                }}
                onClick={() => {
                  if (phase === "cards") {
                    me.setState("selectedCard", index, true);
                  }
                }}
              >
                <Card type={card} />
              </motion.group>
            );
          })}
        </group>
      {/* phaseが"playerChoice"であり、現在のターンのプレイヤーが自分自身（me.id）である場合に、以下のUIを表示します。これにより、攻撃対象を選択できるのは、現在のターンのプレイヤーだけです。  */}
      {phase === "playerChoice" && players[playerTurn].id === me.id && (
       
        // y.zを無効化し親要素にしたがう
         <Center disableY disableZ>
         {players.map(
           (player, index) =>
            // 自分以外の配置
             player.id !== me.id && (
               <motion.group
                 key={player.id}
                 position-x={playerIdx++ * 0.8}
                 position-z={-2}
                 animate={
                   index === me.getState("playerTarget") ? "selected" : ""
                 }
                 scale={0.4}
                //  animate がselectedの場合scaleを大きくする
                 variants={{
                   selected: {
                     z: 0,
                     scale: 0.8,
                   },
                 }}
               >
                {/* 少し大きめのクリックするゾーン */}
                 <mesh
                   onClick={() => me.setState("playerTarget", index, true)}
                   position-y={1}
                   visible={false}
                 >
                   <boxGeometry args={[1.2, 2, 0.5]} />
                   <meshStandardMaterial color="hotpink" />
                 </mesh>
                 <PlayerName
                   name={player.state.profile.name}
                   fontSize={0.3}
                   position-y={1.6}
                 />
                 <Character
                   character={index}
                  //  ターゲットにされているキャラクターは"NO"
                   animation={
                     index === me.getState("playerTarget") ? "No" : "Idle"
                   }
                   name={player.state.profile.name}
                 />
               </motion.group>
             )
         )}
       </Center>
       
      )}
      </group>
    </motion.group>
  )
};
