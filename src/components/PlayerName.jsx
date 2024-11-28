import { Billboard, Text } from "@react-three/drei";

export const PlayerName = ({ name = "", fontSize = 0.2, ...props }) => (
  // propsで追加のプロパティを渡せる
  <Billboard {...props}>
    <Text
      anchorY={"bottom"}
      fontSize={fontSize}
      font="/fonts/RobotoSlab-Bold.ttf"
      style={{ fontWeight: 'bold' }}
    >
      {name}
    </Text>
  </Billboard>
);
