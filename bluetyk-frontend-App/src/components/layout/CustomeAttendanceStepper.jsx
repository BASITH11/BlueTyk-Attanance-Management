  import React from "react";
  import { Group, Tooltip, Box } from "@mantine/core";

  const colors = {
    in: "green",
    worked: "blue",
    stillWorking: "orange",
    out: "teal",
    pending: "red",
  };

  export default function CustomAttendanceStepper({ row }) {
    return (
      <Group spacing="sm" align="center" sx={{ flexWrap: "nowrap" }}>
        {[
          { key: "in", color: colors.in, label: row.in_time },
          { key: "line1", color: "#ccc", isLine: true },
          {
            key: "worked",
            color:
              row.worked_duration === "Still Working"
                ? colors.stillWorking
                : colors.worked,
            label: row.worked_duration ?? "—",
          },
          { key: "line2", color: "#ccc", isLine: true },
          {
            key: "out",
            color:
              row.out_time === "Not Outed" ? colors.pending : colors.out,
            label: row.out_time === "Not Outed" ? "Pending" : row.out_time,
          },
        ].map((item) =>
          item.isLine ? (
            <Box
              key={item.key}
              sx={{ flex: 1, height: 2, backgroundColor: item.color }}
            />
          ) : (
            <Tooltip key={item.key} label={item.label} position="top">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: item.color,
                  border: "1px solid #000",
                }}
              />
            </Tooltip>
          )
        )}
      </Group>
    );
  }
