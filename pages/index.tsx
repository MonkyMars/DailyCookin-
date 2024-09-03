import type { NextPage } from "next";
import Head from "next/head";
import Cooking from './cooking'
const Home: NextPage = () => {
  return (
    <>
    <Head>
      <title>What's Cookin'</title>
      <link rel="icon" href="/icons/chef.webp"></link>
      <meta name="description" content="Need a recipe? Got some ingredients but don't know what to do with them? What's Cookin' got you covered!"/>
    </Head>
      <Cooking/>
    </>
  );
};

export default Home;
