'use client'
// import { useSession } from 'next-auth/react'

import { signOut } from "next-auth/react";


export default function Home() {
  // const { data: session } = useSession()
  // console.log('session', session);
  return (
   <>

   <button onClick={signOut}>
      logout
   </button>
   home
   </>
  );
}
