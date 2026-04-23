"use client";

import { QRCode } from "react-qrcode-logo";

export default function QRTestPage() {
  const target = "https://hack4us.ca/p/12312312312312312";

  return <QRCode value={target} logoImage={"/hack4us.svg"} size={400} />;
}