import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Keyboard, Platform } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import Feather from "@expo/vector-icons/Feather";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Ionicons from "@expo/vector-icons/Ionicons";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
} from "react-native-reanimated";
import { useUnreadMessages } from "../../src/context/UnreadMessagesContext";
import { useTheme } from "../../src/context/ThemeContext";

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity);

const ProviderCustomNavBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { unreadMessageCount } = useUnreadMessages();
  const { colors, isDark } = useTheme();
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  const activeColor = isDark ? "#FFFFFF" : colors.primary;
  const inactiveColor = isDark ? colors.textSecondary : "#FFFFFF";
  const bubbleColor = isDark ? colors.primary : "#FFFFFF";
  const activeTextColor = isDark ? "#FFFFFF" : colors.primary;

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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.navBar,
          borderColor: colors.navBarBorder,
          borderWidth: isDark ? 1 : 0,
        },
      ]}
    >
      {state.routes.map((route, index) => {
        if (["_sitemap", "+not-found"].includes(route.name)) return null;

        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
              ? options.title
              : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <AnimatedTouchableOpacity
            layout={LinearTransition.springify().mass(0.5)}
            key={route.key}
            onPress={onPress}
            style={[
              styles.tabItem,
              { backgroundColor: isFocused ? bubbleColor : "transparent" },
            ]}
          >
            <View style={styles.iconWrapper}>
              {getIconByRouteName(
                route.name,
                isFocused ? activeColor : inactiveColor,
              )}
              {route.name === "message" && unreadMessageCount > 0 && (
                <View style={[styles.badge, { borderColor: colors.navBar }]}>
                  <Text style={styles.badgeText}>
                    {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
                  </Text>
                </View>
              )}
            </View>
            {isFocused && (
              <Animated.Text
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(200)}
                style={[styles.text, { color: activeTextColor }]}
              >
                {label as string}
              </Animated.Text>
            )}
          </AnimatedTouchableOpacity>
        );
      })}
    </View>
  );

  function getIconByRouteName(routeName: string, color: string) {
    switch (routeName) {
      case "jobs":
        return <Feather name="briefcase" size={18} color={color} />;
      case "tasks":
        return <Ionicons name="clipboard-outline" size={19} color={color} />;
      case "message":
        return <Feather name="message-square" size={18} color={color} />;
      case "profile":
        return <FontAwesome6 name="circle-user" size={18} color={color} />;
      default:
        return <Feather name="briefcase" size={18} color={color} />;
    }
  }
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#0052CC",
    width: "88%",
    alignSelf: "center",
    bottom: 30,
    borderRadius: 40,
    paddingHorizontal: 8,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  tabItem: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 38,
    paddingHorizontal: 12,
    borderRadius: 24,
  },
  iconWrapper: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    color: "#0052CC",
    marginLeft: 6,
    fontWeight: "700",
    fontSize: 12,
  },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
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

export default ProviderCustomNavBar;
