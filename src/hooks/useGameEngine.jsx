import { useControls } from "leva";
import {
  getState,
  isHost,
  onPlayerJoin,
  useMultiplayerState,
  usePlayersList,
} from "playroomkit";
import React, { useEffect, useRef } from "react";
import { randInt } from "three/src/math/MathUtils";

const GameEngineContext = React.createContext();

// 制限時間
// 各フェーズ
const TIME_PHASE_CARDS = 10;
const TIME_PHASE_PLAYER_CHOICE = 10;
const TIME_PHASE_PLAYER_ACTION = 3;

// ラウンド数
export const NB_ROUNDS = 3;
// 取り合うジェムの数
const NB_GEMS = 3;
// プレイヤーに配られるカード枚数
const CARDS_PER_PLAYER = 4;

export const GameEngineProvider = ({ children }) => {
  // GAME STATE
  const [timer, setTimer] = useMultiplayerState("timer", 0);
  const [round, setRound] = useMultiplayerState("round", 1);
  const [phase, setPhase] = useMultiplayerState("phase", "lobby");
  const [playerTurn, setPlayerTurn] = useMultiplayerState("playerTurn", 0);
  const [playerStart, setPlayerStart] = useMultiplayerState("playerStart", 0);
  const [deck, setDeck] = useMultiplayerState("deck", []);
  const [gems, setGems] = useMultiplayerState("gems", NB_GEMS);
  const [actionSuccess, setActionSuccess] = useMultiplayerState(
    "actionSuccess",
    true
  );

  const players = usePlayersList(true);
  players.sort((a, b) => a.id.localeCompare(b.id)); // we sort players by id to have a consistent order through all clients

// 状態が変化すると再レンダリングされ常に最新の状態をもつ
  const gameState = {
    timer,
    round,
    phase,
    playerTurn,
    playerStart,
    players,
    gems,
    deck,
    actionSuccess,
  };

// カードを配布
  const distributeCards = (nbCards) => {
    // デッキのコピーを作成
    const newDeck = [...getState("deck")];

    players.forEach((player) => {
      const cards = player.getState("cards") || [];
      for (let i = 0; i < nbCards; i++) {
        const randomIndex = randInt(0, newDeck.length - 1);
        cards.push(newDeck[randomIndex]);
        newDeck.splice(randomIndex, 1);
      }
      // 状態の更新
      player.setState("cards", cards, true);
      player.setState("selectedCard", 0, true);
      player.setState("playerTarget", -1, true);
    });
    setDeck(newDeck, true);
  };

  const startGame = () => {
    // ホストが処理をおこなう
    if (isHost()) {
      console.log("ゲームスタート");
      // 状態の初期値をセット
      setTimer(TIME_PHASE_CARDS, true);
      // 最初のプレイヤーをランダムに決定
      const randomPlayer = randInt(0, players.length - 1); // 
      setPlayerStart(randomPlayer, true);
      setPlayerTurn(randomPlayer, true);
      setRound(1, true);
      setDeck(
        [
          ...new Array(16).fill(0).map(() => "punch"),
          ...new Array(24).fill(0).map(() => "grab"),
          ...new Array(8).fill(0).map(() => "shield"),
        ],
        true
      );
      setGems(NB_GEMS, true);
      players.forEach((player) => {
        console.log("プレイヤーの初期値をセット id:", player.id);
        player.setState("cards", [], true);
        player.setState("gems", 0, true);
        player.setState("shield", false, true);
        player.setState("winner", false, true);
      });
      distributeCards(CARDS_PER_PLAYER);
      setPhase("cards", true);
    }
  };

  useEffect(() => {
    startGame();
    onPlayerJoin(startGame); 
  }, []);

  const performPlayerAction = () => {
    const player = players[getState("playerTurn")];
    const selectedCard = player.getState("selectedCard");
    const cards = player.getState("cards");
    const card = cards[selectedCard];
    // シールドで回避されたときはfalseにする
    let success = true;
    // 選択したカードがシールでなければfalseにしておく
    if (card !== "shield") {
      player.setState("shield", false, true);
    }
    switch (card) {
      case "punch":
        let target = players[player.getState("playerTarget")];

        // ターゲット未選択(制限時間内に選ばなかった)
        if (!target) {
          自分の次のターンのプレイヤーをターゲットにする
          let targetIndex = (getState("playerTurn") + 1) % players.length;
          // ターゲットをセット
          player.setState("playerTarget", targetIndex, true);
          target = players[targetIndex]; 
        }
        // 
        console.log("パンチターゲット", target.id);

        // ターゲットがシールドの場合
        if (target.getState("shield")) {
          console.log("ターゲットは防御している!!!");
          success = false;
          break;
        }
        // ターゲットがジェムを持っている場合ジェムを減らす
        if (target.getState("gems") > 0) {
          target.setState("gems", target.getState("gems") - 1, true);
          setGems(getState("gems") + 1, true);
          console.log("ターゲットはジェムを落とした");
        }
        break;
        // ジェムを奪う
      case "grab":
        if (getState("gems") > 0) {
          player.setState("gems", player.getState("gems") + 1, true);
          setGems(getState("gems") - 1, true);
          console.log("ジェムを取得した");
        } else {
          console.log("ジェムはなくなっていた");
          success = false;
        }
        break;
      case "shield":
        console.log("Shield");
        player.setState("shield", true, true);
        break;
      default:
        break;
    }
    setActionSuccess(success, true);
  };

  const removePlayerCard = () => {
    console.log('removePlayerCardを実行')
    const player = players[getState("playerTurn")];
    const cards = player.getState("cards"||[]);
    const selectedCard = player.getState("selectedCard");
    cards.splice(selectedCard, 1);
    player.setState("cards", cards, true);
    
  };
  //  現在ターン中の プレイヤーが選択したカードをかえす
  const getCard = () => {
    // 通信Errorなどで取得できなかった場合のためのハンドリング
    const player = players[getState("playerTurn")];
    if (!player) {
      return "";
    }
    const cards = player.getState("cards");
    if (!cards) {
      return "";
    }
    const selectedCard = player.getState("selectedCard");
    return cards[selectedCard];
  };

  const phaseEnd = () => {
    let newTime = 0;
    // 現在のフェーズ別の処理
    switch (getState("phase")) {
      case "cards":
        // 選択したカードがパンチの場合
        if (getCard() === "punch") {
          // phaseをプレイヤーチョイスに変更し制限時間をセットする
          setPhase("playerChoice", true);
          newTime = TIME_PHASE_PLAYER_CHOICE;
        } else {
          // パンチ以外の場合はアクションを実行しフェーズと時間を切り替える
          performPlayerAction();
          setPhase("playerAction", true);
          newTime = TIME_PHASE_PLAYER_ACTION;
        }
        break;
        // パンチからはここを通る
      case "playerChoice":
        // アクションを実行しフェーズとタイマーを変更
        performPlayerAction();
        setPhase("playerAction", true);
        newTime = TIME_PHASE_PLAYER_ACTION;
        break;
      case "playerAction":
        removePlayerCard();
        // playersは参加人数、playerTurnは現在のプレイヤーのindex,+1して%すると最後のプレイヤーになると0になりループできる(レングスで割り切れると０になるのを利用してindexをゼロにする)
        const newPlayerTurn = (getState("playerTurn") + 1) % players.length;

        // 次のプレイヤーとこのラウンドのplayerStartが同じインデックスなら次のラウンドへの処理を始める(このラウンド最後のプレイヤーなので)
        if (newPlayerTurn === getState("playerStart")) {
          // 最終ラウンドの場合
          if (getState("round") === NB_ROUNDS) {
            // ゲーム終了後の処理
            console.log("ゲーム終了");
            // playerのジェムを順番にmaxGemsに代入することで一番ジェムが多いプレイヤーを特定する
            let maxGems = 0;
            players.forEach((player) => {
              if (player.getState("gems") > maxGems) {
                maxGems = player.getState("gems");
              }
            });
            // ↑ここでmaxGemsを決定し↓で対象のプレイヤーをwinnerにする
            players.forEach((player) => {
              player.setState(
                "winner",
              
                player.getState("gems") === maxGems,
                true
              );
              // カードをからにする
              player.setState("cards", [], true);
            });
            setPhase("end", true);
          // 次のラウンドへ
          } else {
            // NEXT ROUND
            console.log("次のラウンドへ");
            // playerStartを更新
            const newPlayerStart =
              (getState("playerStart") + 1) % players.length; 
            setPlayerStart(newPlayerStart, true);
            setPlayerTurn(newPlayerStart, true);
            setRound(getState("round") + 1, true);
            // カードを一枚配る
            distributeCards(1); 
            setPhase("cards", true);
            newTime = TIME_PHASE_CARDS;
          }
        } else {
          // ラウンドの途中の場合は次のプレイヤーへターンをまわす
          // カードは選択済みなのでpunchかplayerActionへ
          console.log("次のプレイヤーへ");
          setPlayerTurn(newPlayerTurn, true);
          if (getCard() === "punch") {
            setPhase("playerChoice", true);
            newTime = TIME_PHASE_PLAYER_CHOICE;
          } else {
            performPlayerAction();
            setPhase("playerAction", true);
            newTime = TIME_PHASE_PLAYER_ACTION;
          }
        }
        break;
      default:
        break;
    }
    setTimer(newTime, true);
  };

  // Lava を使って表示する
  const { paused } = useControls({
    paused: false,
  });

  // 再レンダリングの影響をうけない
  const timerInterval = useRef();

  const runTimer = () => {
    timerInterval.current = setInterval(() => {
      // host以外は無視する
      if (!isHost()) return;
      // Levaで停止している
      if (paused) return;
      // -1ずつカウントダウン
      let newTime = getState("timer") - 1;
      console.log("Timer", newTime);

      if (newTime <= 0) {
        phaseEnd();
      } else {
        setTimer(newTime, true);
      }
    }, 1000);
  };

  

  const clearTimer = () => {
    clearInterval(timerInterval.current);
  };

  useEffect(() => {
    runTimer();
    // リセット
    return clearTimer;
  }, [phase, paused]);

  return (
    <GameEngineContext.Provider
      value={{
        ...gameState,
        startGame,
        getCard,
      }}
    >
      {children}
    </GameEngineContext.Provider>
  );
};

export const useGameEngine = () => {
  const context = React.useContext(GameEngineContext);
  if (context === undefined) {
    throw new Error("useGameEngine must be used within a GameEngineProvider");
  }
  return context;
};