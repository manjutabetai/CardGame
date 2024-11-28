import React, { useEffect, useState } from 'react'
import { NB_ROUNDS, useGameEngine } from '../hooks/useGameEngine'
import { isHost, isStreamScreen, myPlayer } from 'playroomkit';
import { useControls } from 'leva';

const audios = {
  background: new Audio("/audios/Drunken Sailor - Cooper Cannell.mp3"),
  punch:new Audio("/audios/punch.mp3"),
  shield:new Audio("/audios/shield.mp3"),
  grab:new Audio("/audios/grab.mp3"),
  fail:new Audio("/audios/fail.mp3"),
  cards:new Audio("/audios/cards.mp3"),


}

export const  Ui = () => {

  // 状態と関数を取得
  const {
    phase,
    startGame,
    timer,
    playerTurn,
    players,
    round,
    getCard,
    actionSuccess,
    
  } = useGameEngine();

  // ターン中のプレイヤー,自分,ターン中のプレイヤーが選択したカード
  const currentPlayer = players[playerTurn];
  const me = myPlayer()
  const currentCard = getCard();
  // パンチならターゲットの取得
  const target = phase === "playerAction" &&
    currentCard === "punch" &&
    players[currentPlayer.getState("playerTarget")]

    // 状況により表示するテキストを作成する
    let label = "";
    switch (phase) {
      case "cards":
        label = "カードを選んでください";
        break;
      case "playerChoice":
        label =
          currentPlayer.id === me.id
            ? "攻撃する相手を選んでください"
            : `${currentPlayer?.state.profile?.name} は攻撃する相手を選んでいます`;
        break;
      case "playerAction":
        switch (currentCard) {
          case "punch":
            label = actionSuccess
              ? `${currentPlayer?.state.profile?.name} のパンチがさくえつ ${target?.state.profile?.name}`
              : `${currentPlayer?.state.profile?.name} のパンチはよけられてしまった${target?.state.profile?.name}`;
            break;
          case "grab":
            label = actionSuccess
              ? `${currentPlayer?.state.profile?.name} はgemを手に入れた`
              : `ジェムをとれなかった。。 ${currentPlayer?.state.profile?.name}`;
            break;
          case "shield":
            label = `${currentPlayer?.state.profile?.name} は盾をかまええいる`;
            break;
          default:
            break;
        }
        break;
      case "end":
        label = "Game Over";
        break;
      default:
        break;
    }

    // Audio Manager
    const [audioEnabled,setAudioEnabled] = useState(false)

    const toggleAudio = () =>{
    setAudioEnabled((prev)=>!prev);
    }
    // bgm再生
  useEffect(()=>{
    if(audioEnabled){
      audios.background.play();
      audios.background.loop = true;
    }else{
      audios.background.pause();

    }
    // アンマウントされる際にリソースを開放する
    return () =>{
      audios.background.pause();
    }

  },[audioEnabled])

  // bgmの振り分け
  useEffect(()=>{
    if(!audioEnabled){
  return
    }
    let audioToPlay;
    if(actionSuccess){
      // 選択中のカードと紐づく音声ファイル
      audioToPlay = audios[getCard()]
    }else{
      audioToPlay = audios.fail
    }
    if(phase === "cards"){
      audioToPlay = audios.cards;
    }
    if(audioToPlay){
      // 音声ファイルがあれば頭から再生
    audioToPlay.currentTime = 0;
    audioToPlay.play();
    }

  },[phase,actionSuccess,audioEnabled])

    return (
      <div className='text-white drop-shadow-xl fixed top-0 left-0 right-0 bottom-0 z-10 flex flex-col pointer-events-none'>
        <div className='p-4 w-full flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-center uppercase'>
            Round {round}/ {NB_ROUNDS}
          

        </h1>
        <div className='flex flex-col'>
          
        <h3 className=' font-bold text-center uppercase'>
          フェーズ {phase}
        

        </h3>
        {/* {players[playerTurn].id === me.id && (
          <h1>私のターンだ！</h1>
        )} */}
        </div>
        <div className=" flex items-center gap-1 w-14">
          {/* heroIcon  */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2.5}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-center uppercase">{timer}</h2>
        </div>

      </div>
      <div className='flex-1'/>
      <div className='p-4 w-full'>
        <h1 className='text-2xl font-bold text-center'>{label}</h1>
        {phase === "end" && (
          <p className='text-center'>
            Winner:{" "}
            {players
            .filter((player) => player.getState("winner"))
            .map((player) => player.state.profile.name)
            .join(",")//名前をカンマ区切り
            
            }
          </p>
        )}
        {isHost() && phase === "end" && (
          <button
          onClick={startGame}
          className='mt-2 w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded pointer-events-auto'
          >
            Play again

          </button>
        )}
      </div>
      {isStreamScreen() && audioEnabled ?(
        <button className='fixed bottom-4 left-4 pointer-events-auto'
        onClick={toggleAudio}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 0 1 0 12.728M16.463 8.288a5.25 5.25 0 0 1 0 7.424M6.75 8.25l4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
          </svg>



        </button>

        
      ):(
        <button className='fixed bottom-4 left-4 pointer-events-auto'
        onClick={toggleAudio}>

        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75 19.5 12m0 0 2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6 4.72-4.72a.75.75 0 0 1 1.28.53v15.88a.75.75 0 0 1-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.009 9.009 0 0 1 2.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75Z" />
        </svg>

        </button>

      )
      }
    </div>
  )
}