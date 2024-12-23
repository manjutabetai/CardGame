import { useState,useEffect } from "react";
import { useGameEngine } from "../hooks/useGameEngine"
import { degToRad } from "three/src/math/MathUtils.js";
import { PlayerName } from "./PlayerName";
import { Character } from "./Character";
import { Center, Gltf, Html } from "@react-three/drei";
import { motion } from "framer-motion-3d";


export const Player = ({index, player})=>{
  // ゲームエンジンの状態を取得
  const { phase, playerTurn, players, getCard } = useGameEngine();
  // プレイヤーのターンかどうかを判定
  const isPlayerTurn = phase === "playerAction" && index === playerTurn;
  // 現在のプレイヤーを取得
  const currentPlayer = players[playerTurn];
  // 現在のカードを取得,　選択していればそのカード
  const currentCard = getCard();
  // シールドを持っているかどうかを判定
  const hasShield = player.getState("shield");
  // 現在のフェーズがプレイヤーのアクションフェーズであり、
  // 現在のカードがパンチであり、
  // 現在のプレイヤーのインデックスが現在のプレイヤーがターゲットに設定しているインデックスと一致する場合、
  // このプレイヤーが攻撃をうけてるかの判定
  const isPlayerPunched =
    phase === "playerAction" &&
    currentCard === "punch" &&
    index === currentPlayer.getState("playerTarget");
  // 勝者かどうかを判定
  const isWinner = player.getState("winner");
  // アニメーションの状態を管理
  const [animation, setAnimation] = useState("Idle");



  // playerのアニメーションを制御
  useEffect(() => {
    let cardAnim = "Idle";
    if (isPlayerTurn) {
      switch (currentCard) {
        case "punch":
          cardAnim = "Sword";
          break;
        case "shield":
          cardAnim = "Wave";
          break;
        case "grab":
          cardAnim = "Punch";
          break;
        default:
          break;
      }
    } else {
      // 攻撃をうけたばあい
      if (isPlayerPunched) {
        cardAnim = "Duck";
      }
    }
    if (isWinner) {
      cardAnim = "Wave";
    }
    setAnimation(cardAnim);
  }, [currentCard, playerTurn, phase, isPlayerPunched, isWinner]);
  
  return (
    // animateで受けvariantsの位置へ移動させる
    <motion.group
      animate={animation}
      position-x={1 + index}
      position-z={2}
      variants={{
        Sword: {
          // punch
          z: index > 6?-4:index > 3? -3.5:-3,
          x:  index > 6? (index -6) * 0.5:index > 3?(index-3)*0.5:index * 0.5,
        },
        Wave: {
          // shield
          scale: 2.5,
        },
        Punch: {       

          // grab
          z: index > 6?-4:index > 3? -3.5:-3,
          x:  index > 6? (index -6) * 0.5:index > 3?(index-3)*0.5:index * 0.5,
        },
        Duck: {
          // パンチを受ける側
          z: index > 6?-4:index > 3? -3.5:-3,
          x:  index > 6? (index -6) * 0.5:index > 3?(index-3)*0.5:index * 0.5,
          rotateY: degToRad(180),
        },
      }}
    >
        {isPlayerTurn && (
        <Html position={[0, 1.2, 0]} center>
          <div style={{
            width: '30px',
            height: '30px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '5px'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-6">
              <path fillRule="evenodd" d="M11.47 13.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 0 0-1.06-1.06L12 11.69 5.03 4.72a.75.75 0 0 0-1.06 1.06l7.5 7.5Z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M11.47 19.28a.75.75 0 0 0 1.06 0l7.5-7.5a.75.75 0 1 0-1.06-1.06L12 17.69l-6.97-6.97a.75.75 0 0 0-1.06 1.06l7.5 7.5Z" clipRule="evenodd" />
            </svg>
          </div>
        </Html>
      
      )}


      {/* Characterのちょい上に名前を表示 */}
      <PlayerName name={player.state.profile.name} position-y={0.8} />
      {/* animationを渡し表示 */}
      <Character
        scale={0.5}
        character={index}
        rotation-y={degToRad(180)}
        animation={animation}
      />

      {/*  */}
      {hasShield && <Gltf scale={0.5} src="/models/Prop_Barrel.gltf" />}
      {/* PLAYER GEMS */}
      <Center disableY disableZ>
        {[...Array(player.getState("gems") || 0)].map((_, index) => (
          <Gltf
            key={index}
            src="/models/UI_Gem_Blue.gltf"
            position-x={index * 0.25}
            position-y={0.25}
            position-z={0.5}
            scale={0.5}
          />
        ))}
      </Center>
    </motion.group>
  );
}