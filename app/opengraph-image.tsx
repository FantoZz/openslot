import { ImageResponse } from "next/og";

export const alt = "OpenSlot — планувальник зустрічей MATAS University";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "72px 84px",
          background: "#f7f8f4",
          color: "#13231d",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "850px",
          }}
        >
          <div
            style={{
              display: "flex",
              color: "#426bbd",
              fontSize: "28px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            MATAS University
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "34px",
              fontSize: "84px",
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            OpenSlot
          </div>
          <div
            style={{
              display: "flex",
              marginTop: "28px",
              fontSize: "38px",
              lineHeight: 1.25,
              color: "#53655e",
            }}
          >
            Оберіть зручний час і забронюйте зустріч
          </div>
        </div>
        <div
          style={{
            width: "178px",
            height: "178px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "50%",
            background: "#426bbd",
            color: "#ffffff",
            fontSize: "92px",
            fontWeight: 800,
          }}
        >
          M
        </div>
      </div>
    ),
    size,
  );
}
