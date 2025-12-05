import React from "react";

export default function Header() {
  return (
    <header className="w-full py-6 flex flex-col items-center text-center">
      <img
        src="/gti.png"
        alt="GTI Studios"
        className="w-16 h-16 mb-2 opacity-90"
      />
      <h1 className="text-3xl font-bold tracking-wide">GTI STUDIOS</h1>
      <p className="text-indigo-300 text-sm mt-1">
        AnimTrack AI — Pipeline Control Panel
      </p>
    </header>
  );
}
