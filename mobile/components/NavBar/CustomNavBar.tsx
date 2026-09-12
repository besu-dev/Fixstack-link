import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Keyboard, Platform } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useUnreadMessages } from "../../src/context/UnreadMessagesContext";
import { useTheme } from "../../src/context/ThemeContext";

const TAB_ITEM_SIZE = 44;

function getIcon(name: string, color: string) {
  switch (name) {
    case "index":
    case "home":
      return <Feather name="home" size={20} color={color} />;
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
  activeColor: string;
  inactiveColor: string;
  bubbleColor: string;
  badgeBorderColor: string;
}

function TabButton({
  routeName,
  isFocused,
  onPress,
  badgeCount,
  activeColor,
  inactiveColor,
  bubbleColor,
  badgeBorderColor,
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
      <Animated.View
        style={[
          styles.tabItemView,
          { backgroundColor: bubbleColor },
          rTabItemViewStyle,
        ]}
      />
      <Animated.View style={rIconStyle}>
        {getIcon(routeName, isFocused ? activeColor : inactiveColor)}
      </Animated.View>
      {badgeCount !== undefined && badgeCount > 0 && (
        <View style={[styles.badge, { borderColor: badgeBorderColor }]}>
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
  const { colors, isDark } = useTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const activeColor = isDark ? "#FFFFFF" : colors.primary;
  const inactiveColor = isDark ? colors.textSecondary : "#FFFFFF";
  const bubbleColor = isDark ? colors.primary : "#FFFFFF";
  const badgeBorderColor = colors.navBar;

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const showSub = Keyboard.addListener(showEvent, () => {
      setKeyboardVisible(true);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardVisible(false);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Hide the floating tab bar completely when keyboard is open or when screen requests tabBarStyle: { display: 'none' }
  const focusedRoute = state.routes[state.index];
  const focusedDescriptor = descriptors[focusedRoute.key];
  const focusedOptions = focusedDescriptor?.options;
  const tabBarStyle = StyleSheet.flatten(focusedOptions?.tabBarStyle) as any;

  if (isKeyboardVisible || tabBarStyle?.display === "none") {
    return null;
  }

  const bottomOffset = insets.bottom > 0 ? insets.bottom + 8 : 20;

  return (
    <View
      style={[
        styles.container,
        {
          bottom: bottomOffset,
          backgroundColor: colors.navBar,
          borderColor: colors.navBarBorder,
          borderWidth: isDark ? 1 : 0,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        if (["_sitemap", "+not-found", "services"].includes(route.name)) {
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
            activeColor={activeColor}
            inactiveColor={inactiveColor}
            bubbleColor={bubbleColor}
            badgeBorderColor={badgeBorderColor}
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
    backgroundColor: "#0052CC",
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
    backgroundColor: "#FFFFFF",
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
    borderColor: "#0052CC",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9,
    fontWeight: "800",
  },
});
