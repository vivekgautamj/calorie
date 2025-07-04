import Link from "next/link";

export default function Home() {
  return (
    <>
      <div>
        <h1>Home</h1>
      </div>
      <div>
        Go to <Link href="/login">login</Link> or{" "}
        <Link href="/dashboard">dashboard</Link>
      </div>
    </>
  );
}
