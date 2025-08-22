import React from "react";
import { ScrollArea, Flex, ThemeIcon, Box, Badge, Text } from "@mantine/core";
import { IconCheck, IconClock, IconX } from "@tabler/icons-react";

const AttendanceTimeLine = ({ in_time, out_time, worked_duration }) => {
  return (
    <ScrollArea type="auto" style={{ width: "100%" }}>
      <Flex
        align="center"
        gap="sm"
        style={{
          minWidth: 250,
          flexWrap: "nowrap",
          padding: "4px 0",
        }}
      >
        {/* In-Time Section */}
        <Flex direction="column" align="center" style={{ zIndex: 2 }}>
          <ThemeIcon
            radius="xl"
            size="sm"
            color={in_time ? "blue" : "gray"}
            variant={in_time ? "filled" : "light"}
          >
            {in_time ? <IconCheck size={14} /> : <IconClock size={14} />}
          </ThemeIcon>
          <Text size="xs" mt={2} fw={500}>
            {in_time || "Not Checked In"}
          </Text>
          <Text size="xs" c="dimmed">
            In
          </Text>
        </Flex>

        {/* Progress Line */}
        <Box
          style={{
            flex: 1,
            height: 2,
            background: "linear-gradient(90deg, #20c997, #228be6)",
          }}
        />

        {/* Duration Center Badge */}
        <Flex direction="column" align="center" style={{ zIndex: 2 }}>
          <Badge
            variant="filled"
            color={worked_duration ? "blue" : "gray"}
            radius="sm"
            style={{ minWidth: 60, textAlign: "center" }}
          >
            {worked_duration || "Not Outed"}
          </Badge>
        </Flex>

        {/* Progress Line */}
        <Box
          style={{
            flex: 1,
            height: 2,
            background:
              out_time && out_time !== "Not Outed"
                ? "linear-gradient(90deg, #228be6, #e64980)"
                : "linear-gradient(90deg, #20c997, #228be6)",
          }}
        />

        {/* Out-Time Section */}
        <Flex direction="column" align="center" style={{ zIndex: 2 }}>
          <ThemeIcon
            radius="xl"
            size="sm"
            color={
              !out_time || out_time === "Not Outed"
                ? "red"
                : out_time === "Still Working"
                ? "green"
                : "green"
            }
            variant="filled"
          >
            {!out_time || out_time === "Not Outed" ? (
              <IconX size={14} />
            ) : out_time === "Still Working" ? (
              <IconClock size={14} />
            ) : (
              <IconCheck size={14} />
            )}
          </ThemeIcon>
          <Text size="xs" mt={2} fw={500}>
            {out_time || "Not Outed"}
          </Text>
          <Text size="xs" c="dimmed">
            Out
          </Text>
        </Flex>
      </Flex>
    </ScrollArea>
  );
};

export default AttendanceTimeLine;
