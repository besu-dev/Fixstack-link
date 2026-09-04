import { Tabs } from "expo-router";
import ProviderCustomNavBar from "@/components/NavBar/ProviderCustomNavBar";

export default function ProviderTabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <ProviderCustomNavBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="jobs"
        options={{
          title: "Jobs",
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
        }}
      />
      <Tabs.Screen
        name="message"
        options={{
          title: "Inbox",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Tabs>
  );
}
