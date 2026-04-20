import { useEffect, useState } from "react";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";

export function useAnonymousAuth() {
  const [anonUser, setAnonUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAnonUser(user);
      } else {
        const cred = await signInAnonymously(auth);
        setAnonUser(cred.user);
      }
    });
    return () => unsub();
  }, []);

  return { anonUser };
}
