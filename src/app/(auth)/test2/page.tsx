"use client";
import { useRouter } from "next/navigation";

function Test2Page() {
  const router = useRouter();
  return (
    <div>
      <h2>Test for navigation</h2>
      <button onClick={router.back}> {`<-`} Back</button>
    </div>
  );
}

export default Test2Page;
