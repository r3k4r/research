'use client'
import Navbar from "@/components/Navbar";

import { signOut } from "next-auth/react";


export default function Home() {
 
  return (
   <>
    <Navbar />
   <button onClick={signOut}>
      logout
   </button>
   home
   </>
  );
}
