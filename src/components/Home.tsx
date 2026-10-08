"use client";

import Stories from "./Stories";
import Hero from "./Hero";
import Marquee from "./Marquee";
import ReelsRow from "./ReelsRow";
import BagShowcase from "./BagShowcase";
import Catalog from "./Catalog";
import HowTo from "./HowTo";
import InstaCta from "./InstaCta";

export default function Home({ q, clearSearch }: { q: string; clearSearch: () => void }) {
  const searching = q.trim().length > 0;
  return (
    <>
      {!searching && (
        <>
          <Stories />
          <Hero />
          <Marquee />
          <BagShowcase />
          <ReelsRow />
        </>
      )}
      <Catalog q={q} clearSearch={clearSearch} />
      {!searching && (
        <>
          <HowTo />
          <InstaCta />
        </>
      )}
    </>
  );
}
