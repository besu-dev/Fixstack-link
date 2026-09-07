import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUnreadMessages } from "../../src/context/UnreadMessagesContext";

const PRIMARY_COLOR = "#0052CC";
const SECONDARY_COLOR = "#FFFFFF";
const TAB_ITEM_SIZE = 44;

function getIcon(name: string, color: string) {
  switch (name) {
    case "index":
    case "home":
      return <Feather name="home" size={20} color={color} />;
    case "services":
      return <Feather name="grid" size={20} color={color} />;
    case "post":
      return <Feather name="plus-circle" size={22} color={color} />;
    case "orders":
      return <Feather name="clipboard" size={20} color={color} />;
    case "message":
      return <Feather name="message-square" size={20} color={color} />;
    case "profile":
      return <Feather name="user" size={20} color={color} />;
    default:
      return <Feather name="circle" size={18} color={color} />;
  }
}

interface TabButtonProps {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
  badgeCount?: number;
}

function TabButton({
  routeName,
  isFocused,
  onPress,
  badgeCount,
}: TabButtonProps) {
  const rTabItemViewStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(isFocused ? 1 : 0) }],
    opacity: withTiming(isFocused ? 1 : 0),
  }));

  const rIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: withTiming(isFocused ? 1.1 : 1) }],
  }));

  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.tabItem}
      activeOpacity={0.8}
    >
      <Animated.View style={[styles.tabItemView, rTabItemViewStyle]} />
      <Animated.View style={rIconStyle}>
        {getIcon(routeName, isFocused ? PRIMARY_COLOR : SECONDARY_COLOR)}
      </Animated.View>
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {badgeCount > 9 ? "9+" : badgeCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function CustomNavBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { unreadMessageCount } = useUnreadMessages();
  const bottomOffset = insets.bottom > 0 ? insets.bottom + 8 : 20;

  return (
    <View style={[styles.container, { bottom: bottomOffset }]}>
      {state.routes.map((route, index) => {
        if (["_sitemap", "+not-found"].includes(route.name)) {
          return null;
        }

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabButton
            key={route.key}
            routeName={route.name}
            isFocused={isFocused}
            onPress={onPress}
            badgeCount={
              route.name === "message" ? unreadMessageCount : undefined
            }
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    position: "absolute",
    bottom: 24,
    backgroundColor: PRIMARY_COLOR,
    width: "92%",
    alignSelf: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 100,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  tabItem: {
    justifyContent: "center",
    alignItems: "center",
    width: TAB_ITEM_SIZE,
    height: TAB_ITEM_SIZE,
    position: "relative",
  },
  tabItemView: {
    position: "absolute",
    width: TAB_ITEM_SIZE,
    height: TAB_ITEM_SIZE,
    borderRadius: TAB_ITEM_SIZE / 2,
    backgroundColor: SECONDARY_COLOR,
  },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#DC2626",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: PRIMARY_COLOR,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
});
