import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
} from "react-native";
import {
  getAvatarUri,
  getAvatarColor,
  getInitial,
} from "../../src/utils/avatar";

interface UserAvatarProps {
  avatarUrl?: string | null;
  name?: string | null;
  size?: number;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  fontSize?: number;
  onPress?: () => void;
}

export default function UserAvatar({
  avatarUrl,
  name,
  size = 80,
  style,
  textStyle,
  fontSize,
  onPress,
}: UserAvatarProps) {
  const [imageError, setImageError] = useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const resolvedUri = getAvatarUri(avatarUrl);
  const showImage = Boolean(resolvedUri) && !imageError;

  const initial = getInitial(name);
  const backgroundColor = getAvatarColor(name);
  const computedFontSize = fontSize || Math.round(size * 0.42);

  const containerDimension = {
    width: size,
    height: size,
    borderRadius: size / 2,
  };

  const ContainerComponent = onPress ? TouchableOpacity : View;
  const containerProps = onPress ? { onPress, activeOpacity: 0.8 } : {};

  if (showImage && resolvedUri) {
    return (
      <ContainerComponent
        {...containerProps}
        style={[styles.baseContainer, containerDimension, style]}
      >
        <Image
          source={{ uri: resolvedUri }}
          style={[styles.image, containerDimension]}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      </ContainerComponent>
    );
  }

  return (
    <ContainerComponent
      {...containerProps}
      style={[
        styles.baseContainer,
        containerDimension,
        { backgroundColor },
        style,
      ]}
    >
      <Text
        style={[
          styles.initialText,
          {
            fontSize: computedFontSize,
            lineHeight: computedFontSize * 1.25,
          },
          textStyle,
        ]}
      >
        {initial}
      </Text>
    </ContainerComponent>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  image: {
    backgroundColor: "#E2E8F0",
  },
  initialText: {
    color: "#FFFFFF",
    fontWeight: "800",
    textAlign: "center",
  },
});
